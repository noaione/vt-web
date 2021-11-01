import React from "react";

import { connect } from "react-redux";
import { get, groupBy, ValueIteratee } from "lodash";
import { Link as ScrollTo } from "react-scroll";

import GroupModal from "./GroupModal";
import { CallbackModal } from "./Modal";

import { capitalizeLetters, CurrentType, determineTimeTitle } from "../lib/utils";
import { GROUPS_NAME_MAP } from "../lib/vt";
import { ChannelCardProps } from "./ChannelCard";
import { VideoCardProps } from "./VideoCard";

interface InferFrom extends PropsFromRedux {
    sortedBy?: "time" | "group";
    currentType?: CurrentType;
    timezone?: string;
}

interface GroupCallbackData {
    id: string;
    name: string;
    total: number;
}

// @ts-ignore
function groupMember<T>(realData: T[], predicate: ValueIteratee<T> = (o: T) => o.group): T[][] {
    const groupedByGroup = groupBy(realData, predicate);

    const sortedGroupData = [];
    Object.keys(groupedByGroup)
        .sort()
        .forEach((group) => {
            sortedGroupData.push(groupedByGroup[group]);
        });

    return sortedGroupData;
}

interface ChannelRootState {
    channels: {
        filtered: ChannelCardProps[];
    };
}

interface VideoRootState {
    videos: {
        filtered: VideoCardProps[];
    };
}

const mapChannelState = (state: ChannelRootState) => ({
    filtered: state.channels.filtered,
});
const mapVideoState = (state: VideoRootState) => ({
    filtered: state.videos.filtered,
});

const channelsConnector = connect(mapChannelState, null);
const videoConnector = connect(mapVideoState, null);

interface PropsFromRedux {
    filtered: (ChannelCardProps | VideoCardProps)[];
}

class GroupButtonComponent extends React.Component<InferFrom & PropsFromRedux> {
    modalCb?: CallbackModal;

    constructor(props: InferFrom & PropsFromRedux) {
        super(props);
        this.openModal = this.openModal.bind(this);
        this.scrollTop = this.scrollTop.bind(this);
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
        const sortedBy = this.props.sortedBy || "group";
        const currentType = this.props.currentType || "live";
        const { timezone } = this.props;
        const configuredCallback: GroupCallbackData[] = [];
        if (sortedBy === "time") {
            const sortedByTimeData = groupMember(this.props.filtered, (o) =>
                // @ts-ignore
                determineTimeTitle(o, currentType, timezone || "UTC+09:00")
            ).reverse();
            sortedByTimeData.forEach((items) => {
                const timeFmt = determineTimeTitle(
                    // @ts-ignore
                    items[0],
                    currentType,
                    timezone || "UTC+09:00",
                    "yyyyLLddHHmm"
                );
                const groupNaming = determineTimeTitle(
                    // @ts-ignore
                    items[0],
                    currentType,
                    timezone || "UTC+09:00",
                    "ccc, dd LLL yyyy HH':'mm"
                );
                configuredCallback.push({
                    id: timeFmt,
                    name: groupNaming,
                    total: items.length,
                });
            });
        } else {
            const sortedByGroup = groupMember(this.props.filtered);
            sortedByGroup.forEach((items) => {
                const grp = items[0].group;
                configuredCallback.push({
                    id: grp,
                    name: get(GROUPS_NAME_MAP, grp, capitalizeLetters(grp)),
                    total: items.length,
                });
            });
        }
        return (
            <>
                <GroupModal onMounted={(cb) => (this.modalCb = cb)}>
                    <button onClick={this.scrollTop} className="cursor-pointer flex flex-wrap">
                        <span className="text-center text-xs w-full px-2 py-2 bg-green-700 rounded uppercase shadow-lg hover:shadow-xl hover:bg-green-800 transition-all duration-200">
                            Scroll to Top
                        </span>
                    </button>
                    {configuredCallback.map((res) => {
                        return (
                            <>
                                <ScrollTo
                                    key={"scroller-" + res.id}
                                    className="cursor-pointer flex flex-wrap"
                                    to={"group-" + res.id}
                                    smooth={true}
                                    spy={true}
                                >
                                    <span
                                        key={"scrollerInner-" + res.id}
                                        className="text-center text-sm w-full px-2 py-2 bg-gray-800 rounded uppercase shadow-lg hover:shadow-xl hover:bg-gray-900 transition-all duration-200"
                                    >
                                        {res.name}{" "}
                                        <span
                                            key={"scrollerInner2-" + res.id}
                                            className="rounded bg-red-600 px-2 ml-1"
                                        >
                                            {res.total}
                                        </span>
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
            </>
        );
    }
}

const ChannelGroupButton = channelsConnector(GroupButtonComponent);
const VideoGroupButton = videoConnector(GroupButtonComponent);

const GroupButton = {
    Channel: ChannelGroupButton,
    Video: VideoGroupButton,
};

export default GroupButton;
