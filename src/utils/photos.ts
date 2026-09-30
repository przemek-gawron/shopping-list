import { File, Paths } from 'expo-file-system';

import { generateId } from '@/utils/id-generator';

/** Photos are copied into the app's document directory; recipes keep only the file name. */
export function photoUri(name: string): string {
  return new File(Paths.document, name).uri;
}

/** Copies a picked image into app storage and returns the stored file name. */
export function savePhoto(sourceUri: string): string {
  const extension = sourceUri.split('?')[0].split('.').pop()?.toLowerCase();
  const name = `photo-${generateId()}.${extension && extension.length <= 4 ? extension : 'jpg'}`;
  new File(sourceUri).copy(new File(Paths.document, name));
  return name;
}

export function deletePhoto(name: string): void {
  try {
    const file = new File(Paths.document, name);
    if (file.exists) file.delete();
  } catch {
    // a photo that is already gone is fine
  }
}
