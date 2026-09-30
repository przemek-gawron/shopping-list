/**
 * Plain text of a classic Word (.doc) file, read without native code or Node APIs so it runs on the
 * phone and in the converter script alike.
 *
 * A .doc is an OLE compound file (a small FAT-like file system). The text lives in the "WordDocument"
 * stream, cut into pieces that the "0Table"/"1Table" stream lists in reading order.
 */

const SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const END_OF_CHAIN = 0xfffffffe;
const FREE_SECTOR = 0xffffffff;

/** Windows-1252 characters 0x80–0x9f, which 8-bit text pieces use for quotes, dashes and the like. */
const CP1252: Record<number, string> = {
  0x82: '‚', 0x83: 'ƒ', 0x84: '„', 0x85: '…', 0x86: '†', 0x87: '‡',
  0x88: 'ˆ', 0x89: '‰', 0x8a: 'Š', 0x8b: '‹', 0x8c: 'Œ', 0x8e: 'Ž',
  0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–',
  0x97: '—', 0x98: '˜', 0x99: '™', 0x9a: 'š', 0x9b: '›', 0x9c: 'œ',
  0x9e: 'ž', 0x9f: 'Ÿ',
};

export function isDocFile(bytes: Uint8Array): boolean {
  return bytes.length > 512 && SIGNATURE.every((b, i) => bytes[i] === b);
}

/** Reads the named streams out of the compound file. */
function readStreams(bytes: Uint8Array, names: string[]): Record<string, Uint8Array | undefined> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u16 = (offset: number) => view.getUint16(offset, true);
  const u32 = (offset: number) => view.getUint32(offset, true);

  const sectorSize = 1 << u16(0x1e);
  const miniSectorSize = 1 << u16(0x20);
  const miniCutoff = u32(0x38);
  const sectorOffset = (sector: number) => (sector + 1) * sectorSize;
  const perSector = sectorSize / 4;

  // the list of sectors holding the FAT: 109 entries in the header, the rest in chained DIFAT sectors
  const fatSectors: number[] = [];
  for (let i = 0; i < 109; i++) {
    const sector = u32(0x4c + i * 4);
    if (sector !== FREE_SECTOR) fatSectors.push(sector);
  }
  for (let sector = u32(0x44), guard = 0; sector < END_OF_CHAIN && guard < 1000; guard++) {
    const base = sectorOffset(sector);
    for (let i = 0; i < perSector - 1; i++) {
      const entry = u32(base + i * 4);
      if (entry !== FREE_SECTOR) fatSectors.push(entry);
    }
    sector = u32(base + (perSector - 1) * 4);
  }

  const fat = (sector: number) => u32(sectorOffset(fatSectors[Math.floor(sector / perSector)]) + (sector % perSector) * 4);

  const chain = (start: number, next: (sector: number) => number, limit: number) => {
    const sectors: number[] = [];
    for (let sector = start; sector < END_OF_CHAIN && sectors.length < limit; sector = next(sector)) sectors.push(sector);
    return sectors;
  };
  const maxSectors = Math.ceil(bytes.length / sectorSize) + 1;

  const readChain = (start: number, size: number) => {
    const out = new Uint8Array(size);
    let written = 0;
    for (const sector of chain(start, fat, maxSectors)) {
      if (written >= size) break;
      const from = sectorOffset(sector);
      const length = Math.min(sectorSize, size - written);
      out.set(bytes.subarray(from, from + length), written);
      written += length;
    }
    return out;
  };

  // directory: 128-byte entries
  const directorySectors = chain(u32(0x30), fat, maxSectors);
  const entries: { name: string; start: number; size: number }[] = [];
  for (const sector of directorySectors) {
    for (let offset = sectorOffset(sector); offset < sectorOffset(sector) + sectorSize; offset += 128) {
      const nameLength = Math.max(0, u16(offset + 0x40) / 2 - 1);
      let name = '';
      for (let i = 0; i < nameLength && i < 31; i++) name += String.fromCharCode(u16(offset + i * 2));
      entries.push({ name, start: u32(offset + 0x74), size: u32(offset + 0x78) });
    }
  }

  // streams below the cutoff live in the "mini stream", which is itself stored in the root entry
  const root = entries[0];
  let miniStream: Uint8Array | null = null;
  let miniFat: Uint8Array | null = null;
  const readMini = (start: number, size: number) => {
    miniStream ??= readChain(root.start, root.size);
    miniFat ??= readChain(u32(0x3c), u32(0x40) * sectorSize);
    const table = new DataView(miniFat.buffer);
    const next = (sector: number) => (sector * 4 + 4 <= table.byteLength ? table.getUint32(sector * 4, true) : END_OF_CHAIN);
    const out = new Uint8Array(size);
    let written = 0;
    for (const sector of chain(start, next, Math.ceil(miniStream.length / miniSectorSize) + 1)) {
      if (written >= size) break;
      const from = sector * miniSectorSize;
      const length = Math.min(miniSectorSize, size - written);
      out.set(miniStream.subarray(from, from + length), written);
      written += length;
    }
    return out;
  };

  const result: Record<string, Uint8Array | undefined> = {};
  for (const name of names) {
    const entry = entries.find((e) => e.name === name);
    if (entry) result[name] = entry.size < miniCutoff ? readMini(entry.start, entry.size) : readChain(entry.start, entry.size);
  }
  return result;
}

/** Word's control characters: paragraph, cell and page marks become new lines; fields keep only their result. */
function clean(text: string): string {
  let out = text.replace(/[\x07\x0b\x0c\x0d]/g, '\n').replace(/\x1e/g, '-').replace(/\x1f/g, '');
  // a field is \x13 code \x14 result \x15 and may be nested; keep the result
  for (let previous = ''; previous !== out; ) {
    previous = out;
    out = out.replace(/\x13[^\x13\x14\x15]*\x14?([^\x13\x14\x15]*)\x15/g, '$1');
  }
  return out.replace(/[\x00-\x08]/g, '');
}

/** Body text of a .doc file, one paragraph per line. Throws when the file is not a Word document. */
export function extractDocText(bytes: Uint8Array): string {
  if (!isDocFile(bytes)) throw new Error('Not a .doc file');
  const { WordDocument: doc, '0Table': table0, '1Table': table1 } = readStreams(bytes, ['WordDocument', '0Table', '1Table']);
  if (!doc || doc.length < 0x1aa) throw new Error('No WordDocument stream');
  const docView = new DataView(doc.buffer);
  if (docView.getUint16(0, true) !== 0xa5ec) throw new Error('Not a Word document');

  const table = (docView.getUint16(0x0a, true) & 0x0200) !== 0 ? table1 : table0;
  if (!table) throw new Error('No table stream');
  const tableView = new DataView(table.buffer);

  const bodyLength = docView.getUint32(0x4c, true);
  // the CLX holds optional property blocks (type 1) followed by the piece table (type 2)
  let offset = docView.getUint32(0x1a2, true);
  const end = offset + docView.getUint32(0x1a6, true);
  while (offset < end && table[offset] === 0x01) offset += 3 + tableView.getUint16(offset + 1, true);
  if (offset >= end || table[offset] !== 0x02) throw new Error('No piece table');
  const size = tableView.getUint32(offset + 1, true);
  const base = offset + 5;
  const count = (size - 4) / 12;

  let text = '';
  for (let i = 0; i < count && text.length < bodyLength; i++) {
    const start = tableView.getUint32(base + i * 4, true);
    const length = tableView.getUint32(base + (i + 1) * 4, true) - start;
    const descriptor = base + (count + 1) * 4 + i * 8;
    const position = tableView.getUint32(descriptor + 2, true);
    const chars: string[] = [];
    if (position & 0x40000000) {
      // 8-bit piece
      const from = (position & 0x3fffffff) >>> 1;
      for (let c = 0; c < length; c++) {
        const code = doc[from + c];
        chars.push(CP1252[code] ?? String.fromCharCode(code));
      }
    } else {
      for (let c = 0; c < length; c++) chars.push(String.fromCharCode(docView.getUint16(position + c * 2, true)));
    }
    text += chars.join('');
  }
  return clean(text.slice(0, bodyLength));
}
