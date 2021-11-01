import React from "react";
import { get, groupBy, sortBy, ValueIteratee } from "lodash";

import BadgeText from "./Badge";
import VideoCard, { VideoCardProps } from "./VideoCard";

import { capitalizeLetters, determineTimeTitle } from "../lib/utils";
import type { CurrentType } from "../lib/utils";
import { filterFreeChat, GROUPS_NAME_MAP } from "../lib/vt";
import { useStoreSelector } from "../lib/store";
import { selectAllVideos, selectVideo } from "../lib/slices/videos";

interface GroupingVideoProps {
    data: VideoCardProps[];
    group: string;
    noTitleFormatting?: boolean;
    enableFreeChat?: boolean;
    forceId?: string;
}

function defaultPredicate(o: VideoCardProps) {
    return o.group;
}

export function groupMember(
    realData: VideoCardProps[],
    predicate: ValueIteratee<VideoCardProps> = defaultPredicate
): VideoCardProps[][] {
    const groupedByGroup = groupBy(realData, predicate);

    const sortedGroupData = [];
    Object.keys(groupedByGroup)
        .sort()
        .forEach((group) => {
            sortedGroupData.push(groupedByGroup[group]);
        });

    return sortedGroupData;
}

function GroupVideo(props: GroupingVideoProps) {
    const { data, forceId, group, enableFreeChat, noTitleFormatting } = props;

    let sortedByTime = sortBy(data, (o) => o.timeData.startTime);
    if (!enableFreeChat) {
        sortedByTime = sortedByTime.filter((o) => filterFreeChat(o.title));
    }
    if (sortedByTime.length < 1) {
        return null;
    }
    const groupId = forceId || group;
    const headerTitle = noTitleFormatting ? group : get(GROUPS_NAME_MAP, group, capitalizeLetters(group));

    return (
        <div id={"group-" + groupId} className="pb-3 mt-2 vtubers-group">
            <h2 className="text-white py-3 text-3xl font-bold mb-2">
                {headerTitle}
                <BadgeText className="bg-red-500 text-white ml-3 text-xl">{data.length}</BadgeText>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-2">
                {sortedByTime.map((video) => {
                    return <VideoCard key={`video-${video.id}`} {...video} />;
                })}
            </div>
        </div>
    );
}

interface PageProps {
    sortedData?: "time" | "group";
    currentType?: CurrentType;
    enableFreeChat?: boolean;
    timezone?: string;
    showAll?: boolean;
}

function VideosPagesData(props: PageProps) {
    const { sortedData, currentType, enableFreeChat, timezone } = props;
    let videos: any;
    if (props.showAll) {
        videos = useStoreSelector(selectAllVideos);
    } else {
        videos = useStoreSelector(selectVideo);
    }

    if (videos.length < 1) {
        return <div className="text-center pb-8 text-2xl font-light text-gray-300">No ongoing lives</div>;
    }

    if (sortedData === "time") {
        const sortedByTimeData = groupMember(videos, (o) =>
            determineTimeTitle(o, currentType, timezone || "UTC+09:00")
        ).reverse();

        return (
            <>
                {sortedByTimeData.map((items) => {
                    const groupNaming = determineTimeTitle(
                        items[0],
                        currentType,
                        timezone || "UTC+09:00",
                        "ccc, dd LLL yyyy HH':'mm"
                    );
                    const timefmt = determineTimeTitle(
                        items[0],
                        currentType,
                        timezone || "UTC+09:00",
                        "yyyyLLddHHmm"
                    );
                    return (
                        <GroupVideo
                            key={`vgroup-time-${timefmt}`}
                            data={items}
                            group={groupNaming}
                            forceId={timefmt}
                            enableFreeChat={enableFreeChat}
                            noTitleFormatting
                        />
                    );
                })}
            </>
        );
    }

    const sortedGroupData = groupMember(videos);
    return (
        <>
            {sortedGroupData.map((items) => {
                const groupData = { data: items, group: items[0].group };
                return (
                    <GroupVideo
                        key={`vgroup-${groupData.group}`}
                        data={items}
                        group={items[0].group}
                        enableFreeChat={enableFreeChat}
                    />
                );
            })}
        </>
    );
}

export default VideosPagesData;
