import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WatchEntry from '@/models/WatchEntry';

export async function GET() {
    try {
        await connectDB();
        const entries = await WatchEntry.find({}).sort({ watchedAt: -1 });
        return NextResponse.json(entries);
    } catch (error) {
        console.error('Failed to fetch entries:', error);
        return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }
}
