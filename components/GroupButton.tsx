import React from "react";

import { connect, ConnectedProps } from "react-redux";
import { get, groupBy, ValueIteratee } from "lodash";
import { Link as ScrollTo } from "react-scroll";

import GroupModal from "./GroupModal";
import { CallbackModal } from "./Modal";

import { RootState } from "../lib/store";
import { capitalizeLetters } from "../lib/utils";
import { GROUPS_NAME_MAP } from "../lib/vt";

const mapState = (state: RootState) => ({
    channels: state.channels.channels,
    videos: state.videos.videos,
});

const connector = connect(mapState);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface InferFrom extends PropsFromRedux {
    groupType: "video" | "channel";
    sortedBy?: "time" | "group";
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

class GroupButton extends React.Component<InferFrom> {
    modalCb?: CallbackModal;

    constructor(props) {
        super(props);
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
        const configuredCallback: GroupCallbackData[] = [];
        let sortedByGroup;
        if (this.props.groupType === "video") {
            sortedByGroup = groupMember(this.props.videos);
        } else if (this.props.groupType === "channel") {
            sortedByGroup = groupMember(this.props.channels);
        }
        sortedByGroup.forEach((items) => {
            const grp = items[0].group;
            configuredCallback.push({
                id: grp,
                name: get(GROUPS_NAME_MAP, grp, capitalizeLetters(grp)),
                total: items.length,
            });
        });
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

export default connector(GroupButton);
