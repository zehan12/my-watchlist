import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WatchEntry from '@/models/WatchEntry';
import { FilterQuery } from 'mongoose';

export async function GET(request: Request) {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const rating = searchParams.get('rating');
    const mediaType = searchParams.get('mediaType');
    const search = searchParams.get('search');

    const query: FilterQuery<typeof WatchEntry> = {};

    if (status) {
        query.status = status;
    }

    if (rating) {
        query.rating = { $gte: Number(rating) };
    }

    if (mediaType) {
        query.mediaType = mediaType;
    }

    if (search) {
        query.title = { $regex: search, $options: 'i' };
    }

    try {
        const entries = await WatchEntry.find(query).sort({ watchedAt: -1 }).lean();
        return NextResponse.json(entries);
    } catch (error) {
        console.error('Failed to fetch movies:', error);
        return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
    }
}
