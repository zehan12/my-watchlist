'use server';

import connectDB from '@/lib/db';
import WatchEntry, { IWatchEntry } from '@/models/WatchEntry';
import { revalidatePath } from 'next/cache';

import { env } from '@/env';

const TMDB_API_KEY = env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function searchTMDB(query: string) {

    const res = await fetch(
        `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
            query
        )}&include_adult=false`
    );

    if (!res.ok) {
        throw new Error('Failed to fetch from TMDB');
    }

    const data = await res.json();
    const filtered = data.results.filter(
        (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
    );
    console.log(`Search for "${query}" returned ${filtered.length} results (raw: ${data.results.length})`);
    return filtered;
}

export async function addWatchEntry(data: Omit<IWatchEntry, '_id' | 'createdAt' | 'updatedAt'>) {
    await connectDB();
    try {
        const newEntry = await WatchEntry.create({
            ...data,
            watchedAt: new Date(data.watchedAt),
        });
        console.log('Added entry:', newEntry._id);
        revalidatePath('/');
        return JSON.parse(JSON.stringify(newEntry));
    } catch (error) {
        console.error('Failed to add entry:', error);
        throw new Error('Failed to add entry');
    }
}

export async function getWatchHistory() {
    await connectDB();
    try {
        const entries = await WatchEntry.find({}).sort({ watchedAt: -1 }).lean();
        return JSON.parse(JSON.stringify(entries));
    } catch (error) {
        console.error('Failed to get watch history:', error);
        return [];
    }
}

export async function deleteWatchEntry(id: string) {
    await connectDB();
    try {
        console.log('Deleting entry:', id);
        await WatchEntry.findByIdAndDelete(id);
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to delete entry:', error);
        throw new Error('Failed to delete entry');
    }
}

export async function updateWatchEntry(id: string, data: Partial<Omit<IWatchEntry, '_id' | 'createdAt' | 'updatedAt'>>) {
    await connectDB();
    try {
        console.log('Updating entry:', id);
        const updatedEntry = await WatchEntry.findByIdAndUpdate(
            id,
            { ...data, watchedAt: data.watchedAt ? new Date(data.watchedAt) : undefined },
            { new: true }
        ).lean();

        if (!updatedEntry) {
            throw new Error('Entry not found');
        }

        console.log('Updated Entry:', updatedEntry._id);
        revalidatePath('/');
        return JSON.parse(JSON.stringify(updatedEntry));
    } catch (error) {
        console.error('Failed to update entry:', error);
        throw new Error('Failed to update entry');
    }
}
