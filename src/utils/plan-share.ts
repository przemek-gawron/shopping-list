import { File, Paths } from 'expo-file-system';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';

import { Colors } from '@/constants/theme';

/** One day of a shared plan: its heading and the meals planned for it. */
export interface ShareDay {
  date: string;
  label: string;
  meals: { slot: string; recipe: string; servings?: string }[];
}

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A4 page (595×842 pt) of the plan; from 4 days on the days are laid out in two columns so a week fits on one page. */
function planHtml(title: string, range: string, days: ShareDay[]): string {
  const c = Colors.light;
  const columns = days.length >= 4 ? 2 : 1;
  const day = (d: ShareDay) => `
    <section class="day">
      <h2>${escape(d.label)}</h2>
      ${d.meals
        .map(
          (m) => `<div class="meal"><div class="slot">${escape(m.slot)}</div><div class="recipe">${escape(m.recipe)}${
            m.servings ? ` <span class="servings">${escape(m.servings)}</span>` : ''
          }</div></div>`,
        )
        .join('')}
    </section>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color: ${c.text}; margin: 0; padding: 40px; }
    h1 { font-size: 22px; margin: 0; }
    .range { color: ${c.textSecondary}; font-size: 13px; margin: 2px 0 14px; }
    .days { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 10px; align-items: start; }
    .day { break-inside: avoid; border: 1px solid ${c.surfaceCard}; border-radius: 10px; padding: 8px 10px; }
    h2 { font-size: 13px; color: ${c.tint}; margin: 0 0 4px; }
    .meal { padding: 3px 0; }
    .slot { font-size: 9px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: ${c.textSecondary}; }
    .recipe { font-size: 12px; font-weight: 600; }
    .servings { color: ${c.tint}; }
    footer { margin-top: 10px; font-size: 9px; color: ${c.textSecondary}; text-align: right; }
  </style></head><body>
    <h1>${escape(title)}</h1>
    <div class="range">${escape(range)}</div>
    <div class="days">${days.map(day).join('')}</div>
    <footer>Dishdeck</footer>
  </body></html>`;
}

/** Opens the share sheet for a generated file, renamed to `name` so the recipient sees e.g. `plan-2026-10-06.pdf`. */
async function shareFile(uri: string, name: string, mimeType: string, UTI: string, dialogTitle: string): Promise<void> {
  const target = new File(Paths.cache, name);
  if (target.exists) target.delete();
  new File(uri).move(target);
  await shareAsync(target.uri, { mimeType, UTI, dialogTitle });
}

/** Prints the plan to `plan-<first day>.pdf` and shares it. */
export async function sharePlanPdf(title: string, range: string, days: ShareDay[]): Promise<void> {
  const { uri } = await printToFileAsync({ html: planHtml(title, range, days), width: 595, height: 842 });
  await shareFile(uri, `plan-${days[0].date}.pdf`, 'application/pdf', 'com.adobe.pdf', title);
}

/** Shares a captured picture of the plan as `plan-<first day>.png`. */
export async function sharePlanImage(uri: string, title: string, firstDay: string): Promise<void> {
  await shareFile(uri, `plan-${firstDay}.png`, 'image/png', 'public.png', title);
}
