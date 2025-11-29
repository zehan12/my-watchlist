import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        MONGODB_URI: z.string().url(),
        TMDB_API_KEY: z.string().min(1),
    },
    client: {
        // Add client-side variables here if needed
    },
    // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
    runtimeEnv: {
        MONGODB_URI: process.env.MONGODB_URI,
        TMDB_API_KEY: process.env.TMDB_API_KEY,
    },
});
