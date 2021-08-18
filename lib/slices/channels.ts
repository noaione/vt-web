import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";
import { PlatformType } from "../vt";

import { ChannelCardProps } from "../../components/ChannelCard";

interface ChannelsState {
    channels: ChannelCardProps[];
    filtered: ChannelCardProps[];
    currentQuery: string;
    platformList: PlatformType[];
}

const initialState: ChannelsState = {
    channels: [],
    filtered: [],
    currentQuery: "",
    platformList: ["youtube", "bilibili", "twitcasting", "twitch", "mildom"],
};

function filterChannelSearch(allData: ChannelCardProps[], searchQuery: string, platformTick: PlatformType[]) {
    searchQuery = searchQuery.toLowerCase();
    let refiltered = allData;
    if (searchQuery.trim() !== "") {
        refiltered = allData.filter((o) => {
            const { name, en_name } = o;
            const realEnName = en_name || "";
            const realJPName = name || "";
            if (!name && !en_name) {
                return false;
            }
            if (realEnName.toLowerCase().includes(searchQuery)) {
                return true;
            }
            if (realJPName.toLowerCase().includes(searchQuery)) {
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

export interface UpdateData {
    targetId: string;
    targetPlatform: PlatformType;
    newUpdate: ChannelCardProps;
}

export interface UpdateDataPerSteps {
    targetId: string;
    targetPlatform: PlatformType;
    updatedData: Partial<ChannelCardProps>;
}

export const channelsReducer = createSlice({
    name: "channels",
    initialState,
    reducers: {
        addChannel: (state, action: PayloadAction<ChannelCardProps>) => {
            const { channels, platformList, currentQuery } = state;
            const { payload } = action;
            const isExist = channels.findIndex((e) => e.id === payload.id) !== -1;
            if (!isExist) {
                channels.push(payload);
                state.channels = channels;
            }
            if (currentQuery.trim() === "") {
                state.filtered = channels;
                return;
            }
            const filteredData = filterChannelSearch(channels, currentQuery, platformList);
            state.filtered = filteredData;
        },
        bulkAddChannel: (state, action: PayloadAction<ChannelCardProps[]>) => {
            let { channels } = state;
            const { currentQuery, platformList } = state;
            channels = channels.concat(action.payload);
            channels = channels.filter((i, idx) => channels.indexOf(i) === idx);
            state.channels = channels;
            if (currentQuery.trim() === "") {
                state.filtered = channels;
                return;
            }
            const filteredData = filterChannelSearch(channels, currentQuery, platformList);
            state.filtered = filteredData;
        },
        removeChannelById: (state, action: PayloadAction<string>) => {
            let { channels } = state;
            const { currentQuery, platformList } = state;
            const { payload } = action;
            channels = channels.filter((e) => payload !== e.id);
            state.channels = channels;
            if (currentQuery.trim() === "") {
                state.filtered = channels;
                return;
            }
            const filteredData = filterChannelSearch(channels, currentQuery, platformList);
            state.filtered = filteredData;
        },
        bulkRemoveChannelById: (state, action: PayloadAction<string[]>) => {
            let { channels } = state;
            const { currentQuery, platformList } = state;
            const { payload } = action;
            channels = channels.filter((e) => !payload.includes(e.id));
            state.channels = channels;
            if (currentQuery.trim() === "") {
                state.filtered = channels;
                return;
            }
            const filteredData = filterChannelSearch(channels, currentQuery, platformList);
            state.filtered = filteredData;
        },
        updateChannelById: (state, action: PayloadAction<UpdateData>) => {
            const { payload } = action;
            const { channels } = state;
            const targetIndex = channels.findIndex(
                (o) => o.id === payload.targetId && o.platform === payload.targetPlatform
            );
            if (targetIndex >= 0) {
                channels[targetIndex] = payload.newUpdate;
                state.channels = channels;
            }
        },
        updateChannelDataById: (state, action: PayloadAction<UpdateDataPerSteps>) => {
            const { payload } = action;
            const { channels } = state;
            const targetIndex = channels.findIndex(
                (o) => o.id === payload.targetId && o.platform === payload.targetPlatform
            );
            if (targetIndex >= 0) {
                const targetChannel = channels[targetIndex];
                for (const [key, target] of Object.entries(payload.updatedData)) {
                    targetChannel[key] = target;
                }
                channels[targetIndex] = targetChannel;
                state.channels = channels;
            }
        },
        searchQuery: (state, action: PayloadAction<string>) => {
            const { platformList } = state;
            const { payload } = action;
            state.currentQuery = payload;
            const filteredData = filterChannelSearch(state.channels, payload, platformList);
            state.filtered = filteredData;
        },
        setPlatforms: (state, action: PayloadAction<PlatformType[]>) => {
            const { currentQuery } = state;
            const { payload } = action;
            state.platformList = payload;
            const filteredData = filterChannelSearch(state.channels, currentQuery, payload);
            state.filtered = filteredData;
        },
        resetState: (state) => {
            state.channels = [];
            state.filtered = [];
            state.currentQuery = "";
            state.platformList = initialState.platformList;
        },
    },
});

export const {
    addChannel,
    removeChannelById,
    bulkAddChannel,
    bulkRemoveChannelById,
    searchQuery,
    setPlatforms,
    updateChannelById,
    updateChannelDataById,
} = channelsReducer.actions;

export const selectAllChannels = (state: RootState) => state.channels.channels;
export const selectChannels = (state: RootState) => state.channels.filtered;

export default channelsReducer.reducer;
