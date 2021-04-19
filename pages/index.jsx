import _ from "lodash";
import Head from "next/head";
import React from "react";
import { Link as ScrollTo } from "react-scroll";
import { Dialog, Transition } from "@headlessui/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserFriends, faTimes } from "@fortawesome/free-solid-svg-icons";

import { GROUPS_NAME_MAP, ihaAPIQuery } from "../lib/vt";

import Buttons from "../components/buttons";
import ChannelCard from "../components/channelcard";
import GroupModal from "../components/groupmodal";
import Navbar from "../components/navbar";
import BadgeText from "../components/badge";

const ChannelQuerySchemas = `query VTuberChannel($cursor:String) {
    vtuber {
        channels(platforms:[youtube,twitch,twitcasting,mildom],cursor:$cursor,limit:75) {
            _total
            items {
                id
                name
                image
                platform
                group
                publishedAt
                statistics {
                    subscriberCount
                    viewCount
                }
            }
            pageInfo {
                results_per_page
                hasNextPage
                nextCursor
            }
        }
    }
}`

function GroupChannel(props) {
    const { data, group } = props;

    const groupedByPlatform = _.groupBy(data, "platform");
    const ytCards = _.sortBy(_.get(groupedByPlatform, "youtube", []), "publishedAt");
    const ttvCards = _.sortBy(_.get(groupedByPlatform, "twitch", []), "publishedAt");
    const twCards = _.sortBy(_.get(groupedByPlatform, "twitcasting", []), "publishedAt");
    const mdCards = _.sortBy(_.get(groupedByPlatform, "mildom", []), "publishedAt");

    return (
        <div id={"group-" + group} className="pb-3 vtubers-group">
            <h2 className="text-white py-3 text-2xl font-bold">
                {_.get(GROUPS_NAME_MAP, group, group)}
                <BadgeText className="bg-red-500 text-white ml-2 text-lg">{data.length}</BadgeText>
            </h2>
            {ytCards.length > 0 ?
                (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                            {ytCards.map((channel) => {
                                return <ChannelCard key={channel.id} {...channel} />;
                            })}
                        </div>
                    </>
                )
             : ""}
             {ttvCards.length > 0 ? 
                (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                            {ttvCards.map((channel) => {
                                return <ChannelCard key={channel.id} {...channel} />;
                            })}
                        </div>
                    </>
                )
             : ""}
             {twCards.length > 0 ? 
                (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                            {twCards.map((channel) => {
                                return <ChannelCard key={channel.id} {...channel} />;
                            })}
                        </div>
                    </>
                )
             : ""}
             {mdCards.length > 0 ? 
                (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                            {mdCards.map((channel) => {
                                return <ChannelCard key={channel.id} {...channel} />;
                            })}
                        </div>
                    </>
                )
             : ""}
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

class ChannelPages extends React.Component {
    render() {
        const {data} = this.props;
        let realData = [];
        if (Array.isArray(data)) {
            realData = data;
        }

        if (realData.length < 1) {
            return <div className="text-center pb-8 text-2xl font-light text-gray-300">No registered channels</div>
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
                    return <GroupChannel key={dd.group} {...dd} />;
                })}
            </>
        )
    }
}

async function getAllChannelsAsync(cursor = "", page = 1, cb) {
    let results = await ihaAPIQuery(ChannelQuerySchemas, cursor);
    let gqlres = results.data.vtuber;
    page++;
    let expectedTotal = Math.ceil(gqlres.channels._total / gqlres.channels.pageInfo.results_per_page);
    cb(page, expectedTotal);
    let mainResults = gqlres.channels.items;
    let pageData = gqlres.channels.pageInfo;
    if (pageData.hasNextPage && pageData.nextCursor) {
        return mainResults.concat(await getAllChannelsAsync(pageData.nextCursor, page, cb));
    } else {
        return mainResults;
    }
}

class Homepage extends React.Component {
    constructor(props) {
        super(props);
        this.callbackGroupSets = this.callbackGroupSets.bind(this);
        this.triggerModal = this.triggerModal.bind(this);
        this.modalMounted = this.modalMounted.bind(this);
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
        getAllChannelsAsync("", 1, setLoadData).then((res) => {
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
                    <title>Home :: VTuber API</title>
                    <link rel="preconnect" href="https://api.ihateani.me" />
                    <link rel="preconnect" href="https://i.ytimg.com" />
                </Head>
                <Navbar />
                <main className="antialiased h-full pb-4 mx-4 mt-6">
                    {isLoading ? 
                        <span className="text-2xl font-light mt-4 animate-pulse">Loading Page {current} out of {max}</span>
                        :
                        <ChannelPages data={loadedData} />
                    }
                    <GroupModal onMounted={callbacks => this.modalMounted(callbacks)}>
                        <button onClick={this.scrollToTop} className="cursor-pointer flex flex-wrap">
                            <span className="text-center text-xs w-full px-2 py-2 bg-green-700 rounded uppercase shadow-lg hover:shadow-xl hover:bg-green-800 transition-all duration-200">
                                Scroll to Top
                            </span>
                        </button>
                        {this.state.groupSets.map((res) => {
                            return (
                                <>
                                    <ScrollTo className="cursor-pointer flex flex-wrap" to={"group-" + res.id} smooth={true} spy={true}>
                                        <span className="text-center text-sm w-full px-2 py-2 bg-gray-800 rounded uppercase shadow-lg hover:shadow-xl hover:bg-gray-900 transition-all duration-200">
                                            {res.name} <span className="rounded bg-red-600 px-2 ml-1">{res.total}</span>
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

export default Homepage;
