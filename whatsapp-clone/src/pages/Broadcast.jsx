import { useEffect, useState, useCallback } from "react";
import BroadcastFilters from "../components/broadcast/BroadcastFilters";
import BroadcastList from "../components/broadcast/BroadcastList";
import BroadcastModal from "../components/broadcast/BroadcastModal";
import EmptyBroadcast from "../components/broadcast/EmptyBroadcast";
import { listBroadcasts } from "../services/broadcastApi";

export default function Broadcast() {
  const [showModal, setShowModal] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadBroadcasts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listBroadcasts();
      setBroadcasts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load broadcasts", err);
      setError(err?.response?.data?.message || err.message || "Unable to load broadcasts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBroadcasts();
  }, [loadBroadcasts]);

  return (
    <div className="broadcast-page">
      <BroadcastFilters onNewBroadcast={() => setShowModal(true)} />

      {error ? <div className="alert alert-danger mx-3">{error}</div> : null}

      {loading ? (
        <div className="empty-state p-5 text-center">Loading broadcasts…</div>
      ) : broadcasts.length > 0 ? (
        <BroadcastList broadcasts={broadcasts} />
      ) : (
        <EmptyBroadcast onCreate={() => setShowModal(true)} />
      )}

      {showModal && (
        <BroadcastModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            void loadBroadcasts();
          }}
        />
      )}
    </div>
  );
}