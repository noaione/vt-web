import React from "react";
import Head from "next/head";
import { GetStaticPropsContext } from "next";

import CountUp from "react-countup";
import TimeAgo from "react-timeago";
import { find, get, padStart } from "lodash";
import { DateTime } from "luxon";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import MetadataHead from "../../components/MetadataHead";
import Navbar from "../../components/Navbar";
import { VideoCardProps } from "../../components/VideoCard";

import { capitalizeLetters, isType, Nullable, walk } from "../../lib/utils";
import {
    GROUPS_NAME_MAP,
    platformToShortCode,
    PlatformType,
    prependWatchUrl,
    prettyPlatformName,
    selectTextColor,
    shortCodeToPlatform,
} from "../../lib/vt";

const QueryVideos = `
query VTuberChannelHistory($id:[ID],$platf:PlatformName) {
    vtuber {
        videos(id:$id,limit:10,platforms:[$platf],statuses:[live,upcoming,past,video]) {
            items {
                id
                title
                status
                thumbnail
                timeData {
                    startTime
                    endTime
                    scheduledStartTime
                    publishedAt
                }
                channel {
                    name
                    room_id
                    en_name
                    image
                }
                channel_id
                viewers
                averageViewers
                peakViewers
                group
                platform
                is_premiere
                is_member
            }
        }
    }
}
`;

const QueryVideoUpdate = `
query VTuberVideoUpdate($id:[ID],$platf:PlatformName) {
    vtuber {
        videos(id:$id,limit:10,platforms:[$platf],statuses:[live,upcoming,past,video]) {
            items {
                id
                viewers
                averageViewers
                peakViewers
                status
                timeData {
                    startTime
                    endTime
                    scheduledStartTime
                    publishedAt
                }
            }
        }
    }
}`;

async function QueryFetch(videoId: string, platform: PlatformType, querySchema = QueryVideos) {
    const variables: { [key: string]: any } = {
        id: videoId,
        platf: platform,
    };
    const apiRes = await fetch("https://api.ihateani.me/v2/graphql?nocache=1", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            query: querySchema,
            variables: variables,
        }),
    }).then((res) => res.json());
    return apiRes;
}

export async function getStaticProps(context: GetStaticPropsContext) {
    const { videoid } = context.params;
    if (!isType(videoid, "string")) {
        return {
            notFound: true,
        };
    }

    const selectOneVideo = Array.isArray(videoid) ? videoid[0] : videoid;

    const splittedVideoIDS = selectOneVideo.split("-");
    if (splittedVideoIDS.length < 2) {
        return {
            notFound: true,
        };
    }
    const shortCode = splittedVideoIDS[0];
    const videoId = splittedVideoIDS.slice(1).join("-");
    const platform = shortCodeToPlatform(shortCode);
    if (!isType(platform, "string")) {
        return {
            notFound: true,
        };
    }

    const res = await QueryFetch(videoId, platform);
    const rawData = walk(res, "data.vtuber.videos.items");
    if (!Array.isArray(rawData)) {
        return {
            notFound: true,
        };
    }
    if (rawData.length < 1) {
        return {
            notFound: true,
        };
    }

    return {
        props: { data: rawData[0] },
    };
}

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: "blocking",
    };
}

const outQuinticEasing = function (t: number, b: number, c: number, d: number) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc * ts + -5 * ts * ts + 10 * tc + -10 * ts + 5 * t);
};

function zeroPad(num: number) {
    return padStart(Math.floor(num).toString(), 2, "0");
}

interface CountUpProps {
    initialValue: number;
    updateKey: string;
    callback: (callbacks: { update(value: number): void }, updateKey: string) => void;
}

interface CountUpState {
    value: number;
}

class CountUpViewersClass extends React.Component<CountUpProps, CountUpState> {
    private cref: React.RefObject<CountUp>;

    constructor(props) {
        super(props);
        this.cref = React.createRef<CountUp>();
        this.updateBound = this.updateBound.bind(this);
        this.state = {
            value: this.props.initialValue,
        };
    }

    updateBound(value: number) {
        if (typeof value !== "number") {
            console.warn("Will not update value, since it's not a number");
            return;
        }
        if (this.cref && this.cref.current) {
            console.info(`Updating ${this.props.updateKey} to ${value}`);
            // @ts-ignore
            this.cref.current.update(value);
        }
    }

    componentDidMount() {
        const updateBound = this.updateBound;
        this.props.callback(
            {
                // @ts-ignore
                update: (value: number) => updateBound(value),
            },
            this.props.updateKey
        );
    }

    render() {
        const { value } = this.state;

        return (
            <CountUp
                ref={this.cref}
                start={0}
                end={value}
                duration={2}
                easingFn={outQuinticEasing}
                useEasing
                formattingFn={(n) => n.toLocaleString()}
            />
        );
    }
}

function durationToText(seconds: number) {
    const s = seconds % 60;
    const m = (seconds / 60) % 60;
    const h = (seconds / 3600) % 60;
    if (h > 0) {
        return `${zeroPad(h)}:${zeroPad(m)}:${zeroPad(s)}`;
    }
    return `${zeroPad(m)}:${zeroPad(s)}`;
}

interface TimeTickerProps {
    startTime?: Nullable<number>;
    raw?: boolean;
}

interface TimeTickerState {
    currentTime: number;
}

class TimeTicker extends React.Component<TimeTickerProps, TimeTickerState> {
    timerState?: NodeJS.Timeout;
    constructor(props) {
        super(props);
        this.state = {
            currentTime: DateTime.utc().toSeconds(),
        };
    }

    componentDidMount() {
        this.timerState = setInterval(() => {
            this.setState((prevState) => ({ currentTime: prevState.currentTime + 1 }));
        }, 1000);
    }

    componentWillUnmount() {
        if (this.timerState) {
            clearInterval(this.timerState);
        }
    }

    render() {
        const { startTime, raw } = this.props;
        const { currentTime } = this.state;
        if (typeof startTime !== "number") {
            return null;
        }

        if (raw) {
            return <span>{durationToText(currentTime - startTime)}</span>;
        }

        return (
            <div className="flex flex-row justify-center items-center">
                <FontAwesomeIcon className="text-gray-400" icon={faClock} />{" "}
                <span className="ml-2 text-gray-400 font-bold">Elapsed:</span>
                <span className="ml-1 text-gray-400 font-medium">
                    {durationToText(currentTime - startTime)}
                </span>
            </div>
        );
    }
}

function TimeAgoWrapper({ timeData }: { timeData: number }) {
    if (typeof timeData !== "number") {
        return null;
    }

    const isFuture = DateTime.utc().toSeconds() >= timeData;

    return (
        <div className="flex flex-row justify-center items-center">
            <FontAwesomeIcon className="text-gray-400" icon={faClock} />{" "}
            <span className="ml-2 text-gray-400 font-bold">{isFuture ? "Streamed" : "Streaming"}</span>{" "}
            <TimeAgo
                className="ml-1 text-gray-400 font-light"
                date={DateTime.fromSeconds(timeData, { zone: "UTC" }).toJSDate()}
            />
        </div>
    );
}

interface TimeData {
    scheduledStartTime?: Nullable<number>;
    startTime?: Nullable<number>;
    endTime?: Nullable<number>;
    publishedAt: string;
    status: "live" | "upcoming" | "past" | "video";
}

function createTimeData({ startTime, endTime, scheduledStartTime, publishedAt, status }: TimeData) {
    if (status === "live") {
        return <TimeTicker startTime={startTime} />;
    }
    if (status === "upcoming") {
        return <TimeAgoWrapper timeData={scheduledStartTime} />;
    }
    if (status === "past") {
        return <TimeAgoWrapper timeData={endTime} />;
    }
    return (
        <div className="flex flex-row justify-center items-center">
            <FontAwesomeIcon className="text-gray-400" icon={faClock} />{" "}
            <span className="ml-2 text-gray-400 font-bold">Uploaded</span>
            <TimeAgo
                className="ml-1 text-gray-400 font-light"
                date={DateTime.fromISO(publishedAt, { zone: "UTC" }).toJSDate()}
            />
        </div>
    );
}

function getPreferedTimezone(localStorage: any) {
    const DEFAULTS = "UTC" + DateTime.local().toFormat("ZZ");
    const prefer = localStorage.getItem("vtapi-offsetLoc");
    if (typeof prefer === "undefined" || prefer === null) {
        localStorage.setItem("vtapi-offsetLoc", DEFAULTS);
        return DEFAULTS;
    }
    return prefer;
}

interface VideoPageInfoProps {
    data: VideoCardProps;
}

interface VideoPageInfoState extends TimeData {
    tz: string;
    callback?: {
        peakViewers?: { update(value: number): void };
        viewers?: { update(value: number): void };
    };
    viewers?: number;
    peakViewers?: number;
    averageViewers?: number;
}

export default class VideoPageInfo extends React.Component<VideoPageInfoProps, VideoPageInfoState> {
    timerTick?: NodeJS.Timeout;

    constructor(props: VideoPageInfoProps) {
        super(props);
        this.callbackViewersUpdater = this.callbackViewersUpdater.bind(this);
        this.updaterTick = this.updaterTick.bind(this);
        const {
            status,
            timeData: { scheduledStartTime, startTime, endTime, publishedAt },
            averageViewers,
            peakViewers,
            viewers,
        } = this.props.data;
        this.state = {
            tz: "UTC+09:00",
            callback: {
                peakViewers: undefined,
                viewers: undefined,
            },
            scheduledStartTime,
            startTime,
            endTime,
            publishedAt,
            status,
            averageViewers,
            viewers,
            peakViewers,
        };
    }

    async updaterTick() {
        const { id, platform } = this.props.data;
        const { status: Statuses } = this.state;
        if (Statuses === "video" || Statuses === "past") {
            // Will not update if status is video or past
            return;
        }
        const requested = await QueryFetch(id, platform, QueryVideoUpdate);

        const rawData = walk(requested, "data.vtuber.videos.items") as VideoCardProps[];
        if (!Array.isArray(rawData)) {
            console.error("Failed to update data, got non array answer, ignoring...");
            return;
        }
        if (rawData.length < 1) {
            console.error("Failed to update data, got empty result, ignoring...");
            return;
        }
        const firstData = find(rawData, (o) => o.id === id);
        if (!firstData) {
            console.error("Failed to update data, can't find the data, ignoring...");
            return;
        }

        const {
            status,
            timeData: { scheduledStartTime, startTime, endTime, publishedAt },
            averageViewers,
            peakViewers,
            viewers,
        } = firstData;
        this.setState({
            status,
            scheduledStartTime,
            startTime,
            endTime,
            publishedAt,
            averageViewers,
        });

        if (this.state.callback) {
            if (this.state.callback.peakViewers) {
                this.state.callback.peakViewers.update(peakViewers);
            }
            if (this.state.callback.viewers) {
                this.state.callback.viewers.update(viewers);
            }
        }
    }

    componentDidMount() {
        const tz = getPreferedTimezone(localStorage);
        this.setState({ tz });

        this.timerTick = setInterval(() => {
            console.info("[VideoIntervalUpdater] Executing updater...");
            this.updaterTick()
                .then(() => {
                    console.info("[VideoIntervalUpdater] Successfully updated");
                })
                .catch((err) => {
                    console.error("[VideoIntervalUpdater] Failed to update", err);
                });
        }, 60 * 1000);
    }

    componentWillUnmount() {
        if (this.timerTick) {
            clearInterval(this.timerTick);
        }
    }

    callbackViewersUpdater(cb: { update(value: number): void }, updateKey: string) {
        const { callback } = this.state;
        callback[updateKey] = cb;
        this.setState({ callback });
    }

    render() {
        const {
            id,
            title,
            thumbnail,
            channel_id,
            channel: { name, en_name, room_id, image },
            group,
            platform,
            is_premiere,
            is_member,
        } = this.props.data;

        function statusToExpandedText(st: "live" | "upcoming" | "past" | "video") {
            switch (st) {
                case "live":
                    return "Live";
                case "upcoming":
                    return "Upcoming";
                case "past":
                    return "Past Stream";
                case "video":
                    return "Video Upload";
                default:
                    return capitalizeLetters(st);
            }
        }

        const { scheduledStartTime, startTime, endTime, publishedAt, status } = this.state;
        let { averageViewers, peakViewers, viewers } = this.state;
        averageViewers = averageViewers ?? 0;
        peakViewers = peakViewers ?? 0;
        viewers = viewers ?? 0;

        const niceName = en_name || name;
        let ihaIco = platform;
        if (ihaIco === "mildom") {
            ihaIco += "_simple";
        }
        const orgzName = get(GROUPS_NAME_MAP, group, capitalizeLetters(group));

        const description = `Video Information for stream/video ID ${id} from ${capitalizeLetters(platform)}
        
        **Video title**: ${title}
        **Status**: ${statusToExpandedText(status)}
        **Started/Uploaded at**: ${
            status === "video"
                ? DateTime.fromISO(publishedAt, { zone: "UTC" })
                      .setZone("UTC+09:00")
                      .toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
                : DateTime.fromSeconds(startTime, { zone: "UTC" })
                      .setZone("UTC+09:00")
                      .toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
        }
        `;

        return (
            <>
                <Head>
                    <MetadataHead.Base />
                    <title>{title} :: VTuber API</title>
                    <MetadataHead.SEO
                        title={`${title} - ${niceName}`}
                        description={description}
                        image={thumbnail}
                        urlPath={`/video/${platformToShortCode(platform)}-${id}`}
                    />
                </Head>
                <Navbar mode="video" noSticky />
                <main className="antialiased h-full pb-4 mt-6 px-4 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-4">
                        <div className="flex flex-col mx-auto">
                            <div className="flex justify-center">
                                <a
                                    href={prependWatchUrl(id, channel_id, room_id, platform)}
                                    className="cursor-pointer"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        className="rounded-md w-full object-cover object-center shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                                        src={thumbnail}
                                        loading="lazy"
                                    />
                                </a>
                            </div>
                            <div className="flex justify-center mt-2">
                                <p className="mt-1 text-sm tracking-wide font-bold">
                                    <i
                                        className={
                                            selectTextColor(platform) + " mr-2 ihaicon ihaico-" + ihaIco
                                        }
                                    />
                                    {is_premiere && <i className="mr-2 ihaicon ihaico-play text-blue-400" />}
                                    {is_member && <i className="mr-2 ihaicon ihaico-lock text-yellow-400" />}
                                    {prettyPlatformName(platform)}
                                    {is_premiere && <span className="mr-2">{" (Premiere)"}</span>}
                                    {is_member && <span className="mr-2">{" (Member-Only)"}</span>}
                                </p>
                            </div>
                            <div className="flex justify-center text-center mt-1 mb-2 lg:mb-0">
                                {createTimeData({
                                    startTime,
                                    endTime,
                                    scheduledStartTime,
                                    publishedAt,
                                    status,
                                })}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-xl font-bold mx-auto">{title}</div>
                            <div className="flex flex-col">
                                <div className="mt-4 flex flex-row lg:justify-center items-center text-center gap-2">
                                    {status === "live" && (
                                        <div className="hidden lg:flex flex-row items-center gap-1">
                                            <div className="flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75" />
                                                <span className="w-3 h-3 inline-flex rounded-full bg-red-500" />
                                            </div>
                                            <span className="uppercase ml-1 text-sm font-bold tracking-wider text-red-400">
                                                Live
                                            </span>
                                        </div>
                                    )}
                                    <a
                                        href={`/channel/${platformToShortCode(platform)}-${channel_id}`}
                                        className="justify-center flex"
                                    >
                                        <img
                                            className="rounded-full justify-center h-10 object-cover object-center hover:opacity-80 duration-150 transition-opacity ease-in-out"
                                            src={image}
                                            loading="lazy"
                                        />
                                    </a>
                                    <div className="justify-start text-left">
                                        <div className="font-semibold">{niceName}</div>
                                        <div className="text-sm font-semibold text-gray-300 tracking-wide justify-start">
                                            {orgzName}
                                        </div>
                                    </div>
                                    {status === "live" && (
                                        <div className="flex lg:hidden flex-row items-center gap-1 ml-2">
                                            {/* Mobile version */}
                                            <div className="flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75" />
                                                <span className="w-3 h-3 inline-flex rounded-full bg-red-500" />
                                            </div>
                                            <span className="uppercase ml-1 text-sm font-bold tracking-wider text-red-400">
                                                Live
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div
                                className={`grid ${
                                    status === "video" ? "grid-cols-1" : "grid-cols-2"
                                } justify-between mt-4 items-center`}
                            >
                                <div className="flex flex-col">
                                    <div className="font-bold justify-center text-center">
                                        {status === "video" ? (
                                            <span>
                                                {DateTime.fromISO(publishedAt, { zone: "UTC" })
                                                    .setZone(this.state.tz)
                                                    .setLocale("en")
                                                    .toFormat("dd LLL yyyy")}
                                            </span>
                                        ) : (
                                            <span>
                                                {DateTime.fromSeconds(
                                                    status === "upcoming" ? scheduledStartTime : startTime,
                                                    { zone: "UTC" }
                                                )
                                                    .setZone(this.state.tz)
                                                    .setLocale("en")
                                                    .toFormat("dd LLL yyyy")}
                                            </span>
                                        )}
                                    </div>
                                    <div className="font-light text-2xl mt-1 justify-center text-center">
                                        {status === "video" ? (
                                            <span>
                                                {DateTime.fromISO(publishedAt, { zone: "UTC" })
                                                    .setZone(this.state.tz)
                                                    .setLocale("en")
                                                    .toFormat("HH:mm:ss")}
                                            </span>
                                        ) : (
                                            <span>
                                                {DateTime.fromSeconds(
                                                    status === "upcoming" ? scheduledStartTime : startTime,
                                                    { zone: "UTC" }
                                                )
                                                    .setZone(this.state.tz)
                                                    .setLocale("en")
                                                    .toFormat("HH:mm:ss")}
                                            </span>
                                        )}
                                    </div>
                                    <div className="font-semibold text-sm mt-1 justify-center text-center text-gray-300">
                                        {status === "video"
                                            ? "Published at"
                                            : status !== "upcoming"
                                            ? "Start time"
                                            : "Scheduled start time"}{" "}
                                        {"("}
                                        {this.state.tz}
                                        {")"}
                                    </div>
                                </div>
                                {status !== "video" && (
                                    <div className="flex flex-col">
                                        <div className="font-bold justify-center text-center">
                                            {status === "upcoming" ? (
                                                <span>XX/XX/20XX</span>
                                            ) : (
                                                <span>
                                                    {DateTime.fromSeconds(
                                                        status === "past" ? endTime : startTime,
                                                        { zone: "UTC" }
                                                    )
                                                        .setZone(this.state.tz)
                                                        .setLocale("en")
                                                        .toFormat("dd LLL yyyy")}
                                                </span>
                                            )}
                                        </div>
                                        <div className="font-light text-2xl mt-1 justify-center text-center">
                                            {status === "upcoming" ? (
                                                <span>N/A</span>
                                            ) : status === "live" ? (
                                                <TimeTicker startTime={startTime} raw />
                                            ) : (
                                                <span>{durationToText(endTime - startTime)}</span>
                                            )}
                                        </div>
                                        <div className="font-semibold text-sm mt-1 justify-center text-center text-gray-300">
                                            {is_premiere ? "Video" : "Stream"} Duration
                                        </div>
                                    </div>
                                )}
                            </div>
                            {!["upcoming", "video"].includes(status) && (
                                <>
                                    <div className="block lg:hidden text-center mt-4 text-lg font-bold">
                                        Viewers Data
                                    </div>
                                    <div className="grid grid-cols-2 justify-between mt-0 lg:mt-4">
                                        <div className="flex flex-col">
                                            <div className="font-light text-2xl mt-1 justify-center text-center">
                                                {status === "past" ? (
                                                    <span>{averageViewers.toLocaleString()}</span>
                                                ) : (
                                                    <CountUpViewersClass
                                                        initialValue={viewers}
                                                        updateKey="viewers"
                                                        callback={this.callbackViewersUpdater}
                                                    />
                                                )}
                                            </div>
                                            <div className="font-semibold text-sm mt-1 justify-center text-center text-gray-300">
                                                {status === "past" ? "Average Viewers" : "Current Viewers"}
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="font-light text-2xl mt-1 justify-center text-center">
                                                {status === "past" ? (
                                                    <span>{peakViewers.toLocaleString()}</span>
                                                ) : (
                                                    <CountUpViewersClass
                                                        initialValue={peakViewers}
                                                        updateKey="peakViewers"
                                                        callback={this.callbackViewersUpdater}
                                                    />
                                                )}
                                            </div>
                                            <div className="font-semibold text-sm mt-1 justify-center text-center text-gray-300">
                                                Peak Viewers
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </>
        );
    }
}
