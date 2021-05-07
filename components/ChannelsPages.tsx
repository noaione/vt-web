import { filter, get, groupBy, sortBy } from "lodash";
import React from "react";

import BadgeText from "./Badge";
import ChannelCard, { ChannelCardProps } from "./ChannelCard";

import { GROUPS_NAME_MAP, PlatformType } from "../lib/vt";
import { capitalizeLetters } from "../lib/utils";

interface GroupChannelProps {
    data: ChannelCardProps[];
    group: string;
    platformFilter: PlatformType[];
}

function GroupChannel(props: GroupChannelProps) {
    const { data, group, platformFilter } = props;

    const filteredData = filter(data, (o) => platformFilter.includes(o.platform));
    if (filteredData.length < 1) {
        return null;
    }

    const groupedByPlatform = groupBy(filteredData, "platform");
    const ytCards = sortBy(get(groupedByPlatform, "youtube", []), "publishedAt");
    const ttvCards = sortBy(get(groupedByPlatform, "twitch", []), "publishedAt");
    const twCards = sortBy(get(groupedByPlatform, "twitcasting", []), "publishedAt");
    const mdCards = sortBy(get(groupedByPlatform, "mildom", []), "publishedAt");

    return (
        <div id={"group-" + group} className="pb-3 vtubers-group">
            <h2 className="text-white py-3 text-2xl font-bold">
                {get(GROUPS_NAME_MAP, group, capitalizeLetters(group))}
                <BadgeText className="bg-red-500 text-white ml-2 text-lg">{filteredData.length}</BadgeText>
            </h2>
            {ytCards.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                        {ytCards.map((channel) => {
                            return <ChannelCard key={channel.id} {...channel} />;
                        })}
                    </div>
                </>
            ) : (
                ""
            )}
            {ttvCards.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                        {ttvCards.map((channel) => {
                            return <ChannelCard key={channel.id} {...channel} />;
                        })}
                    </div>
                </>
            ) : (
                ""
            )}
            {twCards.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                        {twCards.map((channel) => {
                            return <ChannelCard key={channel.id} {...channel} />;
                        })}
                    </div>
                </>
            ) : (
                ""
            )}
            {mdCards.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 items-start mb-2">
                        {mdCards.map((channel) => {
                            return <ChannelCard key={channel.id} {...channel} />;
                        })}
                    </div>
                </>
            ) : (
                ""
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
}

export default class ChannelsPages extends React.Component<ChannelsPagesProps> {
    render() {
        const { data, platformTick } = this.props;
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
                    return <GroupChannel key={dd.group} platformFilter={includedPlatform} {...dd} />;
                })}
            </>
        );
    }
}
