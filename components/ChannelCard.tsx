import React, { useState } from "react";

import Buttons from "./Buttons";

import {
    GROUPS_NAME_MAP,
    PlatformType,
    prependChannelURL,
    selectBorderColor,
    selectTextColor,
} from "../lib/vt";
import { isNone, Nullable, walk } from "../lib/utils";
import Modal, { CallbackModal } from "./Modal";
import fetcher from "../lib/fetcher";
import Link from "next/link";

const MutationQuery = `mutation VTuberRemove($id:String!,$platform:PlatformName!) {
    VTuberRemove(id:$id,platform:$platform) {
        id
        platform
        isRemoved
    }
}

mutation VTuberRetire($id:String!,$platform:PlatformName!,$retire:Boolean) {
    VTuberRetired(id:$id,platform:$platform,retire:$retire) {
        id
        is_retired
    }
}
`;
interface DeleteButtonProps {
    id: string;
    name: string;
    platform: PlatformType;
    callbackRemove: (id: string, platform: PlatformType) => void;
}

interface DeleteButtonState {
    isSubmit: boolean;
}

class DeleteButton extends React.Component<DeleteButtonProps, DeleteButtonState> {
    modalCb?: CallbackModal;

    constructor(props) {
        super(props);
        this.nukeChannelForReal = this.nukeChannelForReal.bind(this);
        this.handleHide = this.handleHide.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.state = {
            isSubmit: false,
        };
    }

    async nukeChannelForReal() {
        if (this.state.isSubmit) return;
        this.setState({
            isSubmit: true,
        });

        const GQLRequest = {
            query: MutationQuery,
            operationName: "VTuberRemove",
            variables: {
                id: this.props.id,
                platform: this.props.platform,
            },
        };

        try {
            const requested = await fetcher("https://api.ihateani.me/v2/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `password ${process.env.IHAAPI_PASSWORD ?? ""}`,
                },
                body: JSON.stringify(GQLRequest),
            });
            const result = walk(requested, "data.VTuberRemove");
            if (isNone(result)) {
                // fuck and raise
            }
            this.props.callbackRemove(this.props.id, this.props.platform);
        } catch (e) {
            // fuck
        }
        this.setState({ isSubmit: false });
    }

    handleHide() {
        if (this.modalCb) {
            this.modalCb.hideModal();
        }
    }

    handleShow() {
        if (this.modalCb && !this.state.isSubmit) {
            this.modalCb.showModal();
        }
    }

    render() {
        return (
            <>
                <Buttons onClick={this.handleShow} btnType="danger" disabled={this.state.isSubmit}>
                    Delete
                </Buttons>
                <Modal onMounted={(cb) => (this.modalCb = cb)}>
                    <Modal.Head>Are you sure?</Modal.Head>
                    <Modal.Body>
                        <div>
                            This will delete this channel <strong>{this.props.name}</strong> from Database
                        </div>
                        <div>This action is irreversible, please make sure!</div>
                    </Modal.Body>
                    <Modal.Footer outerClassName="justify-center">
                        <Buttons onClick={this.nukeChannelForReal} btnType="danger">
                            Delete
                        </Buttons>
                        <Buttons onClick={this.handleHide} btnType="primary">
                            Cancel
                        </Buttons>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

interface RetireButtonProps extends Omit<DeleteButtonProps, "callbackRemove"> {
    retired: boolean;
    callbackRetire: (isRetired: boolean) => void;
}

class RetireButton extends React.Component<RetireButtonProps, DeleteButtonState> {
    constructor(props) {
        super(props);
        this.setRetireData = this.setRetireData.bind(this);
        this.state = {
            isSubmit: false,
        };
    }

    async setRetireData() {
        if (this.state.isSubmit) return;
        this.setState({
            isSubmit: true,
        });

        const GQLRequest = {
            id: this.props.id,
            platform: this.props.platform,
            retire: !this.props.retired,
        };

        try {
            const requested = await fetcher("/api/retire", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(GQLRequest),
            });
            const result = walk(requested, "data.VTuberRetired");
            if (isNone(result)) {
                // fuck and raise
            }
            this.props.callbackRetire(result.is_retired);
        } catch (e) {
            // fuck
        }
        this.setState({ isSubmit: false });
    }

    render() {
        const { retired } = this.props;
        return (
            <Buttons onClick={this.setRetireData} btnType="warning" disabled={this.state.isSubmit}>
                {retired ? "Unretire" : "Retire"}
            </Buttons>
        );
    }
}

interface HistoryData {
    data: number;
    time: number;
}

export interface ChannelCardProps {
    id: string;
    room_id?: string;
    name: string;
    en_name?: string;
    image: string;
    platform: PlatformType;
    group: keyof typeof GROUPS_NAME_MAP;
    statistics?: {
        subscriberCount?: Nullable<number>;
        viewCount?: Nullable<number>;
    };
    history?: {
        subscribersCount?: HistoryData;
        viewsCount?: HistoryData;
    };
    publishedAt?: string;
    is_retired?: boolean;
}

interface ExtraCardsProps {
    adminMode?: boolean;
    callbackRemove: (id: string, platform: PlatformType) => void;
}

function ChannelCard(props: ChannelCardProps & ExtraCardsProps) {
    const { id, name, image, platform, statistics, is_retired, adminMode } = props;
    const { subscriberCount, viewCount } = statistics;

    const [VTRetired, setVTRetired] = useState(is_retired);

    let shortCode;
    switch (platform) {
        case "youtube":
            shortCode = "yt";
            break;
        case "bilibili":
            shortCode = "b2";
            break;
        case "twitch":
            shortCode = "ttv";
            break;
        case "twitcasting":
            shortCode = "twcast";
            break;
        case "mildom":
            shortCode = "md";
            break;
        default:
            shortCode = "unk";
            break;
    }

    const isViewCount = typeof viewCount === "number";

    const borderColor = selectBorderColor(platform);
    const textCol = selectTextColor(platform);

    let ihaIco = platform;
    if (ihaIco === "mildom") {
        ihaIco += "_simple";
    }

    function callbackRetire(isRetired: boolean) {
        setVTRetired(isRetired);
    }

    return (
        <>
            <div id={"ch-" + id + "-" + platform} className="flex rounded-lg">
                <div className={"m-auto shadow-md rounded-lg w-full border " + borderColor}>
                    <div className="relative rounded-lg">
                        <Link href={"/channel/" + shortCode + "-" + id} passHref>
                            <a className="rounded-lg">
                                <img
                                    src={image}
                                    alt={name + " Channel Image"}
                                    loading="lazy"
                                    className={`w-full object-cover object-center rounded-t-lg ${
                                        VTRetired && "opacity-50"
                                    }`}
                                />
                            </a>
                        </Link>
                    </div>
                    <div className="px-4 py-4 text-gray-200 bg-gray-900">
                        <p className="mt-1 uppercase text-sm tracking-wide font-bold text-center">
                            <i className={textCol + " mr-2 ihaicon ihaico-" + ihaIco}></i>
                            {platform}
                            {VTRetired && <span className="text-gray-400 ml-1 text-sm">{"(retired)"}</span>}
                        </p>
                        <p className="mt-2 text-white text-lg font-semibold text-center">{name}</p>
                    </div>
                    <div className={"px-4 py-4 text-gray-200 bg-gray-900 border-t " + borderColor}>
                        <p>
                            <span className="font-bold">Subscribers</span>: {subscriberCount.toLocaleString()}
                        </p>
                    </div>
                    {isViewCount && (
                        <div className={"px-4 py-4 text-gray-200 bg-gray-900 border-t " + borderColor}>
                            <p>
                                <span className="font-bold">Views</span>: {viewCount.toLocaleString()}
                            </p>
                        </div>
                    )}
                    <div
                        className={
                            "rounded-b-lg px-4 py-4 text-gray-200 bg-gray-900 text-center flex flex-row gap-2 justify-center border-t " +
                            borderColor
                        }
                    >
                        {adminMode ? (
                            <>
                                <RetireButton
                                    id={id}
                                    name={name}
                                    platform={platform}
                                    retired={VTRetired}
                                    callbackRetire={callbackRetire}
                                />
                                <DeleteButton
                                    id={id}
                                    name={name}
                                    platform={platform}
                                    callbackRemove={props.callbackRemove}
                                />
                            </>
                        ) : (
                            <>
                                <Buttons use="a" href={prependChannelURL(id, platform)} btnType="danger">
                                    Watch
                                </Buttons>
                                <Buttons use="a" href={"/channel/" + shortCode + "-" + id} btnType="primary">
                                    Info
                                </Buttons>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ChannelCard;
