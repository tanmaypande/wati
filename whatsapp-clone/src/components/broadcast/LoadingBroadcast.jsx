import './LoadingBroadcast.css';

export default function LoadingBroadcast({ count = 3 }) {
  return (
    <div className="loading-broadcast">
      {Array.from({ length: count }).map((_, index) => (
        <div className="loading-broadcast__card" key={index}>
          <div className="loading-broadcast__title skeleton" />
          <div className="loading-broadcast__preview skeleton" />
          <div className="loading-broadcast__meta">
            <div className="loading-broadcast__pill skeleton" />
            <div className="loading-broadcast__pill skeleton" />
            <div className="loading-broadcast__pill skeleton" />
          </div>
          <div className="loading-broadcast__footer">
            <div className="loading-broadcast__pill skeleton" />
            <div className="loading-broadcast__pill skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}
