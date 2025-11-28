import { getWatchHistory } from '@/app/actions';
import AddEntryButton from '@/components/AddEntryButton';
import WatchHistoryList from '@/components/WatchHistoryList';

export default async function Home() {
  const history = await getWatchHistory();

  return (
    <div className="min-h-screen bg-black text-white p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            My Watchlist
          </h1>
          <div className="text-zinc-400">
            {history.length} {history.length === 1 ? 'Entry' : 'Entries'}
          </div>
        </header>

        <WatchHistoryList initialHistory={history} />
      </div>
      <AddEntryButton />
    </div>
  );
}
