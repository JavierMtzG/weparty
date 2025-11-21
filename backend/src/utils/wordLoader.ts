import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface WordEntry {
  category: string;
  word: string;
  difficulty: string;
}

export async function loadWordsFromCsv(filePath: string): Promise<WordEntry[]> {
  const raw = await fs.readFile(filePath, 'utf-8');
  const records = parse(raw, { columns: true, delimiter: ';', skip_empty_lines: true }) as WordEntry[];
  return records;
}

export function getRandomWord(words: WordEntry[], category?: string, difficulty?: string): WordEntry {
  const filtered = words.filter((entry) => {
    const categoryOk = category ? entry.category === category : true;
    const difficultyOk = difficulty ? entry.difficulty === difficulty : true;
    return categoryOk && difficultyOk;
  });
  const pool = filtered.length > 0 ? filtered : words;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick;
}
