import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import api from "../api/axios";
import type { ChatMessage } from "../types/message";

export interface MessageState {
  messages: ChatMessage[];
  messageStatus: "idle" | "loading" | "success" | "failed";
  error: string | null;
}

interface SendMessagePayload {
    sessionId: string;
    message: string;
    file?: File | null;
}

interface SendMessageResponse {
    reply: string;
}

const initialState: MessageState = {
  messages: [
    {
      role: "assistant",
      text: "Hello! 👋 I'm your AI Support Assistant. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ],
  messageStatus: "idle",
  error: null,
};

export const getMessages = createAsyncThunk<
  ChatMessage[],
  string,
  { rejectValue: string }
>("message/getMessages", async (sessionId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/messages/${sessionId}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch messages",
    );
  }
});

export const sendMessage = createAsyncThunk<SendMessageResponse, SendMessagePayload, { rejectValue: string }>(
  "message/sendMessage",
  async (
    payload: { sessionId: string; message: string; file?: File | null },
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append("message", payload.message);
      formData.append("session_id", payload.sessionId);
      if (payload.file) {
        formData.append("file", payload.file);
      }
      const response = await api.post("/chat", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to send message",
      );
    }
  },
);

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [
        {
          role: "assistant",
          text: "Hello! 👋 I'm your AI Support Assistant. How can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ];
    },

    updateMessages: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMessages.pending, (state) => {
        state.messageStatus = "loading";
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messageStatus = "success";
        state.messages = action.payload;
        state.error = null;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.messageStatus = "failed";
        state.error = action.payload as string;
      })
      .addCase(sendMessage.pending, (state) => {
        state.messageStatus = "loading";
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.messageStatus = "success";
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.messageStatus = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearMessages, updateMessages } = messageSlice.actions;
export default messageSlice.reducer;
