import React from "react";
import { get, groupBy, sortBy, ValueIteratee } from "lodash";
import { DateTime } from "luxon";

import BadgeText from "./Badge";
import VideoCard, { VideoCardProps } from "./VideoCard";

import { capitalizeLetters } from "../lib/utils";
import { filterFreeChat, GROUPS_NAME_MAP } from "../lib/vt";
import { useStoreSelector } from "../lib/store";
import { selectVideo } from "../lib/slices/videos";

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
    if (forceId === "202405162100") {
        console.info(data);
    }

    let sortedByTime = sortBy(data, (o) => o.timeData.startTime);
    if (!enableFreeChat) {
        sortedByTime = sortedByTime.filter((o) => filterFreeChat(o.title));
    }
    if (sortedByTime.length < 1) {
        return null;
    }
    const headerTitle = noTitleFormatting ? group : get(GROUPS_NAME_MAP, group, capitalizeLetters(group));

    return (
        <div id={"group-" + forceId || group} className="pb-3 mt-2 vtubers-group">
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

type CurrentType = "live" | "schedule" | "past";

function determineTimeTitle(
    o: VideoCardProps,
    currentType: CurrentType = "live",
    timeZonePrefer: string = "UTC+09:00",
    textFormat = "yyyy LL dd HH':'mm"
) {
    if (currentType === "past") {
        const {
            timeData: { startTime, endTime },
        } = o;
        if (typeof endTime === "number") {
            const d = DateTime.fromSeconds(endTime, { zone: "UTC" }).setZone(timeZonePrefer).startOf("hour");
            return d.toFormat(textFormat);
        } else {
            const d = DateTime.fromSeconds(startTime, { zone: "UTC" })
                .setZone(timeZonePrefer)
                .startOf("hour");
            return d.toFormat(textFormat);
        }
    } else if (currentType === "schedule") {
        const {
            timeData: { startTime, scheduledStartTime },
        } = o;
        if (typeof scheduledStartTime === "number") {
            const d = DateTime.fromSeconds(scheduledStartTime, { zone: "UTC" }).setZone(timeZonePrefer);
            return d.toFormat(textFormat);
        } else {
            const d = DateTime.fromSeconds(startTime, { zone: "UTC" })
                .setZone(timeZonePrefer)
                .startOf("hour");
            return d.toFormat(textFormat);
        }
    }
    const {
        timeData: { startTime },
    } = o;
    const d = DateTime.fromSeconds(startTime, { zone: "UTC" }).setZone(timeZonePrefer).startOf("hour");
    return d.toFormat(textFormat);
}

interface PageProps {
    sortedData?: "time" | "group";
    currentType?: CurrentType;
    enableFreeChat?: boolean;
    timezone?: string;
}

function VideosPagesData(props: PageProps) {
    const { sortedData, currentType, enableFreeChat, timezone } = props;
    const videos = useStoreSelector(selectVideo);

    if (videos.length < 1) {
        return <div className="text-center pb-8 text-2xl font-light text-gray-300">No ongoing lives</div>;
    }

    if (sortedData === "time") {
        const sortedByTimeData = groupMember(videos, (o) =>
            determineTimeTitle(o, currentType, timezone || "UTC+09:00")
        );

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
                        {...groupData}
                        enableFreeChat={enableFreeChat}
                    />
                );
            })}
        </>
    );
}

export default VideosPagesData;
