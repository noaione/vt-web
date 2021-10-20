import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";
import { PlatformType } from "../vt";

import { VideoCardProps } from "../../components/VideoCard";

interface VideoState {
    videos: VideoCardProps[];
    filtered: VideoCardProps[];
    currentQuery: string;
    platformList: PlatformType[];
}

const initialState: VideoState = {
    videos: [],
    filtered: [],
    currentQuery: "",
    platformList: ["youtube", "bilibili", "twitcasting", "twitch", "mildom", "twitter"],
};

function filterVideoSearch(allData: VideoCardProps[], searchQuery: string, platformTick: PlatformType[]) {
    const originalQuery = searchQuery;
    searchQuery = searchQuery.toLowerCase();
    let refiltered = allData;
    if (searchQuery.trim() !== "") {
        refiltered = allData.filter((o) => {
            const { title, id } = o;
            if (id === originalQuery) {
                return true;
            }
            if (title.toLowerCase().includes(searchQuery)) {
                return true;
            }
            return false;
        });
    }
    if (initialState.platformList.length === platformTick.length) {
        return refiltered;
    }
    refiltered = refiltered.filter((o) => platformTick.includes(o.platform));
    return refiltered;
}

export const videosReducer = createSlice({
    name: "videos",
    initialState,
    reducers: {
        addVideo: (state, action: PayloadAction<VideoCardProps>) => {
            const { videos, platformList, currentQuery } = state;
            const { payload } = action;
            const isExist = videos.findIndex((e) => e.id === payload.id) !== -1;
            if (!isExist) {
                videos.push(payload);
                state.videos = videos;
            }
            const filteredData = filterVideoSearch(videos, currentQuery, platformList);
            state.filtered = filteredData;
        },
        bulkAddVideo: (state, action: PayloadAction<VideoCardProps[]>) => {
            let { videos } = state;
            const { platformList, currentQuery } = state;
            videos = videos.concat(action.payload);
            videos = videos.filter((i, idx) => videos.findIndex((op) => op.id === i.id) === idx);
            state.videos = videos;
            const filteredData = filterVideoSearch(videos, currentQuery, platformList);
            state.filtered = filteredData;
        },
        removeVideoById: (state, action: PayloadAction<string>) => {
            let { videos } = state;
            const { platformList, currentQuery } = state;
            const { payload } = action;
            videos = videos.filter((e) => payload !== e.id);
            state.videos = videos;
            const filteredData = filterVideoSearch(videos, currentQuery, platformList);
            state.filtered = filteredData;
        },
        bulkRemoveVideoById: (state, action: PayloadAction<string[]>) => {
            let { videos } = state;
            const { platformList, currentQuery } = state;
            const { payload } = action;
            videos = videos.filter((e) => !payload.includes(e.id));
            state.videos = videos;
            const filteredData = filterVideoSearch(videos, currentQuery, platformList);
            state.filtered = filteredData;
        },
        resetState: (state) => {
            state.videos = [];
            state.filtered = [];
            state.currentQuery = "";
            state.platformList = initialState.platformList;
        },
        searchQuery: (state, action: PayloadAction<string>) => {
            const { platformList } = state;
            const { payload } = action;
            state.currentQuery = payload;
            const filteredData = filterVideoSearch(state.videos, payload, platformList);
            state.filtered = filteredData;
        },
        setPlatforms: (state, action: PayloadAction<PlatformType[]>) => {
            const { currentQuery } = state;
            const { payload } = action;
            state.platformList = payload;
            const filteredData = filterVideoSearch(state.videos, currentQuery, payload);
            state.filtered = filteredData;
        },
    },
});

export const { addVideo, removeVideoById, bulkAddVideo, bulkRemoveVideoById, resetState } =
    videosReducer.actions;

export const selectAllVideos = (state: RootState) => state.videos.videos;
export const selectVideo = (state: RootState) => state.videos.filtered;

export default videosReducer.reducer;
