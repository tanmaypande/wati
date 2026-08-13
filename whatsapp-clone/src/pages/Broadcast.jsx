import { useEffect, useState, useCallback, useMemo } from "react";
import BroadcastFilters from "../components/broadcast/BroadcastFilters";
import BroadcastList from "../components/broadcast/BroadcastList";
import BroadcastModal from "../components/broadcast/BroadcastModal";
import BroadcastDetails from "../components/broadcast/BroadcastDetails";
import EmptyBroadcast from "../components/broadcast/EmptyBroadcast";
import { listBroadcasts } from "../services/broadcastApi";

export default function Broadcast() {
  const [showModal, setShowModal] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDetails, setSelectedDetails] = useState(null);

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

  const filteredBroadcasts = useMemo(() => {
    return broadcasts.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const title = (b.title || b.name || '').toLowerCase();
      const msg = (b.message || '').toLowerCase();
      const matchesSearch = !q || title.includes(q) || msg.includes(q);
      const bStatus = b.status || 'Sent';
      const matchesStatus = statusFilter === 'All' || bStatus.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [broadcasts, searchQuery, statusFilter]);

  return (
    <div className="broadcast-page">
      <BroadcastFilters
        query={searchQuery}
        status={statusFilter}
        onSearch={setSearchQuery}
        onStatusChange={setStatusFilter}
        onCreate={() => setShowModal(true)}
        onNewBroadcast={() => setShowModal(true)}
      />

      {error ? <div className="alert alert-danger mx-3">{error}</div> : null}

      {loading ? (
        <div className="empty-state p-5 text-center">Loading broadcasts…</div>
      ) : filteredBroadcasts.length > 0 ? (
        <BroadcastList
          broadcasts={filteredBroadcasts}
          onCreate={() => setShowModal(true)}
          onOpenDetails={(b) => setSelectedDetails(b)}
          onAction={(b) => setSelectedDetails(b)}
        />
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

      {selectedDetails && (
        <BroadcastDetails
          broadcast={selectedDetails}
          onClose={() => setSelectedDetails(null)}
        />
      )}
    </div>
  );
}