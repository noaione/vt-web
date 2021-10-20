import React from "react";
import Head from "next/head";
import { NextPageContext } from "next";

import ReactTooltip from "react-tooltip";
import { find, get } from "lodash";
import { DateTime } from "luxon";

import MetadataHead from "../../components/MetadataHead";
import CountUp, { CountUpCallback } from "../../components/CountUp";
import Navbar from "../../components/Navbar";
import { VideoCardProps } from "../../components/VideoCard";
import TimeVideoInfoBlock from "../../components/VideoInfo/TimeBlock";
import Toki, { TokiProps } from "../../components/VideoInfo/Toki";
import VideoEmbed from "../../components/VideoEmbed";
import UserCard from "../../components/UserCard";

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
import { ChannelCardProps } from "../../components/ChannelCard";

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
                mentions {
                    id
                    name
                    en_name
                    image
                    platform
                    group
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
                mentions {
                    id
                    name
                    en_name
                    image
                    platform
                    group
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
    mentions?: ChannelCardProps[];
}

export default class VideoPageInfo extends React.Component<VideoPageInfoProps, VideoPageInfoState> {
    timerTick?: NodeJS.Timeout;
    viewersCb?: CountUpCallback;
    peakViewersCb?: CountUpCallback;

    static async getInitialProps({ query }: NextPageContext) {
        const { videoid } = query;
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
            data: rawData[0],
        };
    }

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
            mentions: [],
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
            mentions,
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
            mentions,
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
            mentions,
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
        if (platform === "twitter") {
            thumbnail = "https://ttvthumb.glitch.me/twtr/" + channel_id;
        }

        const niceName = en_name || name;
        let ihaIco = platform as string;
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

        if (platform === "twitter") {
            ihaIco = "ihaicon-ex ihaicon-ex-twitter";
        } else {
            ihaIco = "ihaicon ihaico-" + ihaIco;
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
                                    <i className={selectTextColor(platform) + " mr-2 " + ihaIco} />
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
                                    <UserCard
                                        isLive={status === "live"}
                                        platform={platform}
                                        channel={{
                                            id: channel_id,
                                            name: niceName,
                                            group: orgzName,
                                            image,
                                        }}
                                    />
                                </div>
                            </div>
                            {Array.isArray(mentions) && mentions.length > 0 && (
                                <div className="flex flex-col">
                                    <p className="lg:text-center mt-4">
                                        <span
                                            className="font-bold dotted-line"
                                            data-tip="This might not be accurate!"
                                        >
                                            Collabing with
                                        </span>
                                    </p>
                                    <ReactTooltip place="top" type="info" effect="solid" />
                                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 lg:justify-center items-center text-center gap-2">
                                        {mentions.map((channel) => {
                                            const { id, platform, group, image } = channel;
                                            const niceName = channel.en_name || channel.name;
                                            const orgzName = get(
                                                GROUPS_NAME_MAP,
                                                group,
                                                capitalizeLetters(group)
                                            );
                                            return (
                                                <UserCard
                                                    key={`mention-${platform}-${id}`}
                                                    platform={platform}
                                                    channel={{
                                                        name: niceName,
                                                        group: orgzName,
                                                        id,
                                                        image,
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

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
