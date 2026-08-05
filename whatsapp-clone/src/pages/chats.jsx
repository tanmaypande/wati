import { useCallback, useEffect, useState } from "react";
import { listContacts } from "../services/contactsApi";
import { assignAgent, closeConversation, createConversation, getConversation, listAgents, listConversations } from "../services/conversationsApi";
import "../styles/Chats.css";

function Chats() {
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ contactId: "", assignedToId: "" });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadConversations = useCallback(async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const data = await listConversations(query);
      setConversations(data || []);
      if (!data?.length) {
        setActiveConversationId(null);
        setActiveConversation(null);
      } else if (!data.some((conversation) => conversation.id === activeConversationId)) {
        setActiveConversationId(data[0].id);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to load conversations");
    } finally {
      setLoading(false);
    }
  }, [activeConversationId]);

  const loadContacts = useCallback(async () => {
    try {
      const data = await listContacts({ limit: 100 });
      setContacts(data?.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to load contacts");
    }
  }, []);

  const loadAgents = useCallback(async () => {
    try {
      const data = await listAgents();
      setAgents(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to load agents");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadConversations(search);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadConversations, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadContacts();
      void loadAgents();
      void loadConversations("");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAgents, loadContacts, loadConversations]);

  async function openConversation(conversationId) {
    setActiveConversationId(conversationId);
    setActiveConversation(null);
    try {
      const data = await getConversation(conversationId);
      setActiveConversation(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to open conversation");
    }
  }

  async function handleCreateConversation(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const created = await createConversation({
        contactId: form.contactId,
        assignedToId: form.assignedToId || null,
      });
      setConversations((current) => [created, ...current]);
      setActiveConversationId(created.id);
      setActiveConversation(created);
      setForm({ contactId: "", assignedToId: "" });
      setSuccess("Conversation created");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to create conversation");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCloseConversation(conversationId) {
    try {
      const updated = await closeConversation(conversationId);
      setConversations((current) => current.map((conversation) => (conversation.id === conversationId ? updated : conversation)));
      if (activeConversationId === conversationId) {
        setActiveConversation(updated);
      }
      setSuccess("Conversation closed");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to close conversation");
    }
  }

  async function handleAssignAgent(conversationId, assignedToId) {
    try {
      const updated = await assignAgent(conversationId, assignedToId || null);
      setConversations((current) => current.map((conversation) => (conversation.id === conversationId ? updated : conversation)));
      if (activeConversationId === conversationId) {
        setActiveConversation(updated);
      }
      setSuccess("Agent assigned");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to assign agent");
    }
  }

  return (
    <div className="chats-page">
      <div className="chat-sidebar">
        <div className="chat-list-header">
          <div>
            <h2>Conversations</h2>
            <p>Manage live customer conversations.</p>
          </div>
        </div>

        <form className="conversation-form" onSubmit={handleCreateConversation}>
          <h3>Create conversation</h3>
          <select
            className="form-select"
            value={form.contactId}
            onChange={(event) => setForm((current) => ({ ...current, contactId: event.target.value }))}
            required
          >
            <option value="">Select a contact</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name} • {contact.phone}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            value={form.assignedToId}
            onChange={(event) => setForm((current) => ({ ...current, assignedToId: event.target.value }))}
          >
            <option value="">Assign agent (optional)</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>

          <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create conversation"}
          </button>
        </form>

        <div className="search-box chat-search">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations"
          />
        </div>

        {error ? <div className="alert alert-danger mt-2">{error}</div> : null}
        {success ? <div className="alert alert-success mt-2">{success}</div> : null}

        {loading ? (
          <div className="empty-state">Loading conversations…</div>
        ) : conversations.length === 0 ? (
          <div className="empty-state">No conversations found.</div>
        ) : (
          <div className="chat-items">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`chat-item ${activeConversationId === conversation.id ? "active" : ""}`}
                type="button"
                onClick={() => void openConversation(conversation.id)}
              >
                <div className="chat-info">
                  <div className="chat-top">
                    <h4>{conversation.contact?.name || "Unknown contact"}</h4>
                    <span>{conversation.status}</span>
                  </div>
                  <div className="chat-bottom">
                    <p>{conversation.lastMessage?.content || "No messages yet"}</p>
                    <span className="unread-badge">{conversation.messageCount}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="chat-main">
        {activeConversation ? (
          <div className="conversation-detail">
            <div className="conversation-header">
              <div>
                <h3>{activeConversation.contact?.name}</h3>
                <p>{activeConversation.contact?.phone}</p>
              </div>
              <div className="conversation-actions">
                <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => void handleCloseConversation(activeConversation.id)}>
                  Close conversation
                </button>
              </div>
            </div>

            <div className="conversation-body">
              <div className="detail-card">
                <h4>Conversation details</h4>
                <p>Status: {activeConversation.status}</p>
                <p>Assigned agent: {activeConversation.assignedTo?.name || "Unassigned"}</p>
                <div className="mt-3">
                  <label className="form-label">Assign agent</label>
                  <select
                    className="form-select"
                    value={activeConversation.assignedTo?.id || ""}
                    onChange={(event) => void handleAssignAgent(activeConversation.id, event.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="detail-card">
                <h4>Messages</h4>
                {activeConversation.messages?.length ? (
                  activeConversation.messages.map((message) => (
                    <div key={message.id} className={`message-bubble ${message.sender === "AGENT" ? "sent" : "received"}`}>
                      <strong>{message.sender}</strong>
                      <p>{message.content}</p>
                      <small>{new Date(message.createdAt).toLocaleString()}</small>
                    </div>
                  ))
                ) : (
                  <p>No messages yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">Select a conversation to open it.</div>
        )}
      </div>
    </div>
  );
}

export default Chats;