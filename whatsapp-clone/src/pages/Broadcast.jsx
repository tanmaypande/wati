import { useState } from "react";
import BroadcastFilters from "../components/broadcast/BroadcastFilters";
import BroadcastList from "../components/broadcast/BroadcastList";
import BroadcastModal from "../components/broadcast/BroadcastModal";
import EmptyBroadcast from "../components/broadcast/EmptyBroadcast";

export default function Broadcast() {
const [showModal, setShowModal] = useState(false);

  // Temporary dummy data
const broadcasts = [];

return (
    <div className="broadcast-page">
    <BroadcastFilters onNewBroadcast={() => setShowModal(true)} />

    {broadcasts.length > 0 ? (
        <BroadcastList broadcasts={broadcasts} />
    ) : (
        <EmptyBroadcast onCreate={() => setShowModal(true)} />
    )}

    {showModal && (
        <BroadcastModal
          open={showModal}
          onClose={() => setShowModal(false)}
        />
    )}
    </div>
);
}