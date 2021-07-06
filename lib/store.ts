import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import channelsReducer from "./slices/channels";
import videosReducer from "./slices/videos";

export const store = configureStore({
    reducer: {
        videos: videosReducer,
        channels: channelsReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

export const useStoreDispatch = () => useDispatch<AppDispatch>();
export const useStoreSelector: TypedUseSelectorHook<RootState> = useSelector;
