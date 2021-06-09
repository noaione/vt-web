import { get, groupBy, sortBy } from "lodash";
import React from "react";

import BadgeText from "./Badge";
import ChannelCard, { ChannelCardProps } from "./ChannelCard";
import { NoteData } from "./NoteEditor";

import { GROUPS_NAME_MAP, PlatformType } from "../lib/vt";
import { capitalizeLetters } from "../lib/utils";

export function groupMember(realData: ChannelCardProps[]): ChannelCardProps[][] {
    const groupedByGroup = groupBy(realData, (o) => o.group);

    const sortedGroupData = [];
    Object.keys(groupedByGroup)
        .sort()
        .forEach((group) => {
            sortedGroupData.push(groupedByGroup[group]);
        });

    return sortedGroupData;
}

export interface ChannelsPagesCallback {
    filter: (filterText: string, platformData: PlatformType[]) => void;
}

interface ChannelsPagesProps {
    data: ChannelCardProps[];
    adminMode?: boolean;
    onMounted?: (callbacks: ChannelsPagesCallback) => void;
    onFiltered?: (rawData: any) => void;
    callbackNoteEdit?: (data: NoteData) => void;
}

interface ChannelsPagesState {
    unrenderedIds: { id: string; platform: string }[];
}

function filterSearch(dataset: ChannelCardProps[], search: string) {
    if (search.trim() === "") {
        return dataset;
    }
    return dataset.filter((o) => o.name.toLowerCase().includes(search));
}

export default class ChannelsPages extends React.Component<ChannelsPagesProps, ChannelsPagesState> {
    constructor(props) {
        super(props);
        this.doFilterChange.bind(this);
        this.state = {
            unrenderedIds: [],
        };
    }

    async componentDidMount() {
        if (typeof this.props.onMounted === "function") {
            this.props.onMounted({
                filter: (a, b) => this.doFilterChange(a, b),
            });
        }
    }

    doFilterChange(filterText: string, platforms: PlatformType[]) {
        const filtered = filterSearch(this.props.data, filterText);
        const shouldNotHide = filtered.filter((e) => platforms.includes(e.platform));
        const shouldBeHidden = this.props.data.filter((e) => {
            const isExist = shouldNotHide.findIndex((u) => u.id === e.id && u.platform === e.platform);
            return isExist === -1;
        });
        const allIdsAndPlatform = shouldBeHidden.map((r) => ({
            id: r.id,
            platform: r.platform,
        }));
        this.setState({ unrenderedIds: allIdsAndPlatform }, () => {
            if (typeof this.props.onFiltered === "function") {
                this.props.onFiltered(shouldNotHide);
            }
        });
    }

    removeMembersData(id: string, platform: PlatformType) {
        const { unrenderedIds } = this.state;
        unrenderedIds.push({ id, platform });
        this.setState({ unrenderedIds });
    }

    render() {
        const { data, adminMode } = this.props;
        if (data.length < 1) {
            return (
                <div className="text-center pb-8 text-2xl font-light text-gray-300">
                    No registered channels
                </div>
            );
        }

        const { unrenderedIds } = this.state;
        let realData = [] as ChannelCardProps[];
        if (Array.isArray(data)) {
            realData = data;
        }

        realData = realData.filter((e) => {
            const isExist = unrenderedIds.findIndex((u) => u.id === e.id && u.platform === e.platform);
            return isExist === -1;
        });
        if (realData.length < 1) {
            return (
                <div className="text-center pb-8 text-2xl font-light text-gray-300">
                    No matching channels on provided filter/search.
                </div>
            );
        }

        const sortedGroupData = groupMember(realData);

        const configuredCallback = [];
        sortedGroupData.forEach((items) => {
            const grp = items[0].group;
            configuredCallback.push({
                id: grp,
                name: get(GROUPS_NAME_MAP, grp, capitalizeLetters(grp)),
                total: items.length,
            });
        });

        return (
            <div key="channels-pages" id="root">
                {sortedGroupData.map((items) => {
                    const groupName = items[0].group;
                    const groupedByPlatform = groupBy(items, "platform");
                    const YTCards = sortBy(
                        get(groupedByPlatform, "youtube", []),
                        "publishedAt"
                    ) as ChannelCardProps[];
                    const TTVCards = sortBy(
                        get(groupedByPlatform, "twitch", []),
                        "publishedAt"
                    ) as ChannelCardProps[];
                    const TWCards = sortBy(
                        get(groupedByPlatform, "twitcasting", []),
                        "publishedAt"
                    ) as ChannelCardProps[];
                    const MDCards = sortBy(
                        get(groupedByPlatform, "mildom", []),
                        "publishedAt"
                    ) as ChannelCardProps[];
                    return (
                        <div
                            key={`groupsets-${groupName}`}
                            id={"group-" + groupName}
                            className="pb-3 vtubers-group"
                        >
                            <h2
                                key={`groupsets-header-text-${groupName}`}
                                className="text-white py-3 text-2xl font-bold"
                            >
                                {get(GROUPS_NAME_MAP, groupName, capitalizeLetters(groupName))}
                                <BadgeText
                                    key={`groupsets-badge-text-${groupName}`}
                                    className="bg-red-500 text-white ml-2 text-lg"
                                >
                                    {items.length}
                                </BadgeText>
                            </h2>
                            {YTCards.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                                    {YTCards.map((channel) => {
                                        return (
                                            <ChannelCard
                                                key={`${channel.platform}-${channel.group}-${channel.id}`}
                                                adminMode={adminMode}
                                                callbackRemove={this.removeMembersData}
                                                callbackNoteEdit={this.props.callbackNoteEdit}
                                                {...channel}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                            {TTVCards.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                                    {TTVCards.map((channel) => {
                                        return (
                                            <ChannelCard
                                                key={`${channel.platform}-${channel.group}-${channel.id}`}
                                                adminMode={adminMode}
                                                callbackRemove={this.removeMembersData}
                                                callbackNoteEdit={this.props.callbackNoteEdit}
                                                {...channel}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                            {TWCards.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                                    {TWCards.map((channel) => {
                                        return (
                                            <ChannelCard
                                                key={`${channel.platform}-${channel.group}-${channel.id}`}
                                                adminMode={adminMode}
                                                callbackRemove={this.removeMembersData}
                                                callbackNoteEdit={this.props.callbackNoteEdit}
                                                {...channel}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                            {MDCards.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                                    {MDCards.map((channel) => {
                                        return (
                                            <ChannelCard
                                                key={`${channel.platform}-${channel.group}-${channel.id}`}
                                                adminMode={adminMode}
                                                callbackRemove={this.removeMembersData}
                                                callbackNoteEdit={this.props.callbackNoteEdit}
                                                {...channel}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }
}
