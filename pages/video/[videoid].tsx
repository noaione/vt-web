import React from "react";
import Head from "next/head";
import { GetStaticPropsContext } from "next";

import { find, get } from "lodash";
import { DateTime } from "luxon";

import MetadataHead from "../../components/MetadataHead";
import CountUp, { CountUpCallback } from "../../components/CountUp";
import Navbar from "../../components/Navbar";
import { VideoCardProps } from "../../components/VideoCard";
import TimeVideoInfoBlock from "../../components/VideoInfo/TimeBlock";
import Toki, { TokiProps } from "../../components/VideoInfo/Toki";

import { capitalizeLetters, isType, walk } from "../../lib/utils";
import {
    GROUPS_NAME_MAP,
    platformToShortCode,
    PlatformType,
    prependVideoURLPage,
    prettyPlatformName,
    selectPlatformColor,
    selectTextColor,
    shortCodeToPlatform,
} from "../../lib/vt";
import VideoEmbed from "../../components/VideoEmbed";

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
                    duration
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
                    duration
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

interface VideoPageInfoState extends Omit<TokiProps, "isPremiere"> {
    tz: string;
    viewers?: number;
    peakViewers?: number;
    averageViewers?: number;
}

export default class VideoPageInfo extends React.Component<VideoPageInfoProps, VideoPageInfoState> {
    timerTick?: NodeJS.Timeout;
    viewersCb?: CountUpCallback;
    peakViewersCb?: CountUpCallback;

    constructor(props: VideoPageInfoProps) {
        super(props);
        this.updaterTick = this.updaterTick.bind(this);
        const {
            status,
            timeData: { scheduledStartTime, startTime, endTime, publishedAt, duration },
            averageViewers,
            peakViewers,
            viewers,
        } = this.props.data;
        this.state = {
            tz: "UTC+09:00",
            scheduledStartTime,
            startTime,
            endTime,
            publishedAt,
            status,
            averageViewers,
            viewers,
            peakViewers,
            duration,
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
            timeData: { scheduledStartTime, startTime, endTime, publishedAt, duration },
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
            duration,
        });
        if (this.peakViewersCb) {
            this.peakViewersCb.update(peakViewers);
        }
        if (this.viewersCb) {
            this.viewersCb.update(viewers);
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

    render() {
        const {
            id,
            title,
            channel_id,
            channel: { name, en_name, room_id, image },
            group,
            platform,
            is_premiere,
            is_member,
        } = this.props.data;

        function statusToExpandedText(st: "live" | "upcoming" | "past" | "video", plat: PlatformType) {
            switch (st) {
                case "live":
                    return `[Live on ${prettyPlatformName(plat)}]`;
                case "upcoming":
                    return `Upcoming ${prettyPlatformName(plat)} Stream`;
                case "past":
                    return `Past ${prettyPlatformName(plat)} Stream`;
                case "video":
                    return "Video upload";
                default:
                    return capitalizeLetters(st);
            }
        }

        const { scheduledStartTime, startTime, endTime, publishedAt, status } = this.state;
        let { averageViewers, peakViewers, viewers, duration } = this.state;
        averageViewers = averageViewers ?? -1;
        peakViewers = peakViewers ?? -1;
        viewers = viewers ?? -1;
        duration = duration ?? -1;

        let { thumbnail } = this.props.data;
        if (status === "upcoming" && platform === "twitch") {
            thumbnail = "https://ttvthumb.glitch.me/" + channel_id;
        }

        const niceName = en_name || name;
        let ihaIco = platform;
        if (ihaIco === "mildom") {
            ihaIco += "_simple";
        }
        const orgzName = get(GROUPS_NAME_MAP, group, capitalizeLetters(group));

        const description = `${statusToExpandedText(status, platform)} "${title}" by ${niceName}`;
        let embedId = id;
        if (platform !== "youtube" && platform !== "bilibili") {
            embedId = channel_id;
        } else if (platform !== "youtube" && platform === "bilibili") {
            embedId = room_id;
        }

        return (
            <>
                <Head>
                    <MetadataHead.Base />
                    <title>{title} :: VTuber API</title>
                    <MetadataHead.SEO
                        title={`[${prettyPlatformName(platform)}] ${title}`}
                        description={description}
                        image={thumbnail}
                        urlPath={`/video/${platformToShortCode(platform)}-${id}`}
                        color={selectPlatformColor(platform)}
                    />
                </Head>
                <Navbar mode="video" noSticky />
                <main className="antialiased h-full pb-4 mt-6 px-4 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-4">
                        <div className="flex flex-col">
                            <div className="flex flex-col justify-center w-full h-full">
                                <VideoEmbed
                                    id={embedId}
                                    url={prependVideoURLPage(id, channel_id, room_id, platform, status)}
                                    imageClassName="rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                                    status={status}
                                    platform={platform}
                                    thumbnail={thumbnail}
                                />
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
                                <Toki
                                    startTime={startTime}
                                    endTime={endTime}
                                    scheduledStartTime={scheduledStartTime}
                                    publishedAt={publishedAt}
                                    status={status}
                                    isPremiere={is_premiere}
                                />
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
                            <TimeVideoInfoBlock
                                scheduledStartTime={scheduledStartTime}
                                startTime={startTime}
                                endTime={endTime}
                                duration={duration}
                                publishedAt={publishedAt}
                                status={status}
                                isPremiere={is_premiere}
                                tz={this.state.tz}
                            />
                            {!["upcoming", "video"].includes(status) && (
                                <>
                                    <div className="block lg:hidden text-center mt-4 text-lg font-bold">
                                        Viewers Data
                                    </div>
                                    <div className="grid grid-cols-2 justify-between mt-0 lg:mt-4">
                                        <div className="flex flex-col">
                                            <div className="font-light text-2xl mt-1 justify-center text-center">
                                                {status === "past" ? (
                                                    <span>
                                                        {averageViewers < 0
                                                            ? "N/A"
                                                            : averageViewers.toLocaleString()}
                                                    </span>
                                                ) : (
                                                    <CountUp
                                                        initialValue={viewers}
                                                        onMounted={(cb) => (this.viewersCb = cb)}
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
                                                    <span>
                                                        {peakViewers < 0
                                                            ? "N/A"
                                                            : peakViewers.toLocaleString()}
                                                    </span>
                                                ) : (
                                                    <CountUp
                                                        initialValue={peakViewers}
                                                        onMounted={(cb) => (this.peakViewersCb = cb)}
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
