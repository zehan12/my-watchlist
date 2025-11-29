import mongoose, { Schema, model, models } from 'mongoose';
import { IWatchEntry } from '@/types/WatchEntry';

export type { IWatchEntry };

const WatchEntrySchema = new Schema<IWatchEntry>(
    {
        tmdbId: { type: Number, required: true },
        title: { type: String, required: true },
        posterPath: { type: String },
        mediaType: { type: String, enum: ['movie', 'tv'], required: true },
        watchedAt: { type: Date, required: true },
        rating: { type: Number },
        review: { type: String },
        note: { type: String },
        status: {
            type: String,
            enum: ['completed', 'watching', 'plan_to_watch', 'dropped'],
            default: 'completed',
            required: true,
        },
        progress: { type: Number },
        totalEpisodes: { type: Number },
    },
    {
        timestamps: true, // Automatically manages createdAt and updatedAt
    }
);

// Prevent overwriting the model during hot reloading
const WatchEntry = models.WatchEntry || model<IWatchEntry>('WatchEntry', WatchEntrySchema);

export default WatchEntry;
