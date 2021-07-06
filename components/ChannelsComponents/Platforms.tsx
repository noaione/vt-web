import React, { useState } from "react";
import { Switch } from "@headlessui/react";
import { PlatformType } from "../../lib/vt";
import { useStoreDispatch } from "../../lib/store";
import { setPlatforms } from "../../lib/slices/channels";

const defaultState: PlatformType[] = ["youtube", "twitcasting", "twitch", "bilibili", "mildom"];

export default function PlatformsFilterComponent() {
    const [platformTick, setSearchQuery] = useState<PlatformType[]>(defaultState);
    const dispatch = useStoreDispatch();

    function platformFilter(tobeChanged: PlatformType) {
        if (platformTick.includes(tobeChanged)) {
            const filtered = platformTick.filter((e) => e !== tobeChanged);
            setSearchQuery(filtered);
            dispatch(setPlatforms(filtered));
        } else {
            const copy = [].concat(platformTick);
            copy.push(tobeChanged);
            setSearchQuery(copy);
            dispatch(setPlatforms(copy));
        }
    }

    return (
        <div className="flex flex-col mt-3 ml-2 gap-1">
            <div className="text-gray-300 font-semibold">Filter Platform</div>
            <div className="mt-1 flex flex-col sm:flex-row gap-4">
                <div className="flex flex-row gap-2">
                    <i className="ihaicon ihaico-youtube text-youtube text-2xl -mt-1"></i>
                    <Switch
                        checked={platformTick.includes("youtube")}
                        onChange={() => platformFilter("youtube")}
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
                        onChange={() => platformFilter("bilibili")}
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
                        onChange={() => platformFilter("twitch")}
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
                        onChange={() => platformFilter("twitcasting")}
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
                        onChange={() => platformFilter("mildom")}
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
