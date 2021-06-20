import React from "react";

import { Nullable } from "../../lib/utils";
import TimeTicker from "../TimeTicker";
import VideoTimeAgo from "./VideoTimeAgo";

export interface TokiProps {
    scheduledStartTime?: Nullable<number>;
    startTime?: Nullable<number>;
    endTime?: Nullable<number>;
    duration?: Nullable<number>;
    publishedAt: string;
    status: "live" | "upcoming" | "past" | "video";
    isPremiere: boolean;
}

export default function Toki(props: TokiProps) {
    const { startTime, endTime, scheduledStartTime, publishedAt, status, isPremiere } = props;

    if (status === "live") {
        return <TimeTicker startTime={startTime} />;
    }
    if (status === "upcoming") {
        return <VideoTimeAgo timeData={scheduledStartTime} isPremiere={isPremiere} isScheduled />;
    }
    if (status === "past") {
        return <VideoTimeAgo timeData={endTime} isPremiere={isPremiere} />;
    }

    return <VideoTimeAgo timeData={publishedAt} isVideo />;
}
