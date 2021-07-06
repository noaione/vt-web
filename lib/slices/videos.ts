import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";

import { VideoCardProps } from "../../components/VideoCard";

interface VideoState {
    videos: VideoCardProps[];
}

const initialState: VideoState = {
    videos: [],
};

export const videosReducer = createSlice({
    name: "videos",
    initialState,
    reducers: {
        addVideo: (state, action: PayloadAction<VideoCardProps>) => {
            const { videos } = state;
            const { payload } = action;
            const isExist = videos.findIndex((e) => e.id === payload.id) !== -1;
            if (!isExist) {
                videos.push(payload);
                state.videos = videos;
            }
        },
        bulkAddVideo: (state, action: PayloadAction<VideoCardProps[]>) => {
            let { videos } = state;
            videos = videos.concat(action.payload);
            videos = videos.filter((i, idx) => videos.indexOf(i) === idx);
            state.videos = videos;
        },
        removeVideoById: (state, action: PayloadAction<string>) => {
            let { videos } = state;
            const { payload } = action;
            videos = videos.filter((e) => payload !== e.id);
            state.videos = videos;
        },
        bulkRemoveVideoById: (state, action: PayloadAction<string[]>) => {
            let { videos } = state;
            const { payload } = action;
            videos = videos.filter((e) => !payload.includes(e.id));
            state.videos = videos;
        },
    },
});

export const { addVideo, removeVideoById, bulkAddVideo, bulkRemoveVideoById } = videosReducer.actions;

export const selectVideo = (state: RootState) => state.videos.videos;

export default videosReducer.reducer;
