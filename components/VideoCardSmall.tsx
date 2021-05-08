import React from "react";

import TimeAgo from "react-timeago";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { DateTime } from "luxon";

import { createViewersData, VideoCardProps } from "./VideoCard";

import { platformToShortCode, PlatformType, prettyPlatformName, selectBorderColor } from "../lib/vt";

function prependVideoURLPage(videoId: string, channelId: string, platform: PlatformType) {
    if (platform === "youtube") {
        return `https://youtube.com/watch?v=${videoId}`;
    } else if (platform === "bilibili") {
        return `https://space.bilibili.com/${channelId}/video`;
    } else if (platform === "twitch") {
        return `https://twitch.tv/${channelId}/videos`;
    } else if (platform === "twitcasting") {
        return `https://twitcasting.tv/${channelId}/movie/${videoId}`;
    } else if (platform === "mildom") {
        return `https://mildom.com/playback/${channelId}/${videoId}`;
    }
}

export default class VideoCardSmall extends React.Component<VideoCardProps> {
    render() {
        const {
            id,
            title,
            status,
            thumbnail,
            timeData,
            platform,
            averageViewers,
            peakViewers,
            channel_id,
            is_premiere,
        } = this.props;
        const { endTime, publishedAt } = timeData;

        let ihaIco = platform;
        if (ihaIco === "mildom") {
            ihaIco += "_simple";
        }

        const borderColor = selectBorderColor(platform);
        const watchUrl = prependVideoURLPage(id, channel_id, platform);
        let initText = status === "video" ? "Uploaded" : "Streamed";
        if (is_premiere) {
            initText = "Premiered";
        }
        let endTimeDate = DateTime.fromSeconds(endTime, { zone: "UTC" }).toJSDate();
        if (["mildom", "twitch", "twitcasting"].includes(platform)) {
            endTimeDate = DateTime.fromISO(publishedAt, { zone: "UTC" }).toJSDate();
        }
        const viewersJSX = createViewersData(averageViewers, peakViewers);

        return (
            <>
                <div id={"vid-" + id + "-" + platform} className="flex col-span-1 bg-gray-900 rounded-lg">
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
                        <div className="mt-2 mx-2 text-gray-200">
                            <p className="text-xs tracking-wide font-bold">
                                <i className={"mr-2 ihaicon ihaico-" + ihaIco}></i>
                                {prettyPlatformName(platform)}
                            </p>
                            <p className="mt-2 text-white text-sm font-semibold">{title}</p>
                        </div>
                        <div className="my-2 mx-2 text-sm text-gray-200">
                            <p>
                                <FontAwesomeIcon className="text-gray-400" icon={faClock} />{" "}
                                <span className="font-bold">{initText}</span> <TimeAgo date={endTimeDate} />
                            </p>
                            {viewersJSX}
                        </div>
                        <div className="my-2 mx-2">
                            <a
                                className="text-sm uppercase tracking-wide text-blue-400 hover:text-blue-300 duration-200 transition-colors"
                                href={`/video/${platformToShortCode(platform)}-${id}`}
                            >
                                Info
                            </a>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
