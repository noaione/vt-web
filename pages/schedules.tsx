import Head from "next/head";
import React from "react";

import LoadingBar from "react-top-loading-bar";
import { connect, ConnectedProps } from "react-redux";

import MetadataHead from "../components/MetadataHead";
import Navbar from "../components/Navbar";
import { VideoCardProps } from "../components/VideoCard";
import FiltersComponent from "../components/FiltersComponents";
import VideosPages from "../components/VideosPages";
import VideosPagesSkeleton from "../components/VideosPagesSkeleton";
import GroupButton from "../components/GroupButton";

import { mapBoolean } from "../lib/utils";
import { getGroupsAndPlatformsFilters, ihaAPIQuery } from "../lib/vt";
import { getLocalStorageData } from "../components/SettingsComponents/helper";

const VideoQuerySchemas = `query VTuberLives($cursor:String,$groups:[String],$platform:[PlatformName]) {
    vtuber {
        upcoming(cursor:$cursor,groups:$groups,platforms:$platform,limit:100) {
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

async function getAllSchedulesQuery(
    cursor = "",
    page = 1,
    extraVariables = {},
    cb: (current: number, total: number) => void
) {
    const results = await ihaAPIQuery(VideoQuerySchemas, cursor, extraVariables);
    const gqlres = results.data.vtuber;
    page++;
    // eslint-disable-next-line no-underscore-dangle
    const expectedTotal = Math.ceil(gqlres.upcoming._total / gqlres.upcoming.pageInfo.results_per_page);
    cb(page, expectedTotal);
    const mainResults = gqlres.upcoming.items;
    const pageData = gqlres.upcoming.pageInfo;
    if (pageData.hasNextPage && pageData.nextCursor) {
        return mainResults.concat(await getAllSchedulesQuery(pageData.nextCursor, page, extraVariables, cb));
    } else {
        return mainResults;
    }
}

interface LivesPageState {
    sortedBy: "time" | "group";
    freeChat: boolean;
    isLoading: boolean;
    progressBar: number;
    offsetLoc: string;
}

const mapDispatch = {
    resetState: () => ({ type: "videos/resetState" }),
    startNewData: (payload: VideoCardProps[]) => ({ type: "videos/bulkAddVideo", payload }),
};

const connector = connect(null, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

class SchedulesPage extends React.Component<PropsFromRedux, LivesPageState> {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            progressBar: 0,
            freeChat: false,
            sortedBy: "group",
            offsetLoc: "UTC+09:00",
        };
    }

    async componentDidMount() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const selfthis = this;
        function setLoadData(current: number, total: number) {
            selfthis.setState({ progressBar: (current / total) * 100 });
        }
        const sortedBy = getLocalStorageData(localStorage, "vtapi.sortBy", "group");
        const enableFreeChat = getLocalStorageData(localStorage, "vtapi.fcEnabled", "false");
        const offsetLoc = getLocalStorageData(localStorage, "vtapi.offsetLoc", "UTC+09:00");
        this.setState({ sortedBy, freeChat: mapBoolean(enableFreeChat), offsetLoc });

        const extraVars = getGroupsAndPlatformsFilters(localStorage);

        const loadedData = await getAllSchedulesQuery("", 1, extraVars, setLoadData);
        this.props.resetState();
        this.props.startNewData(loadedData);
        this.setState({ isLoading: false });
    }

    render() {
        const { isLoading, freeChat, sortedBy, progressBar, offsetLoc } = this.state;
        return (
            <React.Fragment key="livespage">
                <Head>
                    <MetadataHead.Base />
                    <title>Schedules :: VTuber API</title>
                    <MetadataHead.SEO
                        title="Schedules"
                        description="See upcoming stream of many VTubers here!"
                        urlPath="/schedules"
                    />
                    <MetadataHead.Prefetch />
                </Head>
                <Navbar mode="schedules" />
                <main className="antialiased h-full pb-4 mx-4 mt-6">
                    <LoadingBar
                        color="#277844"
                        progress={progressBar}
                        onLoaderFinished={() => {
                            setTimeout(() => {
                                this.setState({ progressBar: 0 });
                            }, 2500);
                        }}
                    />
                    {isLoading ? (
                        <VideosPagesSkeleton />
                    ) : (
                        <div className="flex flex-col">
                            <div className="my-4">
                                <FiltersComponent.Search.Videos />
                                <FiltersComponent.Platforms.Videos />
                            </div>
                            <VideosPages
                                currentType="schedule"
                                enableFreeChat={freeChat}
                                sortedData={sortedBy}
                                timezone={offsetLoc}
                            />
                        </div>
                    )}
                </main>
                <GroupButton.Video
                    key={`vgroup-btn-by-${sortedBy}`}
                    sortedBy={sortedBy}
                    currentType="schedule"
                    timezone={offsetLoc}
                />
            </React.Fragment>
        );
    }
}

export default connector(SchedulesPage);
