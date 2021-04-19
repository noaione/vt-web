import React from "react";
import Buttons from "./buttons";

import { DateTime } from "luxon";

function capitalizeLetters(text) {
    return text.slice(0).toUpperCase() + text.slice(1);
}

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

function prettyPlatformName(platform) {
    switch (platform) {
        case "youtube":
            return "YouTube";
        case "bilibili":
            return "BiliBili";
        case "twitch":
            return "Twitch";
        case "twitcasting":
            return "Twitcasting";
        case "mildom":
            return "Mildom";
        default:
            return capitalizeLetters(platform);
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

function prependWatchUrl(videoId, channelId, roomId, platform) {
    if (platform === "youtube") {
        return `https://youtube.com/watch?v=${videoId}`;
    } else if (platform === "bilibili") {
        return `https://live.bilibili.com/${roomId}`;
    } else if (platform === "twitch") {
        return `https://twitch.tv/${channelId}`;
    } else if (platform === "twitcasting") {
        return `https://twitcasting.tv/${channelId}`;
    } else if (platform === "mildom") {
        return `https://mildom.com/${channelId}`;
    }
}

function getPreferedTimezone(localStorage) {
    const DEFAULTS = "UTC" + DateTime.local().toFormat("ZZ");
    const prefer = localStorage.getItem("vtapi-offsetLoc");
    if (typeof prefer === "undefined" || prefer === null) {
        localStorage.setItem("vtapi-offsetLoc", DEFAULTS);
        return DEFAULTS;
    }
    return prefer;
}

function isType(data, type) {
    return typeof data === type;
}

function createViewersData(viewers, peakViewers) {
    if (isType(viewers, "number") && isType(peakViewers, "number")) {
        return (
            <p><span className="font-bold">Viewers</span>: {viewers.toLocaleString()} | <span className="font-bold">Peak Viewers</span>: {peakViewers.toLocaleString()}</p>
        )
    } else if (isType(viewers, "number") && !isType(peakViewers, "number")) {
        return <p><span className="font-bold">Viewers</span>: {viewers.toLocaleString()}</p>
    } else if (!isType(viewers, "number") && isType(peakViewers, "number")) {
        return <p><span className="font-bold">Peak Viewers</span>: {peakViewers.toLocaleString()}</p>
    }
    return null;
}

class VideoCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            preferTZ: "UTC+09:00"
        }
    }

    componentDidMount() {
        this.setState({preferTZ: getPreferedTimezone(localStorage)});
    }

    render() {
        let { id, title, channel, timeData, status, thumbnail, viewers, peakViewers, platform, group, is_premiere, is_group } = this.props;
        const { scheduledStartTime, startTime } = timeData;
        const { name, room_id } = channel
        const ch_id = channel.id;

        const borderColor = selectBorderColor(platform);
        const textCol = selectTextColor(platform);

        let ihaIco = platform;
        if (ihaIco === "mildom") {
            ihaIco += "_simple";
        }

        if (status === "upcoming" && platform === "twitch") {
            thumbnail = "https://ttvthumb.glitch.me/" + ch_id;
        }

        const localZone = this.state.preferTZ;
        let properStartTime = null;
        if (status === "upcoming" && scheduledStartTime) {
            const startTimeTZ = DateTime.fromSeconds(scheduledStartTime, {zone: "UTC"}).setZone(localZone);
            properStartTime = startTimeTZ.toFormat("EEE, dd MMM yyyy HH:mm:ss ZZZZ");
        } else if (status === "upcoming" && startTime) {
            const startTimeTZ = DateTime.fromSeconds(startTime, {zone: "UTC"}).setZone(localZone);
            properStartTime = startTimeTZ.toFormat("EEE, dd MMM yyyy HH:mm:ss ZZZZ");
        } else if (status === "live" && startTime) {
            const startTimeTZ = DateTime.fromSeconds(startTime, {zone: "UTC"}).setZone(localZone);
            properStartTime = startTimeTZ.toFormat("EEE, dd MMM yyyy HH:mm:ss ZZZZ");
        }

        const viewersJSX = createViewersData(viewers, peakViewers);
        const watchUrl = prependWatchUrl(id, ch_id, room_id, platform);

        return (
            <>
                <div id={"vid-" + id + "-" + platform} className="flex bg-gray-900 col-span-1 rounded-lg">
                    <div className={"m-auto shadow-md rounded-lg w-full border " + borderColor}>
                        <div className="relative">
                            <a href={watchUrl}>
                                <img src={thumbnail} alt={name + " Video Thumbnail"} className="w-full object-cover object-center rounded-t-lg" />
                            </a>
                        </div>
                        <div className="px-4 mt-4 text-gray-200 bg-gray-900">
                            <p className="mt-1 text-sm tracking-wide font-bold">
                                <i className={textCol + " mr-2 ihaicon ihaico-" + ihaIco}></i>
                                {prettyPlatformName(platform)}
                            </p>
                            <p className="mt-2 text-white text-lg font-semibold">{title}</p>
                        </div>
                        <div className="px-4 mt-2 text-gray-200 bg-gray-900">
                            <p><span className="font-bold">Streamer</span>: {name}</p>
                            <p><span className="font-bold">Start</span>: {properStartTime}</p>
                            {viewersJSX}
                        </div>
                        <div className="rounded-b-lg px-4 py-4 mt-0">
                            <Buttons use="a" href={watchUrl} type="danger">Watch!</Buttons>
                        </div>
                    </div>
                </div>
            </>
        )
    }

}

export default VideoCard;
