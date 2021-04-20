import _ from "lodash";
import Head from "next/head";
import React from "react";
import { Link as ScrollTo } from "react-scroll";
import { Dialog, Transition } from "@headlessui/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserFriends, faTimes } from "@fortawesome/free-solid-svg-icons";

import { GROUPS_NAME_MAP, ihaAPIQuery } from "../lib/vt";

import Buttons from "../components/buttons";
import Navbar from "../components/navbar";
import BadgeText from "../components/badge";
import VideoCard from "../components/videocard";
import GroupModal from "../components/groupmodal";

import SEOMetaTags from "../components/header/seo";
import HeaderDefault from "../components/header/head";
import HeaderPrefetch from "../components/header/prefetch";

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
}`

function GroupVideo(props) {
    const { data, group } = props;

    const sortedByTime = _.sortBy(data, (o) => o.timeData.startTime);

    return (
        <div id={"group-" + group} className="pb-3 vtubers-group mt-2">
            <h2 className="text-white py-3 text-3xl font-bold mb-2">
                {_.get(GROUPS_NAME_MAP, group, group)}
                <BadgeText className="bg-red-500 text-white ml-3 text-xl">{data.length}</BadgeText>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-2">
                {sortedByTime.map((video) => {
                    return <VideoCard key={video.id} {...video} />
                })}
            </div>
        </div>
    )
}

function groupMember(realData) {
    const groupedByGroup = _.groupBy(realData, (o) => o.group);

    let sortedGroupData = [];
    Object.keys(groupedByGroup).sort().forEach((group) => {
        sortedGroupData.push(groupedByGroup[group]);
    });

    return sortedGroupData;
}

class VideoPages extends React.Component {
    render() {
        const {data} = this.props;
        let realData = [];
        if (Array.isArray(data)) {
            realData = data;
        }

        if (realData.length < 1) {
            return <div className="text-center pb-8 text-2xl font-light text-gray-300">No ongoing lives</div>
        }

        let sortedGroupData = groupMember(realData);

        let configuredCallback = [];
        sortedGroupData.forEach((items) => {
            const grp = items[0].group;
            configuredCallback.push({id: grp, name: _.get(GROUPS_NAME_MAP, grp, grp), total: items.length});
        });

        return (
            <>
                {sortedGroupData.map((items) => {
                    const dd = {data: items, group: items[0].group};
                    return <GroupVideo key={dd.group} {...dd} />;
                })}
            </>
        )
    }
}

async function getAllSchedulesQuery(cursor = "", page = 1, cb) {
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

class SchedulesPage extends React.Component {
    constructor(props) {
        super(props);
        this.triggerModal = this.triggerModal.bind(this);
        this.modalMounted = this.modalMounted.bind(this);
        this.callbackGroupSets = this.callbackGroupSets.bind(this);
        this.scrollToTop = this.scrollToTop.bind(this);
        this.state = {
            loadedData: [],
            isLoading: true,
            current: 1,
            max: 1,
            isModalOpen: false,
            groupSets: [],
        }
    }

    componentDidMount() {
        const selfthis = this;
        function setLoadData(current, total) {
            selfthis.setState({current, max: total});
        }
        getAllSchedulesQuery("", 1, setLoadData).then((res) => {
            selfthis.setState({loadedData: res, isLoading: false});
            const sortedGroupData = groupMember(res);
            let configuredCallback = [];
            sortedGroupData.forEach((items) => {
                const grp = items[0].group;
                configuredCallback.push({id: grp, name: _.get(GROUPS_NAME_MAP, grp, grp), total: items.length});
            });
            this.callbackGroupSets(configuredCallback);
        });
    }

    callbackGroupSets(groupSets) {
        this.setState({groupSets});
    }

    modalMounted(callback) {
        this.modalCb = callback;
    }

    triggerModal() {
        if (this.modalCb) {
            this.modalCb.showModal();
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
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
                    <HeaderDefault />
                    <title>Schedules :: VTuber API</title>
                    <SEOMetaTags title="Schedules" description="See upcoming live stream of tracked VTuber here!" />
                    <HeaderPrefetch />
                </Head>
                <Navbar mode="schedules" />
                <main className="antialiased h-full pb-4 mx-4 mt-6">
                    {isLoading ? 
                        <span className="text-2xl font-light mt-4 animate-pulse text-center">Loading Page {current} out of {max}</span>
                        :
                        <VideoPages key={"vidPages"} data={loadedData} />
                    }
                    <GroupModal key="group-modal" onMounted={callbacks => this.modalMounted(callbacks)}>
                        <button onClick={this.scrollToTop} className="cursor-pointer flex flex-wrap">
                            <span className="text-center text-xs w-full px-2 py-2 bg-green-700 rounded uppercase shadow-lg hover:shadow-xl hover:bg-green-800 transition-all duration-200">
                                Scroll to Top
                            </span>
                        </button>
                        {this.state.groupSets.map((res) => {
                            return (
                                <>
                                    <ScrollTo key={"scroller-" + res.id} className="cursor-pointer flex flex-wrap" to={"group-" + res.id} smooth={true} spy={true}>
                                        <span key={"scrollerInner-" + res.id} className="text-center text-sm w-full px-2 py-2 bg-gray-800 rounded uppercase shadow-lg hover:shadow-xl hover:bg-gray-900 transition-all duration-200">
                                            {res.name} <span key={"scrollerInner2-" + res.id} className="rounded bg-red-600 px-2 ml-1">{res.total}</span>
                                        </span>
                                    </ScrollTo>
                                </>
                            )
                        })}
                    </GroupModal>
                    <div className="flex items-end justify-end fixed bottom-0 right-0 mb-6 mr-6 z-20">
                        <button onClick={this.triggerModal} className={"block w-16 h-16 text-xl rounded-full transition-all shadow hover:shadow-lg focus:outline-none text-center transform hover:scale-110 text-white bg-gray-700"}>
                            <span className="ihaicon ihaico-users" />
                        </button>
                    </div>
                </main>
            </>
        )
    }
}

export default SchedulesPage;
