import { filter, get } from "lodash";
import React from "react";
import Head from "next/head";

import { Link as ScrollTo } from "react-scroll";
import { Switch } from "@headlessui/react";

import ChannelsPages, { groupMember } from "../components/ChannelsPages";
import { ChannelCardProps } from "../components/ChannelCard";
import GroupModal, { CallbackModal } from "../components/GroupModal";
import MetadataHead from "../components/MetadataHead";
import Navbar from "../components/Navbar";

import { capitalizeLetters } from "../lib/utils";
import { GROUPS_NAME_MAP, ihaAPIQuery, PlatformType } from "../lib/vt";

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
                is_retired
            }
            pageInfo {
                results_per_page
                hasNextPage
                nextCursor
            }
        }
    }
}`;

async function getAllChannelsAsync(cursor = "", page = 1, cb: (current: number, total: number) => void) {
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

function filterSearch(dataset: ChannelCardProps[], search: string) {
    if (search === "" || search === " ") {
        return dataset;
    }
    return filter(dataset, (o) => o.name.toLowerCase().includes(search));
}

interface GroupCallbackData {
    id: string;
    name: string;
    total: number;
}

interface HomepageChannelState {
    loadedData: ChannelCardProps[];
    copyOfData: ChannelCardProps[];
    isLoading: boolean;
    current: number;
    max: number;
    groupSets: GroupCallbackData[];
    filter: string;
    platformFilter: Record<PlatformType, boolean>;
}

export default class HomepageChannelsPage extends React.Component<{}, HomepageChannelState> {
    modalCb?: CallbackModal;

    constructor(props) {
        super(props);
        this.state = {
            loadedData: [],
            copyOfData: [],
            isLoading: true,
            current: 1,
            max: 1,
            groupSets: [],

            filter: "",
            platformFilter: {
                youtube: true,
                bilibili: true,
                twitch: true,
                twitcasting: true,
                mildom: true,
            },
        };
    }

    async componentDidMount() {
        const selfthis = this;
        function setLoadData(current: number, total: number) {
            selfthis.setState({ current, max: total });
        }

        const loadedData = await getAllChannelsAsync("", 1, setLoadData);
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
        this.callbackGroupSets(configuredCallback);
    }

    callbackGroupSets(groupSets) {
        this.setState({ groupSets });
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

        const filteredData = filter(loadedData, (o) => includedPlatform.includes(o.platform));
        const sortedGroupData = groupMember(filteredData);
        let configuredCallback = [];
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

    onPlatformTick(platform: PlatformType) {
        let { platformFilter } = this.state;
        platformFilter[platform] = !platformFilter[platform];
        this.setState({ platformFilter });
        this.filterGroupModalData();
    }

    onChangeData(event: React.ChangeEvent<HTMLInputElement>) {
        const filtered = filterSearch(this.state.copyOfData, event.target.value);
        this.setState({ loadedData: filtered, filter: event.target.value });
        this.filterGroupModalData(filtered);
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
        const outerThis = this;

        return (
            <>
                <Head>
                    <MetadataHead.Base />
                    <title>Home :: VTuber API</title>
                    <MetadataHead.SEO title="Home" />
                    <MetadataHead.Prefetch />
                </Head>
                <Navbar />
                <main className="antialiased h-full pb-4 mx-4 mt-6">
                    {isLoading ? (
                        <span className="text-2xl font-light mt-4 animate-pulse">
                            Loading Page {current} out of {max}
                        </span>
                    ) : (
                        <>
                            <div className="my-4">
                                <label className="block">
                                    <span className="text-gray-300 font-semibold">Search</span>
                                    <input
                                        type="text"
                                        value={this.state.filter}
                                        onChange={this.onChangeData}
                                        className="form-input mt-1 block w-full md:w-1/2 lg:w-1/3 bg-gray-700"
                                    />
                                </label>
                                <div className="mt-3">
                                    <span className="text-gray-300 font-semibold">Filter Platform</span>
                                </div>
                                <div className="mt-1 flex flex-col sm:flex-row gap-4">
                                    <div className="flex flex-row gap-2">
                                        <i className="ihaicon ihaico-youtube text-youtube text-2xl -mt-1"></i>
                                        <Switch
                                            checked={this.state.platformFilter.youtube}
                                            onChange={() => outerThis.onPlatformTick("youtube")}
                                            className={`${
                                                this.state.platformFilter.youtube
                                                    ? "bg-red-500"
                                                    : "bg-gray-600"
                                            } relative inline-flex items-center h-6 rounded-full w-11`}
                                        >
                                            <span className="sr-only">Enable YouTube</span>
                                            <span
                                                className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${
                                                    this.state.platformFilter.youtube
                                                        ? "translate-x-6"
                                                        : "translate-x-1"
                                                }`}
                                            />
                                        </Switch>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <i className="ihaicon ihaico-bilibili text-bili2 text-2xl -mt-1"></i>
                                        <Switch
                                            checked={this.state.platformFilter.bilibili}
                                            onChange={() => outerThis.onPlatformTick("bilibili")}
                                            className={`${
                                                this.state.platformFilter.bilibili
                                                    ? "bg-pl-bili2"
                                                    : "bg-gray-600"
                                            } relative inline-flex items-center h-6 rounded-full w-11`}
                                        >
                                            <span className="sr-only">Enable BiliBili</span>
                                            <span
                                                className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${
                                                    this.state.platformFilter.bilibili
                                                        ? "translate-x-6"
                                                        : "translate-x-1"
                                                }`}
                                            />
                                        </Switch>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <i className="ihaicon ihaico-twitch text-twitch text-2xl -mt-1"></i>
                                        <Switch
                                            checked={this.state.platformFilter.twitch}
                                            onChange={() => outerThis.onPlatformTick("twitch")}
                                            className={`${
                                                this.state.platformFilter.twitch
                                                    ? "bg-pl-twitch"
                                                    : "bg-gray-600"
                                            } relative inline-flex items-center h-6 rounded-full w-11`}
                                        >
                                            <span className="sr-only">Enable Twitch</span>
                                            <span
                                                className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${
                                                    this.state.platformFilter.twitch
                                                        ? "translate-x-6"
                                                        : "translate-x-1"
                                                }`}
                                            />
                                        </Switch>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <i className="ihaicon ihaico-twitcasting text-twcast text-2xl -mt-1"></i>
                                        <Switch
                                            checked={this.state.platformFilter.twitcasting}
                                            onChange={() => outerThis.onPlatformTick("twitcasting")}
                                            className={`${
                                                this.state.platformFilter.twitcasting
                                                    ? "bg-pl-twcast"
                                                    : "bg-gray-600"
                                            } relative inline-flex items-center h-6 rounded-full w-11`}
                                        >
                                            <span className="sr-only">Enable Twitcasting</span>
                                            <span
                                                className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${
                                                    this.state.platformFilter.twitcasting
                                                        ? "translate-x-6"
                                                        : "translate-x-1"
                                                }`}
                                            />
                                        </Switch>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <i className="ihaicon ihaico-mildom_simple text-mildom text-2xl -mt-1"></i>
                                        <Switch
                                            checked={this.state.platformFilter.mildom}
                                            onChange={() => outerThis.onPlatformTick("mildom")}
                                            className={`${
                                                this.state.platformFilter.mildom
                                                    ? "bg-pl-mildom"
                                                    : "bg-gray-600"
                                            } relative inline-flex items-center h-6 rounded-full w-11`}
                                        >
                                            <span className="sr-only">Enable Mildom</span>
                                            <span
                                                className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${
                                                    this.state.platformFilter.mildom
                                                        ? "translate-x-6"
                                                        : "translate-x-1"
                                                }`}
                                            />
                                        </Switch>
                                    </div>
                                </div>
                            </div>
                            <ChannelsPages data={loadedData} platformTick={this.state.platformFilter} />
                        </>
                    )}
                    <GroupModal onMounted={(callbacks) => (this.modalCb = callbacks)}>
                        <button onClick={this.scrollTop} className="cursor-pointer flex flex-wrap">
                            <span className="text-center text-xs w-full px-2 py-2 bg-green-700 rounded uppercase shadow-lg hover:shadow-xl hover:bg-green-800 transition-all duration-200">
                                Scroll to Top
                            </span>
                        </button>
                        {this.state.groupSets.map((res) => {
                            return (
                                <>
                                    <ScrollTo
                                        className="cursor-pointer flex flex-wrap"
                                        to={"group-" + res.id}
                                        smooth={true}
                                        spy={true}
                                    >
                                        <span className="text-center text-sm w-full px-2 py-2 bg-gray-800 rounded uppercase shadow-lg hover:shadow-xl hover:bg-gray-900 transition-all duration-200">
                                            {res.name}{" "}
                                            <span className="rounded bg-red-600 px-2 ml-1">{res.total}</span>
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
