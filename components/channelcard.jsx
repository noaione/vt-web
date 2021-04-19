import React from "react";
import Buttons from "./buttons";

function selectBorderColor(platform) {
    switch (platform) {
        case "youtube":
            return "border-youtube";
        case "bilibili":
            return "border-bili2";
        case "twitch":
            return "border-twitch";
        case "twitcasting":
            return "border-twcast";
        case "mildom":
            return "border-mildom";
        default:
            return "border-gray-300";
    }
}

function selectTextColor(platform) {
    switch (platform) {
        case "youtube":
            return "text-youtube";
        case "bilibili":
            return "text-bili2";
        case "twitch":
            return "text-twitch";
        case "twitcasting":
            return "text-twcast";
        case "mildom":
            return "text-mildom";
        default:
            return "text-gray-300";
    }
}

function prependWatchUrl(channelId, platform) {
    if (platform === "youtube") {
        return `https://youtube.com/channel/${channelId}`;
    } else if (platform === "bilibili") {
        return `https://space.bilibili.com/${channelId}`;
    } else if (platform === "twitch") {
        return `https://twitch.tv/${channelId}`;
    } else if (platform === "twitcasting") {
        return `https://twitcasting.tv/${channelId}`;
    } else if (platform === "mildom") {
        return `https://mildom.com/profile/${channelId}`;
    }
}

function ChannelCard(props) {
    const { id, name, image, platform, group, statistics } = props;
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
                    <div className="relative">
                        <a href={"/" + shortCode + "-" + id}>
                            <img src={image} alt={name + " Channel Image"} className="w-full object-cover object-center rounded-t-lg" />
                        </a>
                    </div>
                    <div className="px-4 py-4 text-gray-200 bg-gray-900">
                        <p className="mt-1 uppercase text-sm tracking-wide font-bold text-center">
                            <i className={textCol + " mr-2 ihaicon ihaico-" + ihaIco}></i>
                            {platform}
                        </p>
                        <p className="mt-2 text-white text-lg font-semibold text-center">{name}</p>
                    </div>
                    <div className={"px-4 py-4 text-gray-200 bg-gray-900 border-t " + borderColor}>
                        <p><span className="font-bold">Subscribers</span>: {subscriberCount.toLocaleString()}</p>
                    </div>
                    {isViewCount &&
                        <div className={"px-4 py-4 text-gray-200 bg-gray-900 border-t " + borderColor}>
                            <p><span className="font-bold">Views</span>: {viewCount.toLocaleString()}</p>
                        </div>
                    }
                    <div className={"rounded-b-lg px-4 py-4 text-gray-200 bg-gray-900 text-center border-t " + borderColor}>
                        <Buttons use="a" href={prependWatchUrl(id, platform)} type="primary">Watch!</Buttons>
                        {/* <a href={prependWatchUrl(id, platform)} className="text-blue-300 underline hover:text-blue-400 transition-colors duration-200">Watch!</a> */}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChannelCard;
