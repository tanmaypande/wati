import BroadcastCard from './BroadcastCard';
import EmptyBroadcast from './EmptyBroadcast';
import LoadingBroadcast from './LoadingBroadcast';
import './BroadcastList.css';

export default function BroadcastList({
  broadcasts = [],
  loading = false,
  onCreate,
  onOpenDetails,
  onAction,
}) {
  if (loading) {
    return <LoadingBroadcast count={3} />;
  }

  if (!broadcasts || broadcasts.length === 0) {
    return <EmptyBroadcast onCreate={onCreate} />;
  }

  return (
    <section className="broadcast-list">
      {broadcasts.map((broadcast) => (
        <BroadcastCard
          key={broadcast.id || broadcast.name}
          broadcast={broadcast}
          onOpenDetails={onOpenDetails}
          onAction={onAction}
        />
      ))}
    </section>
  );
}
