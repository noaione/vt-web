import React from "react";
import Link from "next/link";

import TimeAgo from "react-timeago";
import { DateTime } from "luxon";

import { createViewersData, VideoCardProps } from "./VideoCard";

import { platformToShortCode, prependVideoURLPage, prettyPlatformName, selectBorderColor } from "../lib/vt";

export default class VideoCardSmall extends React.Component<VideoCardProps> {
    render() {
        const {
            id,
            title,
            status,
            timeData,
            platform,
            averageViewers,
            peakViewers,
            channel_id,
            channel: { room_id },
            is_premiere,
        } = this.props;
        let { thumbnail } = this.props;
        const { endTime, publishedAt } = timeData;

        let ihaIco = platform as string;
        if (ihaIco === "mildom") {
            ihaIco += "_simple";
        }

        const borderColor = selectBorderColor(platform);
        const watchUrl = prependVideoURLPage(id, channel_id, room_id, platform, status);
        let initText = status === "video" ? "Uploaded" : "Streamed";
        if (is_premiere) {
            initText = "Premiered";
        }
        let endTimeDate = DateTime.fromSeconds(endTime, { zone: "UTC" }).toJSDate();
        if (["mildom", "twitch", "twitcasting"].includes(platform)) {
            endTimeDate = DateTime.fromISO(publishedAt, { zone: "UTC" }).toJSDate();
        }
        if (platform === "twitter") {
            thumbnail = "https://ttvthumb.glitch.me/twtr/" + channel_id;
        }
        if (platform === "twitter") {
            ihaIco = "ihaicon-ex ihaicon-ex-twitter";
        } else {
            ihaIco = "ihaicon ihaico-" + ihaIco;
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
                                <i className={"mr-2 " + ihaIco}></i>
                                {prettyPlatformName(platform)}
                            </p>
                            <p className="mt-2 text-white text-sm font-semibold">{title}</p>
                        </div>
                        <div className="my-2 mx-2 text-sm text-gray-200">
                            <p className="flex flex-row items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                        clipRule="evenodd"
                                    />
                                </svg>{" "}
                                <span className="font-bold mx-1">{initText} </span>
                                <TimeAgo date={endTimeDate} />
                            </p>
                            {viewersJSX}
                        </div>
                        <div className="my-2 mx-2">
                            <Link
                                href={`/video/${platformToShortCode(platform)}-${id}`}
                                prefetch={false}
                                passHref
                            >
                                <a className="text-sm uppercase tracking-wide text-blue-400 hover:text-blue-300 duration-200 transition-colors">
                                    Info
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
