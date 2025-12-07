import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WatchEntry from '@/models/WatchEntry';

export async function GET(request: Request) {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const rating = searchParams.get('rating');
    const mediaType = searchParams.get('mediaType');
    const search = searchParams.get('search');

    // Pagination params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

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
        const [total, entries, distinctYears] = await Promise.all([
            WatchEntry.countDocuments(query),
            WatchEntry.find(query)
                .sort({ watchedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            WatchEntry.aggregate([
                { $match: query },
                { $group: { _id: { $year: "$watchedAt" } } },
                { $count: "count" }
            ])
        ]);

        const yearCount = distinctYears.length > 0 ? distinctYears[0].count : 0;
        const yearString = yearCount === 1 ? 'year' : 'years';

        return NextResponse.json({
            data: entries,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            },
            summary: `A curated collection of ${total} films across ${yearCount} ${yearString}`
        });
    } catch (error) {
        console.error('Failed to fetch movies:', error);
        return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
    }
}
