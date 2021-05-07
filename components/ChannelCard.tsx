import React from "react";

import Buttons from "./Buttons";

import {
    GROUPS_NAME_MAP,
    PlatformType,
    prependChannelURL,
    selectBorderColor,
    selectTextColor,
} from "../lib/vt";
import { Nullable } from "../lib/utils";

interface HistoryData {
    data: number;
    time: number;
}

export interface ChannelCardProps {
    id: string;
    name: string;
    en_name?: string;
    image: string;
    platform: PlatformType;
    group: keyof typeof GROUPS_NAME_MAP;
    statistics?: {
        subscriberCount?: Nullable<number>;
        viewCount?: Nullable<number>;
    };
    history?: {
        subscribersCount?: HistoryData;
        viewsCount?: HistoryData;
    };
    publishedAt?: string;
    is_retired: boolean;
}

function ChannelCard(props: ChannelCardProps) {
    const { id, name, image, platform, statistics, is_retired } = props;
    const { subscriberCount, viewCount } = statistics;

    let shortCode;
    switch (platform) {
        case "youtube":
            shortCode = "yt";
            break;
        case "bilibili":
            shortCode = "b2";
            break;
        case "twitch":
            shortCode = "ttv";
            break;
        case "twitcasting":
            shortCode = "twcast";
            break;
        case "mildom":
            shortCode = "md";
            break;
        default:
            shortCode = "unk";
            break;
    }

    const isViewCount = typeof viewCount === "number";

    const borderColor = selectBorderColor(platform);
    const textCol = selectTextColor(platform);

    let ihaIco = platform;
    if (ihaIco === "mildom") {
        ihaIco += "_simple";
    }

    return (
        <>
            <div id={"ch-" + id + "-" + platform} className="flex rounded-lg">
                <div className={"m-auto shadow-md rounded-lg w-full border " + borderColor}>
                    <div className="relative rounded-lg">
                        <a href={"/channel/" + shortCode + "-" + id} className="rounded-lg">
                            <img
                                src={image}
                                alt={name + " Channel Image"}
                                loading="lazy"
                                className={`w-full object-cover object-center rounded-t-lg ${
                                    is_retired && "opacity-50"
                                }`}
                            />
                        </a>
                    </div>
                    <div className="px-4 py-4 text-gray-200 bg-gray-900">
                        <p className="mt-1 uppercase text-sm tracking-wide font-bold text-center">
                            <i className={textCol + " mr-2 ihaicon ihaico-" + ihaIco}></i>
                            {platform}
                            {is_retired && <span className="text-gray-400 ml-1 text-sm">{"(retired)"}</span>}
                        </p>
                        <p className="mt-2 text-white text-lg font-semibold text-center">{name}</p>
                    </div>
                    <div className={"px-4 py-4 text-gray-200 bg-gray-900 border-t " + borderColor}>
                        <p>
                            <span className="font-bold">Subscribers</span>: {subscriberCount.toLocaleString()}
                        </p>
                    </div>
                    {isViewCount && (
                        <div className={"px-4 py-4 text-gray-200 bg-gray-900 border-t " + borderColor}>
                            <p>
                                <span className="font-bold">Views</span>: {viewCount.toLocaleString()}
                            </p>
                        </div>
                    )}
                    <div
                        className={
                            "rounded-b-lg px-4 py-4 text-gray-200 bg-gray-900 text-center flex flex-row gap-2 justify-center border-t " +
                            borderColor
                        }
                    >
                        <Buttons use="a" href={prependChannelURL(id, platform)} btnType="danger">
                            Watch
                        </Buttons>
                        <Buttons use="a" href={"/channel/" + shortCode + "-" + id} btnType="primary">
                            Info
                        </Buttons>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ChannelCard;
