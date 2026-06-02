import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import type { Session } from "../types/session";

export interface SessionState {
  sessions: Session[];
  sessionStatus: "idle" | "loading" | "success" | "failed";
  error: string | null;
}

const initialState: SessionState = {
  sessions: [],
  sessionStatus: "idle",
  error: null,
};

export const getSessions = createAsyncThunk<Session[], void, {rejectValue: string}>(
  "session/getSessions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/sessions");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch sessions",
      );
    }
  },
);

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSessions.pending, (state) => {
        state.sessionStatus = "loading";
      })
      .addCase(getSessions.fulfilled, (state, action) => {
        state.sessionStatus = "success";
        state.sessions = action.payload;
      })
      .addCase(getSessions.rejected, (state, action) => {
        state.sessionStatus = "failed";
        state.error = action.payload as string;
      });
  },
});

export default sessionSlice.reducer;
