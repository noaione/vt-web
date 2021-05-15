import { filter, get, groupBy, sortBy } from "lodash";
import React, { useState } from "react";

import BadgeText from "./Badge";
import ChannelCard, { ChannelCardProps } from "./ChannelCard";

import { GROUPS_NAME_MAP, PlatformType } from "../lib/vt";
import { capitalizeLetters } from "../lib/utils";

interface GroupChannelProps {
    data: ChannelCardProps[];
    group: string;
    platformFilter: PlatformType[];
    adminMode?: boolean;
}

function GroupChannel(props: GroupChannelProps) {
    const { data, group, platformFilter, adminMode } = props;

    const filteredData = filter(data, (o) => platformFilter.includes(o.platform));
    if (filteredData.length < 1) {
        return null;
    }

    const groupedByPlatform = groupBy(filteredData, "platform");
    const [YTCards, setYTCards] = useState<ChannelCardProps[]>(
        sortBy(get(groupedByPlatform, "youtube", []), "publishedAt")
    );
    const [TTVCards, setTTVCards] = useState<ChannelCardProps[]>(
        sortBy(get(groupedByPlatform, "twitch", []), "publishedAt")
    );
    const [TWCards, setTWCards] = useState<ChannelCardProps[]>(
        sortBy(get(groupedByPlatform, "twitcasting", []), "publishedAt")
    );
    const [MDCards, setMDCards] = useState<ChannelCardProps[]>(
        sortBy(get(groupedByPlatform, "mildom", []), "publishedAt")
    );

    function callbackRemoval(id: string, platform: PlatformType) {
        if (platform === "youtube") {
            const filteredCards = YTCards.filter((o) => o.id !== id);
            setYTCards(filteredCards);
        } else if (platform === "twitch") {
            const filteredCards = TTVCards.filter((o) => o.id !== id);
            setTTVCards(filteredCards);
        } else if (platform === "twitcasting") {
            const filteredCards = TWCards.filter((o) => o.id !== id);
            setTWCards(filteredCards);
        } else if (platform === "mildom") {
            const filteredCards = MDCards.filter((o) => o.id !== id);
            setMDCards(filteredCards);
        }
    }

    return (
        <div id={"group-" + group} className="pb-3 vtubers-group">
            <h2 className="text-white py-3 text-2xl font-bold">
                {get(GROUPS_NAME_MAP, group, capitalizeLetters(group))}
                <BadgeText className="bg-red-500 text-white ml-2 text-lg">{filteredData.length}</BadgeText>
            </h2>
            {YTCards.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                        {YTCards.map((channel) => {
                            return (
                                <ChannelCard
                                    key={channel.id}
                                    adminMode={adminMode}
                                    callbackRemove={callbackRemoval}
                                    {...channel}
                                />
                            );
                        })}
                    </div>
                </>
            )}
            {TTVCards.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                        {TTVCards.map((channel) => {
                            return (
                                <ChannelCard
                                    key={channel.id}
                                    adminMode={adminMode}
                                    callbackRemove={callbackRemoval}
                                    {...channel}
                                />
                            );
                        })}
                    </div>
                </>
            )}
            {TWCards.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                        {TWCards.map((channel) => {
                            return (
                                <ChannelCard
                                    key={channel.id}
                                    adminMode={adminMode}
                                    callbackRemove={callbackRemoval}
                                    {...channel}
                                />
                            );
                        })}
                    </div>
                </>
            )}
            {MDCards.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                        {MDCards.map((channel) => {
                            return (
                                <ChannelCard
                                    key={channel.id}
                                    adminMode={adminMode}
                                    callbackRemove={callbackRemoval}
                                    {...channel}
                                />
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

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

interface ChannelsPagesProps {
    data: ChannelCardProps[];
    platformTick: Record<PlatformType, boolean>;
    adminMode?: boolean;
}

export default class ChannelsPages extends React.Component<ChannelsPagesProps> {
    render() {
        const { data, platformTick, adminMode } = this.props;
        let realData = [];
        if (Array.isArray(data)) {
            realData = data;
        }

        if (realData.length < 1) {
            return (
                <div className="text-center pb-8 text-2xl font-light text-gray-300">
                    No registered channels
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

        const includedPlatform = [];
        for (const [pl, tick] of Object.entries(platformTick)) {
            if (tick) {
                includedPlatform.push(pl);
            }
        }

        return (
            <>
                {sortedGroupData.map((items) => {
                    const dd = { data: items, group: items[0].group };
                    return (
                        <GroupChannel
                            key={dd.group}
                            platformFilter={includedPlatform}
                            adminMode={adminMode}
                            {...dd}
                        />
                    );
                })}
            </>
        );
    }
}
