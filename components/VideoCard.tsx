import React from "react";

import Buttons from "./Buttons";
import { ChannelCardProps } from "./ChannelCard";

import { DateTime } from "luxon";
import ReactTooltip from "react-tooltip";

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
import { sortBy } from "lodash";

function getPreferedTimezone(localStorage) {
    const DEFAULTS = "UTC" + DateTime.local().toFormat("ZZ");
    const prefer = localStorage.getItem("vtapi.offsetLoc");
    if (typeof prefer === "undefined" || prefer === null) {
        localStorage.setItem("vtapi.offsetLoc", DEFAULTS);
        return DEFAULTS;
    }
    return prefer;
}

export function createViewersData(viewers?: number, peakViewers?: number) {
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

interface MentionedProps {
    videoId: string;
    mentions?: ChannelCardProps[];
}

function MentionedChannels(props: MentionedProps) {
    const { videoId, mentions } = props;

    if (!Array.isArray(mentions)) {
        return null;
    }
    if (mentions.length < 1) {
        return null;
    }

    const sortedByName = sortBy(mentions, (o) => o.en_name || o.name);

    return (
        <>
            <p>
                <span className="font-bold dotted-line" data-tip="This might not be accurate!">
                    Collabing with
                </span>{" "}
                {sortedByName.map((mention, idx) => {
                    const selectName = mention.en_name || mention.name;
                    const addComma = idx + 1 !== mentions.length;
                    return (
                        <span key={`mention-${videoId}-${mention.id}-${idx}`}>
                            {selectName}
                            {addComma && ", "}
                        </span>
                    );
                })}
            </p>
            <ReactTooltip place="right" type="info" effect="solid" />
        </>
    );
}

export interface VideoCardProps {
    id: string;
    title: string;
    channel: ChannelCardProps;
    channel_id?: string;
    timeData: {
        scheduledStartTime?: number;
        startTime?: number;
        endTime?: number;
        publishedAt?: string;
        duration?: number;
    };
    status: VideoType;
    thumbnail?: Nullable<string>;
    mentions?: ChannelCardProps[];
    viewers?: Nullable<number>;
    peakViewers?: Nullable<number>;
    averageViewers?: Nullable<number>;
    platform: PlatformType;
    group: keyof typeof GROUPS_NAME_MAP;
    is_premiere?: boolean;
    is_member?: boolean;
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
        const {
            id,
            title,
            channel,
            timeData,
            status,
            mentions,
            viewers,
            peakViewers,
            platform,
            is_premiere,
            is_member,
        } = this.props;
        let { thumbnail } = this.props;
        const { scheduledStartTime, startTime, endTime } = timeData;
        const { name, room_id } = channel;
        const ch_id = channel.id;

        const borderColor = selectBorderColor(platform);
        const textColor = selectTextColor(platform);

        let ihaIco = platform as string;
        if (ihaIco === "mildom") {
            ihaIco += "_simple";
        }

        if (status === "upcoming" && platform === "twitch") {
            thumbnail = "https://ttvthumb.glitch.me/" + ch_id;
        }
        if (platform === "twitter") {
            thumbnail = "https://ttvthumb.glitch.me/twtr/" + ch_id;
        }

        const { preferTZ } = this.state;

        let properStartTime: Nullable<string> = null;
        let properEndTime: Nullable<string> = null;
        if (status === "upcoming" && scheduledStartTime) {
            const startTimeTZ = DateTime.fromSeconds(scheduledStartTime, { zone: "UTC" }).setZone(preferTZ);
            properStartTime = startTimeTZ.toFormat("EEE, dd MMM yyyy HH:mm:ss ZZZZ");
        } else if (status === "upcoming" && startTime) {
            const startTimeTZ = DateTime.fromSeconds(startTime, { zone: "UTC" }).setZone(preferTZ);
            properStartTime = startTimeTZ.toFormat("EEE, dd MMM yyyy HH:mm:ss ZZZZ");
        } else if (status === "live" && startTime) {
            const startTimeTZ = DateTime.fromSeconds(startTime, { zone: "UTC" }).setZone(preferTZ);
            properStartTime = startTimeTZ.toFormat("EEE, dd MMM yyyy HH:mm:ss ZZZZ");
        } else if (status === "past" && startTime) {
            const startTimeTZ = DateTime.fromSeconds(startTime, { zone: "UTC" }).setZone(preferTZ);
            properStartTime = startTimeTZ.toFormat("EEE, dd MMM yyyy HH:mm:ss ZZZZ");
        }
        if (status === "past" && endTime) {
            const endTimeTZ = DateTime.fromSeconds(endTime, { zone: "UTC" }).setZone(preferTZ);
            properEndTime = endTimeTZ.toFormat("EEE, dd MMM yyyy HH:mm:ss ZZZZ");
        }

        const videoInfo = `/video/${platformToShortCode(platform)}-${id}`;
        const channelInfo = `/channel/${platformToShortCode(platform)}-${ch_id}`;

        const viewersJSX = createViewersData(viewers, peakViewers);
        const watchUrl = prependWatchUrl(id, ch_id, room_id, platform);

        return (
            <>
                <div id={`vid-${id}-${platform}`} className="flex bg-gray-900 col-span-1 rounded-lg">
                    <div className={"m-auto shadow-md rounded-lg w-full border " + borderColor}>
                        <div className="relative">
                            <a href={watchUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={thumbnail}
                                    alt={name + " Video Thumbnail"}
                                    loading="lazy"
                                    className="w-full object-cover object-center rounded-t-lg"
                                />
                            </a>
                        </div>
                        <div className="px-4 mt-4 text-gray-200 bg-gray-900">
                            <p className="mt-1 text-sm tracking-wide font-bold">
                                <i className={textColor + " mr-2 ihaicon ihaico-" + ihaIco} />
                                {is_premiere && <i className="mr-2 ihaicon ihaico-play text-blue-400" />}
                                {is_member && <i className="mr-2 ihaicon ihaico-lock text-yellow-400" />}
                                {prettyPlatformName(platform)}
                                {is_premiere && <span className="mr-2">{" (Premiere)"}</span>}
                                {is_member && <span className="mr-2">{" (Member-Only)"}</span>}
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
                            {properEndTime && (
                                <p>
                                    <span className="font-bold">Ended</span>: {properEndTime}
                                </p>
                            )}
                            <MentionedChannels videoId={id} mentions={mentions} />
                            {viewersJSX}
                        </div>
                        <div className="rounded-b-lg px-4 py-4 mt-0 flex gap-2">
                            <Buttons use="a" href={watchUrl} btnType="danger">
                                Watch
                            </Buttons>
                            <Buttons use="a" href={videoInfo} btnType="primary">
                                Info
                            </Buttons>
                            <Buttons use="a" href={channelInfo} btnType="warning">
                                Channel Info
                            </Buttons>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default VideoCard;
