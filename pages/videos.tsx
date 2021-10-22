import Head from "next/head";
import React from "react";

import InfiniteScroll from "react-infinite-scroll-component";
import { connect, ConnectedProps } from "react-redux";

import MetadataHead from "../components/MetadataHead";
import Navbar from "../components/Navbar";
import { VideoCardProps } from "../components/VideoCard";
import VideosPages from "../components/VideosPages";
import VideosPagesSkeleton from "../components/VideosPagesSkeleton";
import { getLocalStorageData } from "../components/SettingsComponents/helper";

import { Nullable, walk } from "../lib/utils";
import { getGroupsAndPlatformsFilters, ihaAPIQuery } from "../lib/vt";
import { RootState } from "../lib/store";

const VideoQuerySchemas = `query VTuberLives($cursor:String,$groups:[String],$platform:[PlatformName]) {
    vtuber {
        videos(cursor:$cursor,groups:$groups,platforms:$platform,limit:30,statuses:[past,video]) {
            _total
            items {
                id
                title
                channel {
                    id
                    room_id
                    name
                }
                timeData {
                    scheduledStartTime
                    startTime
                    endTime
                }
                mentions {
                    id
                    name
                    en_name
                }
                status
                thumbnail
                viewers
                peakViewers
                platform
                is_premiere
                is_member
                group
            }
            pageInfo {
                results_per_page
                hasNextPage
                nextCursor
            }
        }
    }
}`;

async function fetchVideosWithCursor(cursor = "", extraVariables = {}) {
    const results = await ihaAPIQuery(VideoQuerySchemas, cursor, extraVariables);
    return [
        walk(results, "data.vtuber.videos.items") || [],
        walk(results, "data.vtuber.videos.pageInfo") || {},
    ];
}

interface LivesPageState {
    freeChat: boolean;
    progressBar: number;
    offsetLoc: string;
    hasMore: boolean;
    nextCursor?: Nullable<string>;
    firstRun: boolean;
}

const mapDispatch = {
    resetState: () => ({ type: "videos/resetState" }),
    pushNewVideo: (payload: VideoCardProps[]) => ({ type: "videos/bulkAddVideo", payload }),
};
const mapState = (state: RootState) => ({
    videos: state.videos.videos,
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

class VideosPastPage extends React.Component<PropsFromRedux, LivesPageState> {
    constructor(props) {
        super(props);
        this.videosLoaderData = this.videosLoaderData.bind(this);
        this.state = {
            progressBar: 0,
            freeChat: false,
            offsetLoc: "UTC+09:00",
            hasMore: true,
            nextCursor: null,
            firstRun: true,
        };
    }

    videosLoaderData() {
        const { hasMore, nextCursor, firstRun } = this.state;
        if (firstRun) {
            return;
        }
        if (!hasMore) {
            return;
        }
        const extraVars = getGroupsAndPlatformsFilters(localStorage);
        fetchVideosWithCursor(nextCursor, extraVars).then(([videos, pageInfo]) => {
            this.props.pushNewVideo(videos);
            let hasMore = true;
            if (!pageInfo.hasNextPage) {
                hasMore = false;
            }
            const nextCursor = pageInfo.nextCursor || null;
            this.setState({ hasMore, nextCursor });
        });
    }

    async componentDidMount() {
        const offsetLoc = getLocalStorageData(localStorage, "vtapi.offsetLoc", "UTC+09:00");
        this.setState({ offsetLoc });
        const extraVars = getGroupsAndPlatformsFilters(localStorage);
        const [videos, pageInfo] = await fetchVideosWithCursor(null, extraVars);
        this.props.pushNewVideo(videos);
        let hasMore = true;
        if (!pageInfo.hasNextPage) {
            hasMore = false;
        }
        const nextCursor = pageInfo.nextCursor || null;
        this.setState({ hasMore, nextCursor, firstRun: false });
    }

    render() {
        const { freeChat, offsetLoc } = this.state;
        return (
            <React.Fragment key="livespage">
                <Head>
                    <MetadataHead.Base />
                    <title>Videos :: VTuber API</title>
                    <MetadataHead.SEO
                        title="Past Videos"
                        description="See all past livestream here."
                        urlPath="/videos"
                    />
                    <MetadataHead.Prefetch />
                </Head>
                <Navbar mode="schedules" />
                <main className="antialiased h-full pb-4 mx-4 mt-6">
                    <div className="flex flex-col m-2 justify-center">
                        <div className="text-white text-center text-2xl mt-2 font-light">
                            This page use infinite scroll!
                        </div>
                    </div>
                    <InfiniteScroll
                        hasMore={this.state.hasMore}
                        dataLength={this.props.videos.length}
                        next={this.videosLoaderData}
                        loader={<VideosPagesSkeleton addViewers />}
                        endMessage={
                            <div className="my-6 text-xl font-light text-center">
                                Seems like you reach the end of the list :&gt;
                            </div>
                        }
                    >
                        <VideosPages
                            currentType="past"
                            sortedData="time"
                            enableFreeChat={freeChat}
                            timezone={offsetLoc}
                            showAll
                        />
                    </InfiniteScroll>
                </main>
            </React.Fragment>
        );
    }
}

export default connector(VideosPastPage);
