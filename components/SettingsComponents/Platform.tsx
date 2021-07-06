import { cloneDeep, has } from "lodash";
import React from "react";
import { mapBoolean } from "../../lib/utils";

import { getLocalStorageData } from "./helper";

interface IChecked {
    yt: boolean;
    ttv: boolean;
    md: boolean;
    b2: boolean;
    tw: boolean;
}

export default class PlatformComponent extends React.Component<{}, IChecked> {
    constructor(props) {
        super(props);
        this.changeData = this.changeData.bind(this);
        this.state = {
            yt: true,
            ttv: true,
            md: true,
            b2: true,
            tw: true,
        };
    }

    componentDidMount() {
        const platformInclude = JSON.parse(
            getLocalStorageData(localStorage, "vtapi.platInc", JSON.stringify(this.state))
        ) as any;
        let { yt, ttv, md, b2, tw } = this.state;
        if (has(platformInclude, "yt")) {
            yt = mapBoolean(platformInclude.yt);
        }
        if (has(platformInclude, "ttv")) {
            ttv = mapBoolean(platformInclude.ttv);
        }
        if (has(platformInclude, "md")) {
            md = mapBoolean(platformInclude.md);
        }
        if (has(platformInclude, "b2")) {
            b2 = mapBoolean(platformInclude.b2);
        }
        if (has(platformInclude, "tw")) {
            tw = mapBoolean(platformInclude.tw);
        }
        this.setState({ yt, ttv, md, b2, tw });
    }

    changeData(key: keyof IChecked, value: boolean) {
        const copyData = cloneDeep(this.state) as IChecked;
        copyData[key] = value;
        this.setState({ ...copyData });
        localStorage.setItem("vtapi.platInc", JSON.stringify(copyData));
    }

    render() {
        return (
            <>
                <div className="flex flex-col mt-4 gap-2 mx-2">
                    <div className="flex text-lg font-semibold">Include Platform</div>
                    <div className="flex text-sm text-gray-300 -mt-1">
                        This will not affect the Channel and Video Page
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row items-center gap-2">
                            <input
                                className="form-checkbox transition duration-150 rounded-sm"
                                checked={this.state.yt}
                                type="checkbox"
                                onChange={(e) => this.changeData("yt", e.target.checked)}
                                aria-label="platform-yt-check"
                            />
                            <span>YouTube</span>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <input
                                className="form-checkbox transition duration-150 rounded-sm"
                                checked={this.state.b2}
                                type="checkbox"
                                onChange={(e) => this.changeData("b2", e.target.checked)}
                                aria-label="platform-b2-check"
                            />
                            <span>BiliBili</span>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <input
                                className="form-checkbox transition duration-150 rounded-sm"
                                checked={this.state.ttv}
                                type="checkbox"
                                onChange={(e) => this.changeData("ttv", e.target.checked)}
                                aria-label="platform-ttv-check"
                            />
                            <span>Twitch</span>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <input
                                className="form-checkbox transition duration-150 rounded-sm"
                                checked={this.state.tw}
                                type="checkbox"
                                onChange={(e) => this.changeData("tw", e.target.checked)}
                                aria-label="platform-tw-check"
                            />
                            <span>Twitcasting</span>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <input
                                className="form-checkbox transition duration-150 rounded-sm"
                                checked={this.state.md}
                                type="checkbox"
                                onChange={(e) => this.changeData("md", e.target.checked)}
                                aria-label="platform-md-check"
                            />
                            <span>Mildom</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
