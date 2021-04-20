import _ from "lodash";
import Head from "next/head";
import React from "react";
import { Link as ScrollTo } from "react-scroll";
import { Dialog, Switch, Transition } from "@headlessui/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserFriends, faTimes } from "@fortawesome/free-solid-svg-icons";

import { GROUPS_NAME_MAP, ihaAPIQuery } from "../lib/vt";

import Buttons from "../components/buttons";
import ChannelCard from "../components/channelcard";
import GroupModal from "../components/groupmodal";
import Navbar from "../components/navbar";
import BadgeText from "../components/badge";

import SEOMetaTags from "../components/header/seo";
import HeaderDefault from "../components/header/head";
import HeaderPrefetch from "../components/header/prefetch";

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
    const { data, group, platformFilter } = props;

    const filteredData = _.filter(data, (o) => platformFilter.includes(o.platform));
    if (filteredData.length < 1) {
        return null;
    }

    const groupedByPlatform = _.groupBy(filteredData, "platform");
    const ytCards = _.sortBy(_.get(groupedByPlatform, "youtube", []), "publishedAt");
    const ttvCards = _.sortBy(_.get(groupedByPlatform, "twitch", []), "publishedAt");
    const twCards = _.sortBy(_.get(groupedByPlatform, "twitcasting", []), "publishedAt");
    const mdCards = _.sortBy(_.get(groupedByPlatform, "mildom", []), "publishedAt");

    return (
        <div id={"group-" + group} className="pb-3 vtubers-group">
            <h2 className="text-white py-3 text-2xl font-bold">
                {_.get(GROUPS_NAME_MAP, group, group)}
                <BadgeText className="bg-red-500 text-white ml-2 text-lg">{filteredData.length}</BadgeText>
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
        const { data, platformTick } = this.props;
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

        const includedPlatform = [];
        for (const [pl, tick] of Object.entries(platformTick)) {
            if (tick) {
                includedPlatform.push(pl);
            }
        }

        return (
            <>
                {sortedGroupData.map((items) => {
                    const dd = {data: items, group: items[0].group};
                    return <GroupChannel key={dd.group} platformFilter={includedPlatform} {...dd} />;
                })}
            </>
        )
    }
}

function filterSearch(dataset, search) {
    if (search === "" || search === " ") {
        return dataset;
    }
    return _.filter(dataset, (o) => o.name.toLowerCase().includes(search));
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
        this.onChangeData = this.onChangeData.bind(this);
        this.onPlatformTick = this.onPlatformTick.bind(this);
        this.scrollToTop = this.scrollToTop.bind(this);
        this.filterGroupModalData = this.filterGroupModalData.bind(this);
        this.state = {
            loadedData: [],
            copyOfData: [],
            isLoading: true,
            current: 1,
            max: 1,
            isModalOpen: false,
            groupSets: [],

            filter: "",
            platformFilter: {
                youtube: true,
                bilibili: true,
                twitch: true,
                twitcasting: true,
                mildom: true,
            }
        }
    }

    componentDidMount() {
        const selfthis = this;
        function setLoadData(current, total) {
            selfthis.setState({current, max: total});
        }
        getAllChannelsAsync("", 1, setLoadData).then((res) => {
            selfthis.setState({loadedData: res, copyOfData: res, isLoading: false});
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

    filterGroupModalData(rawData = null) {
        let { platformFilter } = this.state;
        const includedPlatform = [];
        for (const [pl, tick] of Object.entries(platformFilter)) {
            if (tick) {
                includedPlatform.push(pl);
            }
        }

        const loadedData = rawData || this.state.loadedData;

        const filteredData = _.filter(loadedData, (o) => includedPlatform.includes(o.platform));
        const sortedGroupData = groupMember(filteredData);
        let configuredCallback = [];
        sortedGroupData.forEach((items) => {
            const grp = items[0].group;
            configuredCallback.push({id: grp, name: _.get(GROUPS_NAME_MAP, grp, grp), total: items.length});
        });
        console.info(configuredCallback);
        this.callbackGroupSets(configuredCallback);
    }

    onChangeData(event) {
        const filtered = filterSearch(this.state.copyOfData, event.target.value);
        this.setState({loadedData: filtered, filter: event.target.value});
        this.filterGroupModalData(filtered);
    }

    onPlatformTick(platform) {
        let { platformFilter } = this.state;
        platformFilter[platform] = !platformFilter[platform];
        this.setState({platformFilter});
        this.filterGroupModalData();
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
                    <title>Home :: VTuber API</title>
                    <SEOMetaTags title="Home" />
                    <HeaderPrefetch />
                </Head>
                <Navbar />
                <main className="antialiased h-full pb-4 mx-4 mt-6">
                    {isLoading ? 
                        <span className="text-2xl font-light mt-4 animate-pulse">Loading Page {current} out of {max}</span>
                        :
                        (
                            <>
                                <div className="my-4">
                                    <label className="block">
                                        <span className="text-gray-300 font-semibold">Search</span>
                                        <input type="text" value={this.state.filter} onChange={this.onChangeData} className="form-input mt-1 block w-full md:w-1/2 lg:w-1/3 bg-gray-700" />
                                    </label>
                                    <div className="mt-3">
                                        <span className="text-gray-300 font-semibold">Filter Platform</span>
                                    </div>
                                    <div className="mt-1 flex flex-col sm:flex-row gap-4">
                                        <div className="flex flex-row gap-2">
                                            <i className="ihaicon ihaico-youtube text-youtube text-2xl -mt-1"></i>
                                            <Switch
                                                checked={this.state.platformFilter.youtube}
                                                onChange={() => this.onPlatformTick("youtube")}
                                                className={`${this.state.platformFilter.youtube ? "bg-red-500" : "bg-gray-600"} relative inline-flex items-center h-6 rounded-full w-11`}
                                            >
                                                <span className="sr-only">Enable YouTube</span>
                                                <span className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${this.state.platformFilter.youtube ? "translate-x-6" : "translate-x-1"}`} />
                                            </Switch>
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            <i className="ihaicon ihaico-bilibili text-bili2 text-2xl -mt-1"></i>
                                            <Switch
                                                checked={this.state.platformFilter.bilibili}
                                                onChange={() => this.onPlatformTick("bilibili")}
                                                className={`${this.state.platformFilter.bilibili ? "bg-pl-bili2" : "bg-gray-600"} relative inline-flex items-center h-6 rounded-full w-11`}
                                            >
                                                <span className="sr-only">Enable BiliBili</span>
                                                <span className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${this.state.platformFilter.bilibili ? "translate-x-6" : "translate-x-1"}`} />
                                            </Switch>
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            <i className="ihaicon ihaico-twitch text-twitch text-2xl -mt-1"></i>
                                            <Switch
                                                checked={this.state.platformFilter.twitch}
                                                onChange={() => this.onPlatformTick("twitch")}
                                                className={`${this.state.platformFilter.twitch ? "bg-pl-twitch" : "bg-gray-600"} relative inline-flex items-center h-6 rounded-full w-11`}
                                            >
                                                <span className="sr-only">Enable Twitch</span>
                                                <span className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${this.state.platformFilter.twitch ? "translate-x-6" : "translate-x-1"}`} />
                                            </Switch>
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            <i className="ihaicon ihaico-twitcasting text-twcast text-2xl -mt-1"></i>
                                            <Switch
                                                checked={this.state.platformFilter.twitcasting}
                                                onChange={() => this.onPlatformTick("twitcasting")}
                                                className={`${this.state.platformFilter.twitcasting ? "bg-pl-twcast" : "bg-gray-600"} relative inline-flex items-center h-6 rounded-full w-11`}
                                            >
                                                <span className="sr-only">Enable Twitcasting</span>
                                                <span className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${this.state.platformFilter.twitcasting ? "translate-x-6" : "translate-x-1"}`} />
                                            </Switch>
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            <i className="ihaicon ihaico-mildom_simple text-mildom text-2xl -mt-1"></i>
                                            <Switch
                                                checked={this.state.platformFilter.mildom}
                                                onChange={() => this.onPlatformTick("mildom")}
                                                className={`${this.state.platformFilter.mildom ? "bg-pl-mildom" : "bg-gray-600"} relative inline-flex items-center h-6 rounded-full w-11`}
                                            >
                                                <span className="sr-only">Enable Mildom</span>
                                                <span className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${this.state.platformFilter.mildom ? "translate-x-6" : "translate-x-1"}`} />
                                            </Switch>
                                        </div>
                                    </div>
                                </div>
                                <ChannelPages data={loadedData} platformTick={this.state.platformFilter} />
                            </>
                        )
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
