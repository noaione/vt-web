import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";

import { ChannelCardProps } from "../../components/ChannelCard";

interface ChannelsState {
    channels: ChannelCardProps[];
}

const initialState: ChannelsState = {
    channels: [],
};

export const channelsReducer = createSlice({
    name: "channels",
    initialState,
    reducers: {
        addChannel: (state, action: PayloadAction<ChannelCardProps>) => {
            const { channels } = state;
            const { payload } = action;
            const isExist = channels.findIndex((e) => e.id === payload.id) !== -1;
            if (!isExist) {
                channels.push(payload);
                state.channels = channels;
            }
        },
        bulkAddChannel: (state, action: PayloadAction<ChannelCardProps[]>) => {
            let { channels } = state;
            channels = channels.concat(action.payload);
            channels = channels.filter((i, idx) => channels.indexOf(i) === idx);
            state.channels = channels;
        },
        removeChannelById: (state, action: PayloadAction<string>) => {
            let { channels } = state;
            const { payload } = action;
            channels = channels.filter((e) => payload !== e.id);
            state.channels = channels;
        },
        bulkRemoveChannelById: (state, action: PayloadAction<string[]>) => {
            let { channels } = state;
            const { payload } = action;
            channels = channels.filter((e) => !payload.includes(e.id));
            state.channels = channels;
        },
        resetState: (state) => {
            state.channels = [];
        },
    },
});

export const { addChannel, removeChannelById, bulkAddChannel, bulkRemoveChannelById } =
    channelsReducer.actions;

export const selectChannels = (state: RootState) => state.channels.channels;

export default channelsReducer.reducer;
