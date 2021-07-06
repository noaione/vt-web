import { get, groupBy, sortBy } from "lodash";
import React from "react";

import BadgeText from "./Badge";
import ChannelCard, { ChannelCardProps } from "./ChannelCard";

import { GROUPS_NAME_MAP } from "../lib/vt";
import { capitalizeLetters } from "../lib/utils";
import { useStoreSelector } from "../lib/store";
import { selectChannels } from "../lib/slices/channels";

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

interface PropsChannel {
    isAdmin?: boolean;
}

export default function ChannelsPagesFunctional(props: PropsChannel) {
    const { isAdmin } = props;
    const channels = useStoreSelector(selectChannels);

    if (channels.length < 1) {
        return (
            <div className="text-center pb-8 text-2xl font-light text-gray-300">
                No matching channels on provided filter/search.
            </div>
        );
    }

    const sortedGroupData = groupMember(channels);

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
        <div id="grass-root">
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
                                            adminMode={isAdmin}
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
                                            adminMode={isAdmin}
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
                                            adminMode={isAdmin}
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
                                            adminMode={isAdmin}
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
