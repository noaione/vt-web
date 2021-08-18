import React from "react";
import { Switch } from "@headlessui/react";
import { connect, ConnectedProps } from "react-redux";
import { PlatformType } from "../../lib/vt";

function simpleDebounce<T extends (...args: any) => ReturnType<T>>(fn: T, wait: number) {
    let timeoutFunc: NodeJS.Timeout;
    return (...args: any) => {
        clearTimeout(timeoutFunc);
        timeoutFunc = setTimeout(() => {
            fn(...args);
        }, wait);
    };
}

const channelsDispatch = {
    setPlatforms: (payload: PlatformType[]) => ({ type: "channels/setPlatforms", payload }),
};
const videosDispatch = {
    setPlatforms: (payload: PlatformType[]) => ({ type: "videos/setPlatforms", payload }),
};
const channelsConnector = connect(null, channelsDispatch);
const videosConnector = connect(null, videosDispatch);
type PropsFromRedux = ConnectedProps<typeof channelsConnector>;

interface SearchBoxState {
    platformTick: PlatformType[];
}
const defaultState: PlatformType[] = ["youtube", "twitcasting", "twitch", "bilibili", "mildom"];

class PlatformsFilterComponent extends React.Component<PropsFromRedux, SearchBoxState> {
    debouncer: (...args: any) => void;

    constructor(props: PropsFromRedux) {
        super(props);
        this.dispatchActual = this.dispatchActual.bind(this);
        this.debouncer = simpleDebounce(this.dispatchActual, 300);
        this.platformFilter = this.platformFilter.bind(this);
        this.state = {
            platformTick: defaultState,
        };
    }

    dispatchActual(data: PlatformType[]) {
        this.props.setPlatforms(data);
    }

    platformFilter(change: PlatformType) {
        const { platformTick } = this.state;
        let newPlatformTick = [...platformTick];
        if (platformTick.includes(change)) {
            newPlatformTick = platformTick.filter((e) => e !== change);
        } else {
            newPlatformTick = [...platformTick, change];
        }
        this.setState({ platformTick: newPlatformTick });
        this.debouncer(newPlatformTick);
    }

    render() {
        const { platformTick } = this.state;
        return (
            <div className="flex flex-col mt-3 ml-2 gap-1">
                <div className="text-gray-300 font-semibold">Filter Platform</div>
                <div className="mt-1 flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-row gap-2">
                        <i className="ihaicon ihaico-youtube text-youtube text-2xl -mt-1"></i>
                        <Switch
                            checked={platformTick.includes("youtube")}
                            onChange={() => this.platformFilter("youtube")}
                            className={`${
                                platformTick.includes("youtube") ? "bg-red-500" : "bg-gray-600"
                            } relative inline-flex items-center h-6 rounded-full w-11`}
                        >
                            <span className="sr-only">Enable YouTube</span>
                            <span
                                className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${
                                    platformTick.includes("youtube") ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </Switch>
                    </div>
                    <div className="flex flex-row gap-2">
                        <i className="ihaicon ihaico-bilibili text-bili2 text-2xl -mt-1"></i>
                        <Switch
                            checked={platformTick.includes("bilibili")}
                            onChange={() => this.platformFilter("bilibili")}
                            className={`${
                                platformTick.includes("bilibili") ? "bg-pl-bili2" : "bg-gray-600"
                            } relative inline-flex items-center h-6 rounded-full w-11`}
                        >
                            <span className="sr-only">Enable BiliBili</span>
                            <span
                                className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${
                                    platformTick.includes("bilibili") ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </Switch>
                    </div>
                    <div className="flex flex-row gap-2">
                        <i className="ihaicon ihaico-twitch text-twitch text-2xl -mt-1"></i>
                        <Switch
                            checked={platformTick.includes("twitch")}
                            onChange={() => this.platformFilter("twitch")}
                            className={`${
                                platformTick.includes("twitch") ? "bg-pl-twitch" : "bg-gray-600"
                            } relative inline-flex items-center h-6 rounded-full w-11`}
                        >
                            <span className="sr-only">Enable Twitch</span>
                            <span
                                className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${
                                    platformTick.includes("twitch") ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </Switch>
                    </div>
                    <div className="flex flex-row gap-2">
                        <i className="ihaicon ihaico-twitcasting text-twcast text-2xl -mt-1"></i>
                        <Switch
                            checked={platformTick.includes("twitcasting")}
                            onChange={() => this.platformFilter("twitcasting")}
                            className={`${
                                platformTick.includes("twitcasting") ? "bg-pl-twcast" : "bg-gray-600"
                            } relative inline-flex items-center h-6 rounded-full w-11`}
                        >
                            <span className="sr-only">Enable Twitcasting</span>
                            <span
                                className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${
                                    platformTick.includes("twitcasting") ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </Switch>
                    </div>
                    <div className="flex flex-row gap-2">
                        <i className="ihaicon ihaico-mildom_simple text-mildom text-2xl -mt-1"></i>
                        <Switch
                            checked={platformTick.includes("mildom")}
                            onChange={() => this.platformFilter("mildom")}
                            className={`${
                                platformTick.includes("mildom") ? "bg-pl-mildom" : "bg-gray-600"
                            } relative inline-flex items-center h-6 rounded-full w-11`}
                        >
                            <span className="sr-only">Enable Mildom</span>
                            <span
                                className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${
                                    platformTick.includes("mildom") ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }
}

const ChannelsPlatformsFilterComponent = channelsConnector(PlatformsFilterComponent);
const VideosPlatformsFilterComponent = videosConnector(PlatformsFilterComponent);
export { ChannelsPlatformsFilterComponent, VideosPlatformsFilterComponent };
