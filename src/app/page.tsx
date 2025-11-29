import WatchHistoryList from '@/components/WatchHistoryList';
import AddEntryButton from '@/components/AddEntryButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        <WatchHistoryList />
      </div>
      <AddEntryButton />
    </div>
  );
}
