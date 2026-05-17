import ReactMarkdown from 'react-markdown'
import './Message.css'

import { HiOutlineSparkles } from "react-icons/hi";
import { IoCopyOutline, IoPersonCircle, IoThumbsDownOutline, IoThumbsUpOutline } from "react-icons/io5";
import { formatTime } from '../../utils/formatTime';

const Message = (props) => {
    const {msg} = props

    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      // You can add a toast notification here
    };
  return (
    <div
      className={`message ${msg.role === "user" ? "user-message" : "bot-message"}`}>
      <div className="message-avatar">
        {msg.role === "user" ? (
          <IoPersonCircle size={30} />
        ) : (
          <HiOutlineSparkles size={26} color="#6366F1" />
        )}
      </div>
      <div className="message-content">
        <div
          className={`message-text ${msg.role === "user" ? "text-right" : ""}`}>
          <ReactMarkdown>{msg.text}</ReactMarkdown>
        </div>
        <div className="message-footer">
          <span className="message-time">{formatTime(msg.timestamp)}</span>
          {msg.role !== "user" && (
            <div className="message-actions">
              <button onClick={() => copyToClipboard(msg.text)} title="Copy">
                <IoCopyOutline />
              </button>
              <button title="Helpful">
                <IoThumbsUpOutline />
              </button>
              <button title="Not helpful">
                <IoThumbsDownOutline />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
