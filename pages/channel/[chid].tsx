import React from "react";
import Head from "next/head";
import { NextPageContext } from "next";

import CountUp from "react-countup";
import InfiniteScroll from "react-infinite-scroll-component";
import { get, sortBy } from "lodash";
import { DateTime } from "luxon";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import MetadataHead from "../../components/MetadataHead";
import Navbar from "../../components/Navbar";
import VideoCardSmall from "../../components/VideoCardSmall";
import { ChannelCardProps } from "../../components/ChannelCard";
import { VideoCardProps } from "../../components/VideoCard";
import Markdownify from "../../components/Markdown";
import InfoIcon from "../../components/Icon/InfoIcon";

import { capitalizeLetters, isType, Nullable, walk } from "../../lib/utils";
import {
    fixTwitcastingProfileSize,
    GROUPS_NAME_MAP,
    platformToShortCode,
    PlatformType,
    prependChannelURL,
    prettyPlatformName,
    selectBorderColor,
    selectPlatformColor,
    shortCodeToPlatform,
} from "../../lib/vt";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const QueryChannel = `
query VTuberChannelHistory($chId:[ID],$platf:PlatformName) {
    vtuber {
        channels(id:$chId,limit:1,platforms:[$platf]) {
            items {
                id
                room_id
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
                is_retired
                extraNote
            }
        }
    }
}
`;

const QueryVideos = `
query VTuberChannelHistory($chId:[ID],$platf:PlatformName,$sort:String,$cur:String) {
    vtuber {
        videos(channel_id:$chId,limit:20,platforms:[$platf],sort_by:$sort,cursor:$cur) {
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
                is_premiere
            }
            pageInfo {
                nextCursor
                hasNextPage
            }
        }
    }
}
`;

interface BorderSkeleton {
    border?: PlatformType;
}

function VideosPageSmallCardSkeleton({ border }: BorderSkeleton) {
    const borderMap = selectBorderColor(border || "youtube");
    return (
        <div className="flex col-span-1 bg-gray-900 rounded-lg">
            <div className={"m-auto shadow-md rounded-lg w-full border " + borderMap}>
                <div className="relative aspect-w-16 aspect-h-9" style={{ marginTop: "-0.22rem" }}>
                    <Skeleton className="h-full" />
                </div>
                <div className="mt-2 mx-2 text-gray-200">
                    <Skeleton className="h-3 !w-12" />
                    <Skeleton />
                </div>
                <div className="my-2 mx-2 text-sm text-gray-200 flex flex-col">
                    <Skeleton className="!w-44 h-3 !max-w-full" />
                    <Skeleton className="!w-52 h-3 !max-w-full" />
                </div>
                <div className="my-2 mx-2">
                    <Skeleton className="!w-8" />
                </div>
            </div>
        </div>
    );
}

function VideoCollectionSkeleton({ border }: BorderSkeleton) {
    return (
        <SkeletonTheme color="#404040" highlightColor="#525252">
            <div className="mt-4 grid mx-6 md:mx-16 lg:mx-24 grid-cols-1 md:grid-cols-3 lg:grid-cols-5 justify-center gap-4 items-start">
                <VideosPageSmallCardSkeleton border={border} />
                <VideosPageSmallCardSkeleton border={border} />
                <VideosPageSmallCardSkeleton border={border} />
                <VideosPageSmallCardSkeleton border={border} />
                <VideosPageSmallCardSkeleton border={border} />
            </div>
        </SkeletonTheme>
    );
}

function reparseHistory(history) {
    const reparsed = [];
    history.forEach((res) => {
        const properTime = DateTime.fromSeconds(res.time, { zone: "UTC" }).setZone("UTC+09:00");
        reparsed.push({
            time: properTime.toFormat("MM'/'dd"),
            data: res.data,
        });
    });
    return reparsed;
}

const outQuinticEasing = function (t: number, b: number, c: number, d: number) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc * ts + -5 * ts * ts + 10 * tc + -10 * ts + 5 * t);
};

function ToolTipFormatter(value: string, _n: string, _p: any) {
    return value.toLocaleString();
}

function tickFormatter(num: number) {
    const si = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i: number;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(2).replace(rx, "$1") + si[i].symbol;
}

interface ChannelPageInfoProps {
    data: ChannelCardProps;
}

interface ChannelPageInfoState {
    videosLoading: boolean;
    videosData: VideoCardProps[];
    hasMore: boolean;
    nextCursor: Nullable<string>;
}

export default class ChannelPageInfo extends React.Component<ChannelPageInfoProps, ChannelPageInfoState> {
    static async getInitialProps({ query }: NextPageContext) {
        const { chid } = query;
        if (!isType(chid, "string")) {
            return {
                notFound: true,
            };
        }

        const selectOneChannel = Array.isArray(chid) ? chid[0] : chid;

        const splittedChIds = selectOneChannel.split("-");
        if (splittedChIds.length < 2) {
            return {
                notFound: true,
            };
        }
        const shortCode = splittedChIds[0];
        const channelId = splittedChIds.slice(1).join("-");
        const platform = shortCodeToPlatform(shortCode);
        if (!isType(platform, "string")) {
            return {
                notFound: true,
            };
        }

        const res = await QueryFetch(channelId, platform);
        const rawData = walk(res, "data.vtuber.channels.items");
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

    constructor(props) {
        super(props);
        this.videosLoaderData = this.videosLoaderData.bind(this);
        this.state = {
            videosData: [],
            videosLoading: true,
            hasMore: true,
            nextCursor: null,
        };
    }

    videosLoaderData() {
        const { id, platform } = this.props.data;
        const { hasMore, nextCursor } = this.state;
        if (!hasMore) {
            return;
        }
        QueryFetch(id, platform, QueryVideos, { cur: nextCursor }).then((res) => {
            let videosData: VideoCardProps[] = walk(res, "data.vtuber.videos.items") || [];
            const paginationInfo = walk(res, "data.vtuber.videos.pageInfo") || {};
            if (platform === "youtube") {
                videosData = sortBy(videosData, (o) => o.timeData.endTime).reverse();
            } else {
                videosData = sortBy(videosData, (o) => o.timeData.publishedAt).reverse();
            }
            let hasMore = true;
            console.log(
                "%c[Pagination]" + "%c Next cursor: " + `%c${paginationInfo.nextCursor}`,
                "color: blue; padding: 3px; background-color: #fff; border-radius: 4px; font-weight: 700",
                "color:white; font-weight: 700; font-size: 14px;",
                "color: aqua; background-color: #000; padding: 4px;"
            );
            if (!paginationInfo.hasNextPage) {
                hasMore = false;
            }
            const nextCursor = paginationInfo.nextCursor || null;
            this.setState((o) => ({
                videosData: o.videosData.concat(videosData),
                hasMore,
                nextCursor,
            }));
        });
    }

    render() {
        const { id, room_id, name, en_name, group, statistics, history, platform, is_retired, extraNote } =
            this.props.data;
        let { image } = this.props.data;
        let { subscriberCount, viewCount } = statistics;
        subscriberCount = subscriberCount || 0;
        viewCount = viewCount || 0;
        const niceName = en_name || name;
        const borderName = "border-4 " + selectBorderColor(platform);
        let ihaIco = platform;
        if (ihaIco === "mildom") {
            ihaIco += "_simple";
        }
        if (platform === "twitcasting") {
            image = fixTwitcastingProfileSize(image);
        }
        let subsFollowText = "Followers";
        let subsFollowSmallText = "Follow";
        if (platform === "youtube") {
            subsFollowText = "Subscribers";
            subsFollowSmallText = "Subs";
        }
        const orgzName = get(GROUPS_NAME_MAP, group, capitalizeLetters(group));
        const description = `"${niceName}" Channel Information on ${prettyPlatformName(platform)}`;

        let showViewCount = true;
        if (["twitcasting", "twitter"].includes(platform)) {
            showViewCount = false;
        }

        return (
            <>
                <Head>
                    <MetadataHead.Base />
                    <title>{niceName} :: VTuber API</title>
                    <MetadataHead.SEO
                        title={niceName}
                        urlPath={`/channel/${platformToShortCode(platform)}-${id}`}
                        image={image}
                        color={selectPlatformColor(platform)}
                        description={description}
                    />
                    <MetadataHead.Prefetch />
                </Head>
                <Navbar mode="channel" noSticky />
                <main className="antialiased h-full pb-4 mx-4 mt-6 px-4">
                    <div className="flex flex-col mx-auto text-center justify-center">
                        <div className="flex justify-center">
                            <a
                                href={prependChannelURL(id, platform)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    className={"rounded-full mx-auto h-64 " + borderName}
                                    src={image}
                                    loading="lazy"
                                />
                            </a>
                        </div>
                        <h2 className="text-xl font-bold text-white mt-3 items-center">
                            <i className={"mr-2 ihaicon ihaico-" + ihaIco}></i>
                            {niceName}
                            {is_retired && (
                                <span className="text-gray-400 text-base uppercase ml-1">{"(retired)"}</span>
                            )}
                        </h2>
                        <h5 className="text-gray-400">{name}</h5>
                        <h6 className="text-gray-400 font-light">Organization: {orgzName}</h6>
                    </div>
                    <div
                        className={`mt-2 grid grid-cols-1 gap-0 ${
                            showViewCount ? "lg:grid-cols-2 lg:gap-4" : ""
                        } text-center`}
                    >
                        <div className="col-span-1 text-white">
                            {`${subsFollowText}:`}
                            <CountUp
                                className="font-bold ml-2"
                                duration={3}
                                useEasing
                                easingFn={outQuinticEasing}
                                suffix={" " + subsFollowText}
                                start={0}
                                formattingFn={(val) => val.toLocaleString()}
                                end={subscriberCount}
                            />
                        </div>
                        {showViewCount && (
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
                        )}
                    </div>
                    <hr className="mt-4" />
                    <div
                        className={`mt-2 grid grid-cols-1 gap-2 ${
                            showViewCount ? "lg:grid-cols-2 lg:gap-4" : ""
                        } justify-center`}
                    >
                        <div className="flex justify-center">
                            <ResponsiveContainer width="100%" height={420}>
                                <AreaChart
                                    data={reparseHistory(history.subscribersCount)}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff0000" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ff0000" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" />
                                    <YAxis
                                        tickFormatter={tickFormatter}
                                        domain={["dataMin - 100", "dataMax + 100"]}
                                    />
                                    <Tooltip formatter={ToolTipFormatter} labelClassName="text-gray-700" />
                                    <Area
                                        type="monotone"
                                        name={subsFollowSmallText}
                                        unit={` ${subsFollowText}`}
                                        dataKey="data"
                                        stroke="#ff0000"
                                        fillOpacity={1}
                                        fill="url(#colorSubs)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        {showViewCount && (
                            <div className="flex justify-center">
                                <ResponsiveContainer width="100%" height={420}>
                                    <AreaChart
                                        data={reparseHistory(history.viewsCount)}
                                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0535DA" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#0535DA" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="time" />
                                        <YAxis
                                            tickFormatter={tickFormatter}
                                            domain={["dataMin - 100", "dataMax + 100"]}
                                        />
                                        <Tooltip
                                            formatter={ToolTipFormatter}
                                            labelClassName="text-gray-700"
                                        />
                                        <Area
                                            type="monotone"
                                            name="Views"
                                            unit=" Views"
                                            dataKey="data"
                                            stroke="#0535DA"
                                            fillOpacity={1}
                                            fill="url(#colorViews)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                    <hr className="mt-4" />
                    {typeof extraNote === "string" && extraNote.replace(/\s+/, "").length > 0 && (
                        <>
                            <div className="mt-4 border bg-[#1f537180] p-[0.4rem] rounded-lg border-blue-400 border-opacity-50">
                                <div className="w-full p-[0.4rem] text-lg font-bold flex flex-row items-center gap-1">
                                    <InfoIcon className="w-[1.1rem] h-[1.1rem]" />
                                    <span>
                                        Note <span className="font-light text-sm">from WebAdmin</span>
                                    </span>
                                </div>
                                <Markdownify>{extraNote}</Markdownify>
                            </div>
                            <hr className="mt-4" />
                        </>
                    )}
                    <div className="mt-4">
                        <span className="text-lg font-semibold">Videos</span>
                    </div>
                    <InfiniteScroll
                        dataLength={this.state.videosData.length}
                        next={this.videosLoaderData}
                        hasMore={this.state.hasMore}
                        loader={<VideoCollectionSkeleton border={platform} />}
                        endMessage={
                            <div className="my-6 text-xl font-light text-center">
                                Uh oh, seems like you reach the end of the list :&gt;
                            </div>
                        }
                    >
                        <div className="mt-4 grid mx-6 md:mx-16 lg:mx-24 grid-cols-1 md:grid-cols-3 lg:grid-cols-5 justify-center gap-4 items-start">
                            {this.state.videosData.map((res) => {
                                return (
                                    <VideoCardSmall
                                        key={`videosmall-${res.id}`}
                                        {...res}
                                        channel_id={id}
                                        channel={{ room_id, id, name, image, platform, group }}
                                    />
                                );
                            })}
                        </div>
                    </InfiniteScroll>
                </main>
            </>
        );
    }
}

type AnyDict = { [key: string]: any };

async function QueryFetch(
    channelId: string,
    platform: PlatformType,
    querySchema = QueryChannel,
    extraVariables?: AnyDict
) {
    let variables: AnyDict = {
        chId: channelId,
        platf: platform,
    };
    if (typeof extraVariables === "object" && Object.keys(extraVariables).length > 0) {
        variables = Object.assign({}, variables, extraVariables);
    }
    if (querySchema === QueryVideos) {
        if (platform === "youtube") {
            variables.sort = "timeData.endTime";
        } else {
            variables.sort = "timeData.publishedAt";
        }
    }
    const apiRes = await fetch("https://api.ihateani.me/v2/graphql", {
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
