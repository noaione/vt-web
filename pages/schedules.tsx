import { get } from "lodash";
import Head from "next/head";
import React from "react";

import { Link as ScrollTo } from "react-scroll";

import MetadataHead from "../components/MetadataHead";
import Navbar from "../components/Navbar";
import GroupModal, { CallbackModal } from "../components/GroupModal";
import { VideoCardProps } from "../components/VideoCard";
import VideosPages, { groupMember } from "../components/VideosPages";

import { capitalizeLetters } from "../lib/utils";
import { GROUPS_NAME_MAP, ihaAPIQuery } from "../lib/vt";

const VideoQuerySchemas = `query VTuberLives($cursor:String) {
    vtuber {
        upcoming(cursor:$cursor,limit:75) {
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

async function getAllSchedulesQuery(cursor = "", page = 1, cb: (current: number, total: number) => void) {
    let results = await ihaAPIQuery(VideoQuerySchemas, cursor);
    let gqlres = results.data.vtuber;
    page++;
    let expectedTotal = Math.ceil(gqlres.upcoming._total / gqlres.upcoming.pageInfo.results_per_page);
    cb(page, expectedTotal);
    let mainResults = gqlres.upcoming.items;
    let pageData = gqlres.upcoming.pageInfo;
    if (pageData.hasNextPage && pageData.nextCursor) {
        return mainResults.concat(await getAllSchedulesQuery(pageData.nextCursor, page, cb));
    } else {
        return mainResults;
    }
}

interface GroupCallbackData {
    id: string;
    name: string;
    total: number;
}

interface SchedulesPageState {
    loadedData: VideoCardProps[];
    isLoading: boolean;
    current: number;
    max: number;
    groupSets: GroupCallbackData[];
}

class SchedulesPage extends React.Component<{}, SchedulesPageState> {
    modalCb?: CallbackModal;

    constructor(props) {
        super(props);
        this.callbackGroupSets = this.callbackGroupSets.bind(this);
        this.openModal = this.openModal.bind(this);
        this.state = {
            loadedData: [],
            isLoading: true,
            current: 1,
            max: 1,
            groupSets: [],
        };
    }

    async componentDidMount() {
        const selfthis = this;
        function setLoadData(current: number, total: number) {
            selfthis.setState({ current, max: total });
        }

        const loadedData = await getAllSchedulesQuery("", 1, setLoadData);
        const sortedGroupData = groupMember(loadedData);

        this.setState({ loadedData, isLoading: false });
        let configuredCallback: GroupCallbackData[] = [];
        sortedGroupData.forEach((items) => {
            const grp = items[0].group;
            configuredCallback.push({
                id: grp,
                name: get(GROUPS_NAME_MAP, grp, capitalizeLetters(grp)),
                total: items.length,
            });
        });
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
        const { loadedData, isLoading, current, max } = this.state;
        return (
            <>
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
                    {isLoading ? (
                        <span className="text-2xl font-light mt-4 animate-pulse text-center">
                            Loading Page {current} out of {max}
                        </span>
                    ) : (
                        <VideosPages data={loadedData} />
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
            </>
        );
    }
}

export default SchedulesPage;
