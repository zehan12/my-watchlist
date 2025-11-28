import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const DB_PATH = path.join(process.cwd(), 'data.csv');

export interface WatchEntry {
    id: string;
    tmdbId: number;
    title: string;
    posterPath?: string;
    mediaType: 'movie' | 'tv';
    watchedAt: string; // ISO string
    rating?: number;
    review?: string;
    note?: string;
    status: 'completed' | 'watching' | 'plan_to_watch' | 'dropped';
    progress?: number;
    totalEpisodes?: number;
    createdAt: string; // ISO string
}

export async function readCSV(): Promise<WatchEntry[]> {
    try {
        const fileContent = await fs.readFile(DB_PATH, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
        });
        return records.map((record: any) => ({
            ...record,
            tmdbId: Number(record.tmdbId),
            rating: record.rating ? Number(record.rating) : undefined,
            progress: record.progress ? Number(record.progress) : undefined,
            totalEpisodes: record.totalEpisodes ? Number(record.totalEpisodes) : undefined,
            status: record.status || 'completed', // Default for migration
        }));
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

export async function writeCSV(data: WatchEntry[]) {
    const output = stringify(data, {
        header: true,
        columns: [
            'id',
            'tmdbId',
            'title',
            'posterPath',
            'mediaType',
            'watchedAt',
            'rating',
            'review',
            'note',
            'status',
            'progress',
            'totalEpisodes',
            'createdAt',
        ],
    });
    await fs.writeFile(DB_PATH, output);
}
