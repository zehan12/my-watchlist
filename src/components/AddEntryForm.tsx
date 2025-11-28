'use client';

import { useState } from 'react';
import { searchTMDB, addWatchEntry } from '@/app/actions';
import Image from 'next/image';

export default function AddEntryForm({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<any>(null);
    const [watchedAt, setWatchedAt] = useState(new Date().toISOString().split('T')[0]);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        try {
            const res = await searchTMDB(query);
            setResults(res);
        } catch (error) {
            console.error(error);
            alert('Error searching TMDB. Make sure API key is set.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMedia) return;

        await addWatchEntry({
            tmdbId: selectedMedia.id,
            title: selectedMedia.title || selectedMedia.name,
            posterPath: selectedMedia.poster_path,
            mediaType: selectedMedia.media_type,
            watchedAt: new Date(watchedAt),
            rating,
            review,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Add Watch Entry</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        ✕
                    </button>
                </div>

                {!selectedMedia ? (
                    <div>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search movies or TV shows..."
                                className="flex-1 bg-zinc-800 border-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </form>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {results.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedMedia(item)}
                                    className="text-left group relative aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition"
                                >
                                    {item.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                            alt={item.title || item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-zinc-500 p-2 text-center">
                                            No Poster
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                        <span className="text-white text-sm font-medium truncate w-full">
                                            {item.title || item.name}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-4 items-start bg-zinc-800/50 p-4 rounded-lg">
                            {selectedMedia.poster_path && (
                                <div className="relative w-20 aspect-[2/3] rounded overflow-hidden flex-shrink-0">
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${selectedMedia.poster_path}`}
                                        alt={selectedMedia.title || selectedMedia.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    {selectedMedia.title || selectedMedia.name}
                                </h3>
                                <p className="text-zinc-400 text-sm capitalize">
                                    {selectedMedia.media_type} •{' '}
                                    {(selectedMedia.release_date || selectedMedia.first_air_date)?.split('-')[0]}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSelectedMedia(null)}
                                    className="text-blue-400 text-sm hover:underline mt-2"
                                >
                                    Change Selection
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Date Watched</label>
                            <input
                                type="date"
                                value={watchedAt}
                                onChange={(e) => setWatchedAt(e.target.value)}
                                className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Rating (0-10)</label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Review (Optional)</label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                rows={3}
                                className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-zinc-300 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Save Entry
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
