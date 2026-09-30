import type { DepartmentId } from '@/data/types';

export const DEPARTMENTS: { id: DepartmentId; emoji: string }[] = [
  { id: 'produce', emoji: '🥕' },
  { id: 'dairy', emoji: '🥛' },
  { id: 'meat', emoji: '🥩' },
  { id: 'bakery', emoji: '🍞' },
  { id: 'dry', emoji: '🍝' },
  { id: 'frozen', emoji: '🧊' },
  { id: 'drinks', emoji: '🧃' },
  { id: 'other', emoji: '📋' },
];

export const DEPARTMENT_EMOJI = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, d.emoji])) as Record<
  DepartmentId,
  string
>;

export const DEPARTMENT_ORDER = DEPARTMENTS.map((d) => d.id);
