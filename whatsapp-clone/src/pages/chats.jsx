import { useCallback, useEffect, useState, useRef } from "react";
import { FiSend, FiCpu, FiUserCheck, FiMessageSquare } from "react-icons/fi";
import { listContacts } from "../services/contactsApi";
import {
  assignAgent,
  closeConversation,
  createConversation,
  getConversation,
  listAgents,
  listConversations,
  sendMessage,
  suggestAIReply,
} from "../services/conversationsApi";
import "../styles/chats.css";

function Chats() {
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ contactId: "", assignedToId: "" });
  
  // Manual message composer state
  const [messageText, setMessageText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

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

  async function handleSendManualMessage(event, sender = "AGENT") {
    if (event) event.preventDefault();
    if (!messageText || !messageText.trim() || !activeConversationId) return;

    setSendingMsg(true);
    setError("");
    try {
      const newMsg = await sendMessage(activeConversationId, messageText.trim(), sender);
      
      // Refresh active conversation to update message list & last message
      const updatedConv = await getConversation(activeConversationId);
      setActiveConversation(updatedConv);

      // Update in conversation list sidebar
      setConversations((current) =>
        current.map((c) => (c.id === activeConversationId ? { ...c, lastMessage: newMsg, updatedAt: new Date() } : c))
      );

      setMessageText("");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to send message");
    } finally {
      setSendingMsg(false);
    }
  }

  async function handleGetAISuggestion() {
    if (!activeConversationId) return;
    setAiSuggesting(true);
    setError("");
    try {
      const data = await suggestAIReply(activeConversationId);
      if (data?.suggestion) {
        setMessageText(data.suggestion);
        setSuccess("AI response suggested! You can review or edit before sending.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to get AI suggestion");
    } finally {
      setAiSuggesting(false);
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
                    <span className={`status-tag status-${(conversation.status || '').toLowerCase()}`}>
                      {conversation.status}
                    </span>
                  </div>
                  <div className="chat-bottom">
                    <p>{conversation.lastMessage?.content || "No messages yet"}</p>
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
                <p>{activeConversation.contact?.phone} {activeConversation.contact?.email ? `• ${activeConversation.contact.email}` : ''}</p>
              </div>
              <div className="conversation-actions">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  type="button"
                  onClick={() => void handleCloseConversation(activeConversation.id)}
                >
                  Close conversation
                </button>
              </div>
            </div>

            <div className="conversation-body">
              <div className="detail-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4>Conversation Details</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>
                      Status: <strong>{activeConversation.status}</strong> • Assigned: <strong>{activeConversation.assignedTo?.name || "Unassigned"}</strong>
                    </p>
                  </div>
                  <div style={{ minWidth: '180px' }}>
                    <select
                      className="form-select form-select-sm"
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
              </div>

              <div className="detail-card chat-messages-card">
                <h4>Message Thread</h4>
                <div className="chat-messages-scroll">
                  {activeConversation.messages?.length ? (
                    activeConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message-bubble ${message.sender === "AGENT" ? "sent" : "received"}`}
                      >
                        <div className="message-sender-name">
                          {message.sender === "AGENT" ? "Agent" : activeConversation.contact?.name || "Customer"}
                        </div>
                        <p className="message-text">{message.content}</p>
                        <small className="message-time">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">No messages in this conversation yet. Send a message below!</div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Manual & AI Message Composer Bar */}
                <div className="chat-composer-section">
                  <div className="chat-composer-toolbar">
                    <button
                      type="button"
                      className="btn btn-ai-suggest"
                      onClick={handleGetAISuggestion}
                      disabled={aiSuggesting}
                      title="Generate AI response suggestion"
                    >
                      <FiCpu /> {aiSuggesting ? 'AI Thinking…' : '✨ AI Assistant Suggestion'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-sim-customer"
                      onClick={(e) => {
                        const testMsg = prompt("Simulate incoming customer message:", "Hello, I have a question about my order.");
                        if (testMsg) {
                          setMessageText(testMsg);
                          handleSendManualMessage(e, "CUSTOMER");
                        }
                      }}
                      title="Simulate receiving a message from customer"
                    >
                      📥 Simulate Customer Message
                    </button>
                  </div>

                  <form className="chat-composer-form" onSubmit={(e) => handleSendManualMessage(e, "AGENT")}>
                    <textarea
                      className="chat-composer-input"
                      rows="2"
                      placeholder="Type your message here (or use AI Assistant above)..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendManualMessage(e, "AGENT");
                        }
                      }}
                    />
                    <button
                      type="submit"
                      className="btn btn-send-message"
                      disabled={sendingMsg || !messageText.trim()}
                    >
                      <FiSend /> {sendingMsg ? 'Sending...' : 'Send'}
                    </button>
                  </form>
                </div>
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