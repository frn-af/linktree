import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'links.json');

export interface Link {
  id: string;
  title: string;
  url: string;
  order: number;
}

export async function getLinks(): Promise<Link[]> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading links:', error);
    return [];
  }
}

export async function saveLinks(links: Link[]): Promise<void> {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(links, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving links:', error);
    throw error;
  }
}
