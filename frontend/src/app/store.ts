import { configureStore } from "@reduxjs/toolkit";

import sessionReducer from "../features/sessionSlice";
import messageReducer from "../features/messageSlice";

const store = configureStore({
  reducer: {
    session: sessionReducer,
    message: messageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
