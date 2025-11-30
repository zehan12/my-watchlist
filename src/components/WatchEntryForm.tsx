'use client';

import { useState, useEffect } from 'react';
import { searchTMDB } from '@/app/actions';
import { useAddEntry, useUpdateEntry } from '@/hooks/useWatchHistory';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDatePicker } from '@/components/calendar-date-picker';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Search, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IWatchEntry } from '@/types/WatchEntry';

interface WatchEntryFormProps {
    initialData?: IWatchEntry;
    isOpen: boolean;
    onClose: () => void;
}

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function WatchEntryForm({ initialData, isOpen, onClose }: WatchEntryFormProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<any>(null);
    const [watchedAt, setWatchedAt] = useState<Date | undefined>(new Date());
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [note, setNote] = useState('');
    const [status, setStatus] = useState<'completed' | 'watching' | 'plan_to_watch' | 'dropped'>('completed');
    const [progress, setProgress] = useState<number>(0);
    const [totalEpisodes, setTotalEpisodes] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const addEntry = useAddEntry();
    const updateEntry = useUpdateEntry();

    useEffect(() => {
        if (initialData) {
            setSelectedMedia({
                id: initialData.tmdbId,
                title: initialData.title,
                poster_path: initialData.posterPath,
                media_type: initialData.mediaType,
            });
            setWatchedAt(new Date(initialData.watchedAt));
            setRating(initialData.rating || 0);
            setReview(initialData.review || '');
            setNote(initialData.note || '');
            setStatus(initialData.status || 'completed');
            setProgress(initialData.progress || 0);
            setTotalEpisodes(initialData.totalEpisodes || 0);
        } else {
            // Reset form for new entry
            setQuery('');
            setResults([]);
            setSelectedMedia(null);
            setWatchedAt(new Date());
            setRating(0);
            setReview('');
            setNote('');
            setStatus('completed');
            setProgress(0);
            setTotalEpisodes(0);
        }
    }, [initialData, isOpen]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        try {
            const res = await searchTMDB(query);
            setResults(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        console.log('Form Submit Triggered');
        if (!selectedMedia || !watchedAt) {
            console.log('Validation failed: Missing selectedMedia or watchedAt');
            return;
        }

        const entryData = {
            tmdbId: selectedMedia.id,
            title: selectedMedia.title || selectedMedia.name,
            posterPath: selectedMedia.poster_path,
            mediaType: selectedMedia.media_type,
            watchedAt: watchedAt.toISOString(),
            rating,
            review,
            note,
            status,
            progress: selectedMedia.media_type === 'tv' ? progress : undefined,
            totalEpisodes: selectedMedia.media_type === 'tv' ? totalEpisodes : undefined,
        };

        console.log('Submitting Entry Data:', entryData);

        if (initialData && initialData._id) {
            console.log('Updating existing entry:', initialData._id);
            await updateEntry.mutateAsync({ id: initialData._id, data: entryData });
        } else {
            console.log('Adding new entry');
            await addEntry.mutateAsync(entryData);
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Entry' : 'Add Watch Entry'}</DialogTitle>
                </DialogHeader>

                {!selectedMedia ? (
                    <div className="space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search movies or TV shows..."
                                className="bg-zinc-900 border-zinc-800"
                            />
                            <Button type="submit" disabled={loading}>
                                {loading ? <span className="animate-spin">...</span> : <Search className="w-4 h-4" />}
                            </Button>
                        </form>

                        <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
                            {results.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedMedia(item)}
                                    className="text-left group relative aspect-2/3 bg-zinc-900 rounded-md overflow-hidden hover:ring-2 hover:ring-blue-500 transition"
                                >
                                    {item.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                            alt={item.title || item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-zinc-500 text-xs p-2 text-center">
                                            No Poster
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                        <span className="text-white text-xs font-medium truncate w-full">
                                            {item.title || item.name}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex gap-4 items-start bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                            {selectedMedia.poster_path && (
                                <div className="relative w-16 aspect-2/3 rounded overflow-hidden shrink-0">
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${selectedMedia.poster_path}`}
                                        alt={selectedMedia.title || selectedMedia.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{selectedMedia.title || selectedMedia.name}</h3>
                                <p className="text-zinc-400 text-sm capitalize">{selectedMedia.media_type}</p>
                                {!initialData && (
                                    <Button
                                        variant="link"
                                        className="px-0 text-blue-400 h-auto mt-1"
                                        onClick={() => setSelectedMedia(null)}
                                    >
                                        Change Selection
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Status</label>
                                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100 z-9999">
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="watching">Watching</SelectItem>
                                        <SelectItem value="plan_to_watch">Plan to Watch</SelectItem>
                                        <SelectItem value="dropped">Dropped</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Date Watched</label>
                                <CalendarDatePicker
                                    date={{ from: watchedAt, to: watchedAt }}
                                    onDateSelect={({ from }) => setWatchedAt(from)}
                                    variant="outline"
                                    numberOfMonths={1}
                                    className="w-full justify-start text-left font-normal bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100"
                                />
                            </div>
                        </div>

                        {selectedMedia.media_type === 'tv' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Episodes Watched</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={progress}
                                        onChange={(e) => setProgress(Number(e.target.value))}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Total Episodes</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={totalEpisodes}
                                        onChange={(e) => setTotalEpisodes(Number(e.target.value))}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Rating</label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={cn(
                                                "w-6 h-6 transition-colors",
                                                star <= rating ? "fill-yellow-500 text-yellow-500" : "text-zinc-700 hover:text-yellow-500/50"
                                            )}
                                        />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-zinc-500 font-medium w-8">
                                    {rating > 0 ? rating : '-'}
                                </span>
                            </div>
                        </div>
                        <div className='flex gap-4 w-full'>

                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Review</label>
                                <Textarea
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    className="bg-zinc-900 border-zinc-800 min-h-[100px]"
                                    placeholder="Write your thoughts..."
                                />
                            </div>

                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Private Note</label>
                                <Textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="bg-zinc-900 border-zinc-800 min-h-[80px]"
                                    placeholder="Add a private note..."
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={onClose} className="hover:bg-zinc-800 hover:text-zinc-100">
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {initialData ? 'Update Entry' : 'Save Entry'}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
