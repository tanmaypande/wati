import { FaPaperclip, FaPaperPlane, FaSmile } from "react-icons/fa";
import "../../styles/ChatWindow.css";

function ChatWindow() {
return (
    <div className="chat-window">
      {/* Header */}
    <div className="chat-header">
        <div>
        <h3>Rahul Sharma</h3>
        <p>Online</p>
        </div>
    </div>

      {/* Messages */}
    <div className="chat-body">
        <div className="message received">
        <p>Hello 👋</p>
        <span>10:20 AM</span>
        </div>

        <div className="message sent">
        <p>Hi Rahul! How can I help you?</p>
        <span>10:21 AM</span>
        </div>

        <div className="message received">
        <p>I want to know my order status.</p>
        <span>10:22 AM</span>
        </div>

        <div className="message sent">
        <p>Sure! Please share your Order ID.</p>
        <span>10:23 AM</span>
        </div>
    </div>

      {/* Message Input */}
    <div className="chat-input">
        <button className="icon-btn">
        <FaSmile />
        </button>

        <button className="icon-btn">
        <FaPaperclip />
        </button>

        <input
        type="text"
        placeholder="Type a message..."
        />

        <button className="send-btn">
        <FaPaperPlane />
        </button>
    </div>
    </div>
);
}

export default ChatWindow;