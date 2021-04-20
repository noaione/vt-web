import _ from "lodash";
import React from "react";
import Head from "next/head";
import { useRouter, withRouter } from "next/router";

import { DateTime } from "luxon";
import CountUp from 'react-countup';
import TimeAgo from 'react-timeago'

import { AreaChart, XAxis, YAxis, Tooltip, Area, ResponsiveContainer } from "recharts";

import NotFoundPage from "../404";
import { GROUPS_NAME_MAP } from "../../lib/vt";

import Navbar from "../../components/navbar";

import SEOMetaTags from "../../components/header/seo";
import HeaderDefault from "../../components/header/head";
import HeaderPrefetch from "../../components/header/prefetch";
import { route } from "next/dist/next-server/server/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faUser } from "@fortawesome/free-solid-svg-icons";

function capitalizeLetters(text) {
    return text.slice(0).toUpperCase() + text.slice(1);
}

const QueryChannel = `
query VTuberChannelHistory($chId:[ID],$platf:PlatformName) {
    vtuber {
        channels(id:$chId,limit:1,platforms:[$platf]) {
            items {
                id
                name
                en_name
                image
                group
                platform
                statistics {
                    subscriberCount
                    viewCount
                }
                history {
                    viewsCount {
                        data
                        time
                    }
                    subscribersCount {
                        data
                        time
                    }
                }
                publishedAt
            }
        }
    }
}
`

const QueryVideos = `
query VTuberChannelHistory($chId:[ID],$platf:PlatformName,$sort:String) {
    vtuber {
        videos(channel_id:$chId,limit:20,platforms:[$platf],sort_by:$sort) {
            items {
                id
                title
                status
                thumbnail
                timeData {
                    startTime
                    endTime
                    publishedAt
                }
                averageViewers
                peakViewers
                group
                platform
            }
        }
    }
}
`

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

function isType(data, type) {
    return typeof data === type;
}

function isNone(data) {
    return typeof data === "undefined" || data === null;
}

function walk(data, note) {
    const nots = note.split(".");
    for (let i = 0; i < nots.length; i++) {
        if (isNone(data)) {
            break;
        }
        const n = nots[i];
        data = data[n];
    }
    return data;
}

async function QueryFetch(channelId, platform, querySchema = QueryChannel) {
    let variables = {
        chId: channelId,
        platf: platform
    };
    if (querySchema === QueryVideos) {
        if (platform === "youtube") {
            variables["sort"] = "timeData.endTime";
        } else {
            variables["sort"] = "timeData.publishedAt";
        }
    }
    let apiRes = await fetch("https://api.ihateani.me/v2/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            query: querySchema,
            variables: variables,
        })
    }).then((res) => res.json());
    return apiRes;
}

function platformToShortCode(platform) {
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
    return shortCode;
}

const outQuinticEasing = function (t, b, c, d) {
    let ts = (t /= d) * t;
    let tc = ts * t;
    return b + c * (tc * ts + -5 * ts * ts + 10 * tc + -10 * ts + 5 * t);
}

function reparseHistory(history) {
    const reparsed = [];
    history.forEach((res) => {
        const properTime = DateTime.fromSeconds(res.time, {zone: "UTC"}).setZone("UTC+09:00");
        reparsed.push({
            time: properTime.toFormat("MM'/'dd"),
            data: res.data,
        });
    });
    return reparsed;
}

const RechartsStyles = {
    backgroundColor: "bg-gray-500",
}

function ToolTipFormatter(value, name, props) {
    return value.toLocaleString();
}

function tickFormatter(num) {
    const si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "k" },
        { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "G" },
        { value: 1E12, symbol: "T" },
        { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(2).replace(rx, "$1") + si[i].symbol;
}

function prependWatchUrl(videoId, channelId, platform) {
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

function createViewersData(viewers, peakViewers) {
    if (isType(viewers, "number") && isType(peakViewers, "number")) {
        return <p><FontAwesomeIcon className="text-gray-400" icon={faUser} /> <span className="font-bold">Average</span>: {viewers.toLocaleString()} | <span className="font-bold">Peak</span>: {peakViewers.toLocaleString()}</p>
    } else if (isType(viewers, "number") && !isType(peakViewers, "number")) {
        return <p><FontAwesomeIcon className="text-gray-400" icon={faUser} /> <span className="font-bold">Average</span>: {viewers.toLocaleString()}</p>
    } else if (!isType(viewers, "number") && isType(peakViewers, "number")) {
        return <p><FontAwesomeIcon className="text-gray-400" icon={faUser} /> <span className="font-bold">Peak</span>: {peakViewers.toLocaleString()}</p>
    }
    return null;
}

class ChannelPageVideoCard extends React.Component {
    render() {
        const { id, title, status, thumbnail, timeData, platform, averageViewers, peakViewers, channelId } = this.props;
        const { endTime, publishedAt } = timeData;

        let ihaIco = platform;
        if (ihaIco === "mildom") {
            ihaIco += "_simple";
        }

        const borderColor = selectBorderColor(platform);
        const watchUrl = prependWatchUrl(id, channelId, platform);
        const initText = status === "video" ? "Uploaded" : "Streamed";
        let endTimeDate = DateTime.fromSeconds(endTime, {zone: "UTC"}).toJSDate();
        if (["mildom", "twitch", "twitcasting"].includes(platform)) {
            endTimeDate = DateTime.fromISO(publishedAt, {zone: "UTC"}).toJSDate();
        }
        const viewersJSX = createViewersData(averageViewers, peakViewers);

        return (
            <>
                <div id={"vid-" + id + "-" + platform} className="flex col-span-1 bg-gray-900 rounded-lg">
                    <div className={"m-auto shadow-md rounded-lg w-full border " + borderColor}>
                        <div className="relative">
                            <a href={watchUrl}>
                                <img src={thumbnail} alt={name + " Video Thumbnail"}  className="w-full object-cover object-center rounded-t-lg" />
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
                            <p><FontAwesomeIcon className="text-gray-400" icon={faClock} /> <span className="font-bold">{initText}</span> <TimeAgo date={endTimeDate} /></p>
                            {viewersJSX}
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

class ChannelPageInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            videosLoading: true,
            videosData: [],
        }
    }

    componentDidMount() {
        const {data} = this.props;
        const {id, platform} = data;
        QueryFetch(id, platform, QueryVideos).then((res) => {
            let reparsedData = walk(res, "data.vtuber.videos.items") || [];
            if (platform === "youtube") {
                reparsedData = _.sortBy(reparsedData, (o) => o.timeData.endTime).reverse();
            } else {
                reparsedData = _.sortBy(reparsedData, (o) => o.timeData.publishedAt).reverse();
            }
            this.setState({videosLoading: false, videosData: reparsedData});
        }).catch((err) => {
            this.setState({videosLoading: false});
        })
    }

    render() {
        const { data } = this.props;

        const {id, name, en_name, image, group, statistics, history, publishedAt, platform} = data;
        let { subscriberCount, viewCount } = statistics;
        subscriberCount = subscriberCount || 0;
        viewCount = viewCount || 0;
        const niceName = en_name || name;
        const borderName = "border-4 " + selectBorderColor(platform);
        let ihaIco = platform;
        if (ihaIco === "mildom") {
            ihaIco += "_simple";
        }
        const orgzName = _.get(GROUPS_NAME_MAP, group, capitalizeLetters(group));
        return (
            <>
                <Head>
                    <HeaderDefault />
                    <title>{niceName} :: VTuber API</title>
                    <SEOMetaTags title={niceName} url={`/channel/${platformToShortCode(platform)}-${id}`} image={image} description={"Channel Information for " + niceName} />
                    <HeaderPrefetch />
                </Head>
                <Navbar mode="channel" noSticky />
                <main className="antialiased h-full pb-4 mx-4 mt-6 px-4">
                    <div className="flex flex-col mx-auto text-center justify-center">
                        <img className={"rounded-full mx-auto h-64 " + borderName} src={image} />
                        <h2 className="text-xl font-bold text-white mt-3">
                            <i className={"mr-2 ihaicon ihaico-" + ihaIco}></i>
                            {niceName}
                        </h2>
                        <h5 className="text-gray-400">
                            {name}
                        </h5>
                        <h6 className="text-gray-400 font-light">
                            Organization: {orgzName}
                        </h6>
                    </div>
                    <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-4 text-center">
                        <div className="col-span-1 text-white">
                            Subscribers:
                            <CountUp
                                className="font-bold ml-2"
                                duration={3}
                                useEasing
                                easingFn={outQuinticEasing}
                                suffix=" Subs"
                                start={0}
                                formattingFn={(val) => val.toLocaleString()}
                                end={subscriberCount}
                            />
                        </div>
                        <div className="col-span-1 text-white">
                            Views:
                            <CountUp
                                className="font-bold ml-2"
                                duration={3}
                                useEasing
                                easingFn={outQuinticEasing}
                                suffix=" Views"
                                start={0}
                                formattingFn={(val) => val.toLocaleString()}
                                end={viewCount}
                            />
                        </div>
                    </div>
                    <hr className="mt-4" />
                    <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 justify-center">
                        <div className="flex justify-center">
                            <ResponsiveContainer width="80%" height={420}>
                                <AreaChart
                                    data={reparseHistory(history.subscribersCount)}
                                    margin={{top: 20, right: 30, left: 0, bottom: 0}}
                                >
                                    <defs>
                                        <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff0000" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ff0000" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" />
                                    <YAxis tickFormatter={tickFormatter} domain={["dataMin - 100", "dataMax + 100"]} />
                                    <Tooltip formatter={ToolTipFormatter} labelClassName="text-gray-700" />
                                    <Area type="monotone" name="Subs" unit=" Subscribers" dataKey="data" stroke="#ff0000" fillOpacity={1} fill="url(#colorSubs)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center">
                            <ResponsiveContainer width="80%" height={420}>
                                <AreaChart
                                    data={reparseHistory(history.viewsCount)}
                                    margin={{top: 20, right: 30, left: 0, bottom: 0}}
                                >
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0535DA" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#0535DA" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" />
                                    <YAxis tickFormatter={tickFormatter} domain={["dataMin - 100", "dataMax + 100"]} />
                                    <Tooltip formatter={ToolTipFormatter} labelClassName="text-gray-700" />
                                    <Area type="monotone" name="Views" unit=" Views" dataKey="data" stroke="#0535DA" fillOpacity={1} fill="url(#colorViews)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <hr className="mt-4" />
                    <div className="mt-4">
                        <span className="text-lg font-semibold">Videos (Last 20 Videos)</span>
                    </div>
                    {
                        this.state.videosLoading ?
                        <>
                            <div className="mt-2 text-2xl font-light animate-pulse">
                                Loading...
                            </div>
                        </>
                        :
                        <>
                            <div className="mt-4 grid mx-6 md:mx-16 lg:mx-24 grid-cols-1 md:grid-cols-3 lg:grid-cols-5 justify-center gap-4 items-start">
                                {this.state.videosData.map((res) => {
                                    return <ChannelPageVideoCard {...res} channelId={id} />
                                })}
                            </div>
                        </>
                    }
                </main>
            </>
        )
    }
}

function shortCodeToPlatform(shortCode) {
    switch (shortCode) {
        case "yt":
            return "youtube";
        case "b2":
            return "bilibili";
        case "ttv":
            return "twitch";
        case "twcast":
            return "twitcasting";
        case "md":
            return "mildom";
        default:
            return null;
    }
}

const ChannelPageRouteDynamic = () => {
    const router = useRouter();
    const { chid } = router.query;
    try {
        const [ shortCode, channelId ] = chid.split("-");
        const platform = shortCodeToPlatform(shortCode);
        if (platform === null) {
            return <NotFoundPage />
        }
        if (isType(channelId, "string") && isType(shortCode, "string")) {
            return <ChannelPageInfo platform={platform} channelId={channelId} />
        }
        return <NotFoundPage />
    } catch (e) {
        return (
            <>
                <Head>
                    <HeaderDefault />
                    <title>Channel Page :: VTuber API</title>
                    <SEOMetaTags title="Channel Page" description="An information and statistics about a VTuber channel" />
                    <HeaderPrefetch />
                </Head>
                <main className="antialiased h-full pb-4 mx-4 mt-6"></main>
            </>
        )
    }

}

export async function getStaticProps(context) {
    const { chid } = context.params;
    if (!isType(chid, "string")) {
        return {
            notFound: true,
        }
    }

    const splittedChIds = chid.split("-");
    if (splittedChIds.length < 2) {
        return {
            notFound: true
        }
    }
    const shortCode = splittedChIds[0];
    const channelId = splittedChIds.slice(1).join("-");
    const platform = shortCodeToPlatform(shortCode);
    if (!isType(platform, "string")) {
        return {
            notFound: true,
        }
    }

    const res = await QueryFetch(channelId, platform);
    const rawData = walk(res, "data.vtuber.channels.items");
    if (!Array.isArray(rawData)) {
        return {
            notFound: true,
        }
    }
    if (rawData.length < 1) {
        return {
            notFound: true,
        }
    }

    return {
        props: {data: rawData[0]},
    }
} 

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export default ChannelPageInfo;
