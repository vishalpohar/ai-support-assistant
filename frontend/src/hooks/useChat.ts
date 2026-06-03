import { useRef, useState } from "react";

import { useAppDispatch } from "../app/hooks";

import {
  getMessages,
  sendMessage,
  updateMessages,
  clearMessages,
} from "../features/messageSlice";

import { getSessions } from "../features/sessionSlice";

export const useChat = (isLoading: boolean) => {
  const dispatch = useAppDispatch();

  const [message, setMessage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentSession, setCurrentSession] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const loadSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    dispatch(getMessages(sessionId));
  };

  const clearChat = () => {
    setCurrentSession(null);
    dispatch(clearMessages());
  };

  const newMessage = async () => {
    if (!message.trim()) return;
    if (isLoading) return;

    let sessionId = currentSession;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      setCurrentSession(sessionId);
    }

    dispatch(
      updateMessages({
        role: "user",
        text: message,
        timestamp: new Date().toISOString(),
      }),
    );

    try {
      const response = await dispatch(
        sendMessage({
          sessionId,
          message,
          file: selectedFile,
        }),
      ).unwrap();

      dispatch(
        updateMessages({
          role: "assistant",
          text: response.reply,
          timestamp: new Date().toISOString(),
        }),
      );

      dispatch(getSessions());
    } finally {
      setMessage("");
      setSelectedFile(null);
      inputRef.current?.focus();
    }
  };

  return {
    message,
    setMessage,
    selectedFile,
    setSelectedFile,
    currentSession,
    inputRef,
    loadSession,
    clearChat,
    newMessage,
  };
};
