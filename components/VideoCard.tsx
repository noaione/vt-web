import React from "react";

import Buttons from "./Buttons";

import { DateTime } from "luxon";
import { isType, Nullable } from "../lib/utils";
import {
    GROUPS_NAME_MAP,
    platformToShortCode,
    PlatformType,
    prependWatchUrl,
    prettyPlatformName,
    selectBorderColor,
    selectTextColor,
    VideoType,
} from "../lib/vt";

function getPreferedTimezone(localStorage) {
    const DEFAULTS = "UTC" + DateTime.local().toFormat("ZZ");
    const prefer = localStorage.getItem("vtapi-offsetLoc");
    if (typeof prefer === "undefined" || prefer === null) {
        localStorage.setItem("vtapi-offsetLoc", DEFAULTS);
        return DEFAULTS;
    }
    return prefer;
}

function createViewersData(viewers?: number, peakViewers?: number) {
    if (isType(viewers, "number") && isType(peakViewers, "number")) {
        return (
            <p>
                <span className="font-bold">Viewers</span>: {viewers.toLocaleString()} |{" "}
                <span className="font-bold">Peak Viewers</span>: {peakViewers.toLocaleString()}
            </p>
        );
    } else if (isType(viewers, "number") && !isType(peakViewers, "number")) {
        return (
            <p>
                <span className="font-bold">Viewers</span>: {viewers.toLocaleString()}
            </p>
        );
    } else if (!isType(viewers, "number") && isType(peakViewers, "number")) {
        return (
            <p>
                <span className="font-bold">Peak Viewers</span>: {peakViewers.toLocaleString()}
            </p>
        );
    }
    return null;
}

export interface VideoCardProps {
    id: string;
    title: string;
    channel: {
        id: string;
        name: string;
        room_id?: string;
    };
    timeData: {
        scheduledStartTime?: number;
        startTime?: number;
    };
    status: VideoType;
    thumbnail?: Nullable<string>;
    viewers?: Nullable<number>;
    peakViewers?: Nullable<number>;
    platform: PlatformType;
    group: keyof typeof GROUPS_NAME_MAP;
    is_premiere?: boolean;
}

interface VideoCardState {
    preferTZ: string;
}

class VideoCard extends React.Component<VideoCardProps, VideoCardState> {
    constructor(props) {
        super(props);
        this.state = {
            preferTZ: "UTC+09:00",
        };
    }

    componentDidMount() {
        this.setState({ preferTZ: getPreferedTimezone(localStorage) });
    }

    render() {
        let {
            id,
            title,
            channel,
            timeData,
            status,
            thumbnail,
            viewers,
            peakViewers,
            platform,
            group,
            is_premiere,
        } = this.props;
        const { scheduledStartTime, startTime } = timeData;
        const { name, room_id } = channel;
        const ch_id = channel.id;

        const borderColor = selectBorderColor(platform);
        const textColor = selectTextColor(platform);

        let ihaIco = platform as string;
        if (ihaIco === "mildom") {
            ihaIco + "_simple";
        }

        if (status === "upcoming" && platform === "twitch") {
            thumbnail = "https://ttvthumb.glitch.me/" + ch_id;
        }

        const { preferTZ } = this.state;

        let properStartTime: Nullable<string> = null;
        if (status === "upcoming" && scheduledStartTime) {
            const startTimeTZ = DateTime.fromSeconds(scheduledStartTime, { zone: "UTC" }).setZone(preferTZ);
            properStartTime = startTimeTZ.toFormat("EEE, dd MMM yyyy HH:mm:ss ZZZZ");
        } else if (status === "upcoming" && startTime) {
            const startTimeTZ = DateTime.fromSeconds(startTime, { zone: "UTC" }).setZone(preferTZ);
            properStartTime = startTimeTZ.toFormat("EEE, dd MMM yyyy HH:mm:ss ZZZZ");
        } else if (status === "live" && startTime) {
            const startTimeTZ = DateTime.fromSeconds(startTime, { zone: "UTC" }).setZone(preferTZ);
            properStartTime = startTimeTZ.toFormat("EEE, dd MMM yyyy HH:mm:ss ZZZZ");
        }

        const channelUrl = `/channel/${platformToShortCode(platform)}-${ch_id}`;

        const viewersJSX = createViewersData(viewers, peakViewers);
        const watchUrl = prependWatchUrl(id, ch_id, room_id, platform);

        return (
            <>
                <div id={`vid-${id}-${platform}`} className="flex bg-gray-900 col-span-1 rounded-lg">
                    <div className={"m-auto shadow-md rounded-lg w-full border " + borderColor}>
                        <div className="relative">
                            <a href={watchUrl}>
                                <img
                                    src={thumbnail}
                                    alt={name + " Video Thumbnail"}
                                    className="w-full object-cover object-center rounded-t-lg"
                                />
                            </a>
                        </div>
                        <div className="px-4 mt-4 text-gray-200 bg-gray-900">
                            <p className="mt-1 text-sm tracking-wide font-bold">
                                <i className={textColor + " mr-2 ihaicon ihaico-" + ihaIco}></i>
                                {prettyPlatformName(platform)}
                            </p>
                            <p className="mt-2 text-white text-lg font-semibold">{title}</p>
                        </div>
                        <div className="px-4 mt-2 text-gray-200 bg-gray-900">
                            <p>
                                <span className="font-bold">Streamer</span>: {name}
                            </p>
                            <p>
                                <span className="font-bold">Start</span>: {properStartTime}
                            </p>
                            {viewersJSX}
                        </div>
                        <div className="rounded-b-lg px-4 py-4 mt-0 flex gap-2">
                            <Buttons use="a" href={watchUrl} type="danger">
                                Watch
                            </Buttons>
                            <Buttons use="a" href={channelUrl} type="primary">
                                Info
                            </Buttons>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default VideoCard;