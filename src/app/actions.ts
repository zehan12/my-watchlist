'use server';

import { readCSV, writeCSV, type WatchEntry } from '@/db';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function searchTMDB(query: string) {
    if (!TMDB_API_KEY) {
        throw new Error('TMDB_API_KEY is not set');
    }

    const res = await fetch(
        `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
            query
        )}&include_adult=false`
    );

    if (!res.ok) {
        throw new Error('Failed to fetch from TMDB');
    }

    const data = await res.json();
    return data.results.filter(
        (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
    );
}

export async function addWatchEntry(data: Omit<WatchEntry, 'id' | 'createdAt'>) {
    const entries = await readCSV();
    const newEntry: WatchEntry = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        watchedAt: new Date(data.watchedAt).toISOString(), // Ensure ISO string
    };

    entries.push(newEntry);
    await writeCSV(entries);
    revalidatePath('/');
}

export async function getWatchHistory() {
    const entries = await readCSV();
    // Sort by watchedAt desc
    return entries.sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime());
}

export async function deleteWatchEntry(id: string) {
    const entries = await readCSV();
    const filtered = entries.filter((entry) => entry.id !== id);
    await writeCSV(filtered);
    revalidatePath('/');
}
