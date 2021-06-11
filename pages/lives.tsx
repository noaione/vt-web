import { get } from "lodash";
import Head from "next/head";
import React from "react";

import LoadingBar from "react-top-loading-bar";
import { Link as ScrollTo } from "react-scroll";

import MetadataHead from "../components/MetadataHead";
import Navbar from "../components/Navbar";
import GroupModal, { CallbackModal } from "../components/GroupModal";
import { VideoCardProps } from "../components/VideoCard";
import VideosPages, { groupMember } from "../components/VideosPages";
import VideosPagesSkeleton from "../components/VideosPagesSkeleton";

import { capitalizeLetters } from "../lib/utils";
import { getGroupsAndPlatformsFilters, GROUPS_NAME_MAP, ihaAPIQuery } from "../lib/vt";

const VideoQuerySchemas = `query VTuberLives($cursor:String,$groups:[String],$platform:[PlatformName]) {
    vtuber {
        live(cursor:$cursor,groups:$groups,platforms:$platform,limit:100) {
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

async function getAllLivesQuery(
    cursor = "",
    page = 1,
    extraVariables = {},
    cb: (current: number, total: number) => void
) {
    const results = await ihaAPIQuery(VideoQuerySchemas, cursor, extraVariables);
    const gqlres = results.data.vtuber;
    page++;
    // eslint-disable-next-line no-underscore-dangle
    const expectedTotal = Math.ceil(gqlres.live._total / gqlres.live.pageInfo.results_per_page);
    cb(page, expectedTotal);
    const mainResults = gqlres.live.items;
    const pageData = gqlres.live.pageInfo;
    if (pageData.hasNextPage && pageData.nextCursor) {
        return mainResults.concat(await getAllLivesQuery(pageData.nextCursor, page, extraVariables, cb));
    } else {
        return mainResults;
    }
}

interface GroupCallbackData {
    id: string;
    name: string;
    total: number;
}

interface LivesPageState {
    loadedData: VideoCardProps[];
    isLoading: boolean;
    progressBar: number;
    groupSets: GroupCallbackData[];
}

class LivesPage extends React.Component<{}, LivesPageState> {
    modalCb?: CallbackModal;

    constructor(props) {
        super(props);
        this.callbackGroupSets = this.callbackGroupSets.bind(this);
        this.openModal = this.openModal.bind(this);
        this.state = {
            loadedData: [],
            isLoading: true,
            progressBar: 0,
            groupSets: [],
        };
    }

    async componentDidMount() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const selfthis = this;
        function setLoadData(current: number, total: number) {
            selfthis.setState({ progressBar: (current / total) * 100 });
        }

        const extraVars = getGroupsAndPlatformsFilters(localStorage);

        const loadedData = await getAllLivesQuery("", 1, extraVars, setLoadData);
        const sortedGroupData = groupMember(loadedData);

        this.setState({ loadedData, isLoading: false });
        const configuredCallback: GroupCallbackData[] = [];
        sortedGroupData.forEach((items) => {
            const grp = items[0].group;
            configuredCallback.push({
                id: grp,
                name: get(GROUPS_NAME_MAP, grp, capitalizeLetters(grp)),
                total: items.length,
            });
        });
        this.callbackGroupSets(configuredCallback);
    }

    callbackGroupSets(groupSets: GroupCallbackData[]) {
        this.setState({ groupSets });
    }

    openModal() {
        if (this.modalCb) {
            this.modalCb.showModal();
        }
    }

    scrollTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
        if (this.modalCb) {
            this.modalCb.hideModal();
        }
    }

    render() {
        const { loadedData, isLoading, progressBar } = this.state;
        return (
            <React.Fragment key="livespage">
                <Head>
                    <MetadataHead.Base />
                    <title>Lives :: VTuber API</title>
                    <MetadataHead.SEO
                        title="Lives"
                        description="See currently livestreams of many VTubers here!"
                        urlPath="/lives"
                    />
                    <MetadataHead.Prefetch />
                </Head>
                <Navbar mode="lives" />
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
                        <>
                            <VideosPagesSkeleton addViewers />
                        </>
                    ) : (
                        <VideosPages key="videospage" data={loadedData} />
                    )}
                    <GroupModal onMounted={(cb) => (this.modalCb = cb)}>
                        <button onClick={this.scrollTop} className="cursor-pointer flex flex-wrap">
                            <span className="text-center text-xs w-full px-2 py-2 bg-green-700 rounded uppercase shadow-lg hover:shadow-xl hover:bg-green-800 transition-all duration-200">
                                Scroll to Top
                            </span>
                        </button>
                        {this.state.groupSets.map((res) => {
                            return (
                                <>
                                    <ScrollTo
                                        key={"scroller-" + res.id}
                                        className="cursor-pointer flex flex-wrap"
                                        to={"group-" + res.id}
                                        smooth={true}
                                        spy={true}
                                    >
                                        <span
                                            key={"scrollerInner-" + res.id}
                                            className="text-center text-sm w-full px-2 py-2 bg-gray-800 rounded uppercase shadow-lg hover:shadow-xl hover:bg-gray-900 transition-all duration-200"
                                        >
                                            {res.name}{" "}
                                            <span
                                                key={"scrollerInner2-" + res.id}
                                                className="rounded bg-red-600 px-2 ml-1"
                                            >
                                                {res.total}
                                            </span>
                                        </span>
                                    </ScrollTo>
                                </>
                            );
                        })}
                    </GroupModal>
                    <div className="flex items-end justify-end fixed bottom-0 right-0 mb-6 mr-6 z-20">
                        <button
                            onClick={this.openModal}
                            className={
                                "block w-16 h-16 text-xl rounded-full transition-all shadow hover:shadow-lg focus:outline-none text-center transform hover:scale-110 text-white bg-gray-700"
                            }
                        >
                            <span className="ihaicon ihaico-users" />
                        </button>
                    </div>
                </main>
            </React.Fragment>
        );
    }
}

export default LivesPage;
