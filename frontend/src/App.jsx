import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./App.css";

import {
  IoSend,
  IoChatbubbles,
  IoPersonCircle,
  IoSettingsOutline,
  IoTrashOutline,
  IoCopyOutline,
  IoThumbsUpOutline,
  IoThumbsDownOutline,
} from "react-icons/io5";
import {
  FaMicrophone,
  FaPaperPlane,
  FaSpinner,
  FaArrowDown,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import { TbMessageCircle } from "react-icons/tb";
import {
  MdOutlineLightMode,
  MdOutlineDarkMode,
  MdOutlineUploadFile,
} from "react-icons/md";
import { RiMenu3Fill } from "react-icons/ri";

import Message from "./components/Message/Message";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      role: "bot",
      text: "Hello! 👋 I'm your AI Support Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);

  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (sessions.length > 0 && chat.length === 0) {
      loadMessages(sessions[0].id);
    }
  }, [sessions]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chat, loading]);

  // Check scroll position
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/sessions");

      setSessions(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadMessages = async (sessionId) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/messages/${sessionId}`,
      );

      setChat(response.data);

      setCurrentSession(sessionId);
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    let sessionId = currentSession;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      setCurrentSession(sessionId);
    }

    const userMessage = {
      role: "user",
      text: message || (selectedFile ? selectedFile.name : ""),
      timestamp: new Date(),
    };

    setChat((prev) => [...prev, userMessage]);
    setLoading(true);

    const formData = new FormData();
    formData.append("message", message);
    formData.append("session_id", sessionId);

    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/chat",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const botMessage = {
        role: "assistant",
        text: response.data.reply,
        timestamp: new Date(),
      };

      setChat((prev) => [...prev, botMessage]);
      fetchSessions();

      setSelectedFile(null);
    } catch (error) {
      console.log(error);

      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I'm having trouble connecting. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ]);
    }

    setLoading(false);
    setMessage("");
    inputRef.current?.focus();
  };

  const removeFile = () => {
    setSelectedFile(null);
    fileInputRef.current.value = "";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setCurrentSession(null);

    setChat([
      {
        role: "assistant",
        text: "Hello! 👋 I'm your AI Support Assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className={`app ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <HiOutlineSparkles className="logo-icon" />
            <h2>AI Assistant</h2>
          </div>
        </div>

        <button
          className="new-chat-btn"
          onClick={() => {
            clearChat();
            setSidebarOpen(false);
          }}>
          <IoChatbubbles />
          New Chat
        </button>

        <div className="sessions-list">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`session-item ${
                currentSession === session.id ? "active-session" : ""
              }`}
              onClick={() => {
                loadMessages(session.id);
                setSidebarOpen(false);
              }}>
              <TbMessageCircle />
              <span>{session.title}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <MdOutlineLightMode /> : <MdOutlineDarkMode />}
            <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button
            className="clear-chat-btn"
            onClick={() => {
              clearChat();
              setSidebarOpen(false);
            }}>
            <IoTrashOutline />
            Clear Chat
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main Chat Area */}
      <div className="main-chat">
        {/* Header */}
        <div className="chat-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}>
            <RiMenu3Fill size={26} />
          </button>
          <div className="header-info">
            <div className="status-indicator"></div>
            <div>
              <h3>AI Support Assistant</h3>
              <p>Online • Ready to assist you</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-btn">
              <IoSettingsOutline />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div
          className="messages-container"
          ref={chatContainerRef}
          onScroll={handleScroll}>
          {chat.map((msg, index) => (
            <Message key={index} msg={msg} />
          ))}

          {loading && (
            <div className="message bot-message">
              <div className="message-avatar">
                <HiOutlineSparkles size={26} color="#686868" />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button className="scroll-to-bottom" onClick={scrollToBottom}>
            <FaArrowDown />
          </button>
        )}

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
            {!selectedFile && (
              <button
                className="upload-btn"
                onClick={() => fileInputRef.current.click()}>
                {uploading ? (
                  <FaSpinner className="spinning" />
                ) : (
                  <MdOutlineUploadFile size={22} />
                )}
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setSelectedFile(file);
              }}
            />
            {selectedFile && (
              <div className="file-chip">
                {selectedFile.name}
                <button className="remove-uploads-btn" onClick={removeFile}>
                  ✕
                </button>
              </div>
            )}
            <textarea
              ref={inputRef}
              placeholder="Ask me anything..."
              value={message}
              className={`user-input ${isDarkMode ? "dark-mode-color" : "light-mode-color"}`}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button className="voice-btn" title="Voice input">
              <FaMicrophone />
            </button>
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!message.trim() || loading}>
              {loading ? <FaSpinner className="spinning" /> : <FaPaperPlane />}
            </button>
          </div>
          <div className="input-hint">
            Press Enter to send, Shift + Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
