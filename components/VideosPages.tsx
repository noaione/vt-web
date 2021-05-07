import React from "react";
import { get, groupBy, sortBy } from "lodash";

import VideoCard, { VideoCardProps } from "./VideoCard";
import { GROUPS_NAME_MAP } from "../lib/vt";
import { capitalizeLetters } from "../lib/utils";
import BadgeText from "./Badge";

interface GroupingVideoProps {
    data: VideoCardProps[];
    group: string;
}

export function groupMember(realData: VideoCardProps[]): VideoCardProps[][] {
    const groupedByGroup = groupBy(realData, (o) => o.group);

    const sortedGroupData = [];
    Object.keys(groupedByGroup)
        .sort()
        .forEach((group) => {
            sortedGroupData.push(groupedByGroup[group]);
        });

    return sortedGroupData;
}

function GroupVideo(props: GroupingVideoProps) {
    const { data, group } = props;

    const sortedByTime = sortBy(data, (o) => o.timeData.startTime);

    return (
        <div id={"group-" + group} className="pb-3 mt-2 vtubers-group">
            <h2 className="text-white py-3 text-3xl font-bold mb-2">
                {get(GROUPS_NAME_MAP, group, capitalizeLetters(group))}
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

interface VideosPagesProps {
    data?: VideoCardProps[];
}

class VideosPages extends React.Component<VideosPagesProps> {
    render() {
        const { data } = this.props;
        let realData = [];
        if (Array.isArray(data)) {
            realData = data;
        }

        if (realData.length < 1) {
            return <div className="text-center pb-8 text-2xl font-light text-gray-300">No ongoing lives</div>;
        }

        const sortedGroupData = groupMember(realData);

        return (
            <>
                {sortedGroupData.map((items) => {
                    const groupData = { data: items, group: items[0].group };
                    return <GroupVideo key={`vidpage-${groupData.group}`} {...groupData} />;
                })}
            </>
        );
    }
}

export default VideosPages;
