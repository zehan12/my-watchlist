export interface IWatchEntry {
    _id?: string;
    tmdbId: number;
    title: string;
    posterPath?: string;
    mediaType: 'movie' | 'tv';
    watchedAt: Date;
    rating?: number;
    review?: string;
    note?: string;
    status: 'completed' | 'watching' | 'plan_to_watch' | 'dropped';
    progress?: number;
    totalEpisodes?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
