import {
FaPhoneAlt,
FaEnvelope,
FaMapMarkerAlt,
FaUserTie,
FaTag,
} from "react-icons/fa";

import "../../styles/CustomerInfo.css";

function CustomerInfo() {
return (
    <div className="customer-info">

      {/* Profile */}
    <div className="customer-profile">
        <img
        src="https://i.pravatar.cc/150?img=12"
        alt="Customer"
        className="customer-avatar"
        />

        <h2>Rahul Sharma</h2>
        <p className="customer-status">🟢 Online</p>
    </div>

      {/* Contact Details */}
    <div className="info-section">
        <h3>Contact Details</h3>

        <div className="info-row">
        <FaPhoneAlt />
        <span>+91 9876543210</span>
        </div>

        <div className="info-row">
        <FaEnvelope />
        <span>rahul@gmail.com</span>
        </div>

        <div className="info-row">
        <FaMapMarkerAlt />
        <span>New Delhi, India</span>
        </div>
    </div>

      {/* Assigned Agent */}
    <div className="info-section">
        <h3>Assigned Agent</h3>

        <div className="info-row">
        <FaUserTie />
        <span>Tanmay Pandey</span>
        </div>
    </div>

      {/* Tags */}
    <div className="info-section">
        <h3>Tags</h3>

        <div className="tags">
        <span className="tag">
            <FaTag /> Premium
        </span>

        <span className="tag">
            <FaTag /> Paid
        </span>

        <span className="tag">
            <FaTag /> Returning
        </span>
        </div>
    </div>

      {/* Notes */}
    <div className="info-section">
        <h3>Notes</h3>

        <textarea
        placeholder="Add notes about this customer..."
        rows="5"
        ></textarea>
    </div>

    </div>
);
}

export default CustomerInfo;