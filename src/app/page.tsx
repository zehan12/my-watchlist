import { getWatchHistory } from '@/app/actions';
import AddEntryButton from '@/components/AddEntryButton';
import Image from 'next/image';

export default async function Home() {
  const history = await getWatchHistory();

  // Group by Year -> Month
  const groupedHistory = history.reduce((acc, entry) => {
    const date = new Date(entry.watchedAt);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });

    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];

    acc[year][month].push(entry);
    return acc;
  }, {} as Record<number, Record<string, typeof history>>);

  // Sort years descending
  const sortedYears = Object.keys(groupedHistory)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-black text-white p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Watch History
          </h1>
          <div className="text-zinc-400">
            {history.length} {history.length === 1 ? 'Entry' : 'Entries'}
          </div>
        </header>

        {history.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-xl">No movies or series tracked yet.</p>
            <p className="mt-2">Click the + button to add your first watch!</p>
          </div>
        ) : (
          <div className="space-y-16">
            {sortedYears.map((year) => (
              <div key={year}>
                <h2 className="text-3xl font-bold text-zinc-700 mb-8 border-b border-zinc-800 pb-2">
                  {year}
                </h2>
                <div className="space-y-12">
                  {Object.entries(groupedHistory[year]).map(([month, entries]) => (
                    <div key={month}>
                      <h3 className="text-xl font-semibold text-zinc-400 mb-4 pl-2 border-l-4 border-blue-600">
                        {month}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {entries.map((entry: any) => (
                          <div
                            key={entry.id}
                            className="group relative aspect-[2/3] bg-zinc-900 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-900/20"
                          >
                            {entry.posterPath ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w500${entry.posterPath}`}
                                alt={entry.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-zinc-600 p-4 text-center text-sm">
                                {entry.title}
                              </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                              <h4 className="font-bold text-white text-sm leading-tight mb-1">
                                {entry.title}
                              </h4>
                              <div className="flex items-center justify-between text-xs text-zinc-300">
                                <span className="capitalize">{entry.mediaType}</span>
                                {entry.rating && (
                                  <span className="flex items-center gap-1 text-yellow-400">
                                    ★ {entry.rating}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-zinc-500 mt-2">
                                {new Date(entry.watchedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <AddEntryButton />
    </div>
  );
}
