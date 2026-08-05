import { FaSearch } from "react-icons/fa";
import "../../styles/ChatList.css";

const chats = [
{
    id: 1,
    name: "Rahul Sharma",
    message: "Hello! I need help with my order.",
    time: "10:45 AM",
    unread: 2,
    avatar: "https://i.pravatar.cc/150?img=1",
},
{
    id: 2,
    name: "Priya Singh",
    message: "Thank you 😊",
    time: "09:30 AM",
    unread: 0,
    avatar: "https://i.pravatar.cc/150?img=2",
},
{
    id: 3,
    name: "Aman Verma",
    message: "Can you share the invoice?",
    time: "Yesterday",
    unread: 4,
    avatar: "https://i.pravatar.cc/150?img=3",
},
{
    id: 4,
    name: "Sneha Gupta",
    message: "Payment completed.",
    time: "Yesterday",
    unread: 1,
    avatar: "https://i.pravatar.cc/150?img=4",
},
];

function ChatList() {
return (
    <div className="chat-list">
      {/* Header */}
    <div className="chat-list-header">
        <h2>Chats</h2>
    </div>

      {/* Search */}
    <div className="search-box">
        <FaSearch className="search-icon" />
        <input type="text" placeholder="Search conversations..." />
    </div>

      {/* Filters */}
    <div className="chat-filters">
        <button className="active">All</button>
        <button>Unread</button>
    </div>

      {/* Chat Items */}
    <div className="chat-items">
        {chats.map((chat) => (
        <div className="chat-item" key={chat.id}>
            <img src={chat.avatar} alt={chat.name} className="chat-avatar" />

            <div className="chat-info">
            <div className="chat-top">
                <h4>{chat.name}</h4>
                <span>{chat.time}</span>
            </div>

            <div className="chat-bottom">
                <p>{chat.message}</p>

                {chat.unread > 0 && (
                <span className="unread-badge">{chat.unread}</span>
                )}
            </div>
            </div>
        </div>
        ))}
    </div>
    </div>
);
}

export default ChatList;
