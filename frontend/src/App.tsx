import { useState, useRef, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "./app/hooks";

import { FaArrowDown } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";

import Message from "./components/Message";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import InputArea from "./components/InputArea";

import { getSessions } from "./features/sessionSlice";
import {
  getMessages,
  sendMessage,
  updateMessages,
  clearMessages,
} from "./features/messageSlice";

import type { ChatMessage } from "./types/message";

const App = () => {
  const dispatch = useAppDispatch();
  const { sessions } = useAppSelector((state) => state.session);
  const { messages, messageStatus, error } = useAppSelector(
    (state) => state.message,
  );

  const [message, setMessage] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentSession, setCurrentSession] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    dispatch(getSessions());
  }, [dispatch]);

  useEffect(() => {
    if (sessions.length > 0 && messages.length === 0) {
      dispatch(getMessages(sessions[0]!.id));
    }
  }, [dispatch, sessions, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const loadSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    dispatch(getMessages(sessionId));
  };

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

  const newMessage = async () => {
    if (!message.trim()) return;

    let sessionId = currentSession;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      setCurrentSession(sessionId);
    }

    const userMessage: ChatMessage = {
      role: "user",
      text: message || (selectedFile ? selectedFile.name : ""),
      timestamp: new Date().toISOString(),
    };

    dispatch(updateMessages(userMessage));

    try {
      const response = await dispatch(
        sendMessage({ sessionId, message, file: selectedFile }),
      ).unwrap();

      const botMessage: ChatMessage = {
        role: "assistant",
        text: response.reply,
        timestamp: new Date().toISOString(),
      };

      dispatch(updateMessages(botMessage));
      dispatch(getSessions());
    } catch (error) {
    } finally {
      setSelectedFile(null);
      setMessage("");
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setCurrentSession(null);
    dispatch(clearMessages());
  };

  return (
    <div
      className={`flex h-screen overflow-hidden ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
      <Toaster position="top-right" />
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        clearChat={clearChat}
        setSidebarOpen={setSidebarOpen}
        sessions={sessions}
        currentSession={currentSession}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        loadSession={loadSession}
      />

      {sidebarOpen && (
        <div
          className="fixed
            inset-0
            bg-black/40
            z-40
            md:hidden
            backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <ChatHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isDarkMode={isDarkMode}
        />

        {/* Messages Container */}
        <div
          className={`flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6 ${isDarkMode ? "bg-gradient-to-br from-slate-800 to-slate-950" : "bg-gradient-to-br from-slate-100 to-slate-300"}`}
          ref={chatContainerRef}
          onScroll={handleScroll}>
          {messages.map((msg, index) => (
            <Message key={index} msg={msg} />
          ))}

          {messageStatus === "loading" && (
            <div className="flex gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-full">
                <HiOutlineSparkles size={26} className="text-gray-500" />
              </div>

              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:200ms]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:400ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            className="absolute
              bottom-44
              right-[45%]
              h-11
              w-11
              flex
              items-center
              justify-center
              rounded-full
              border-2
              bg-white
              border-indigo-500
              text-indigo-500
              shadow-lg
              hover:scale-105
              transition"
            onClick={scrollToBottom}>
            <FaArrowDown />
          </button>
        )}

        {/* Input Area */}
        <InputArea
          inputRef={inputRef}
          fileInputRef={fileInputRef}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          uploading={uploading}
          newMessage={newMessage}
          message={message}
          setMessage={setMessage}
          loading={messageStatus === "loading"}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

export default App;
