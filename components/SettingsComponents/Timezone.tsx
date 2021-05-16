import React from "react";

import { DateTime } from "luxon";
import { getLocalStorageData } from "./helper";

const TZ_LIST = [
    <option key="tz-utc12" value="UTC-12:00">
        UTC-12:00
    </option>,
    <option key="tz-utc11" value="UTC-11:00">
        UTC-11:00
    </option>,
    <option key="tz-utc10" value="UTC-10:00">
        UTC-10:00
    </option>,
    <option key="tz-utc0930" value="UTC-09:30">
        UTC-09:30
    </option>,
    <option key="tz-utc09" value="UTC-09:00">
        UTC-09:00
    </option>,
    <option key="tz-utc08" value="UTC-08:00">
        UTC-08:00
    </option>,
    <option key="tz-utc07" value="UTC-07:00">
        UTC-07:00
    </option>,
    <option key="tz-utc06" value="UTC-06:00">
        UTC-06:00
    </option>,
    <option key="tz-utc05" value="UTC-05:00">
        UTC-05:00
    </option>,
    <option key="tz-utc04" value="UTC-04:00">
        UTC-04:00
    </option>,
    <option key="tz-utc03" value="UTC-03:00">
        UTC-03:00
    </option>,
    <option key="tz-utc0330" value="UTC-03:30">
        UTC-03:30
    </option>,
    <option key="tz-utc0200" value="UTC-02:00">
        UTC-02:00
    </option>,
    <option key="tz-utc0100" value="UTC-01:00">
        UTC-01:00
    </option>,
    <option key="tz-utc00" value="UTC+00:00">
        UTC+00:00
    </option>,
    <option key="tz-utc+01" value="UTC+01:00">
        UTC+01:00
    </option>,
    <option key="tz-utc+02" value="UTC+02:00">
        UTC+02:00
    </option>,
    <option key="tz-utc+03" value="UTC+03:00">
        UTC+03:00
    </option>,
    <option key="tz-utc+0330" value="UTC+03:30">
        UTC+03:30
    </option>,
    <option key="tz-utc+04" value="UTC+04:00">
        UTC+04:00
    </option>,
    <option key="tz-utc+0430" value="UTC+04:30">
        UTC+04:30
    </option>,
    <option key="tz-utc+05" value="UTC+05:00">
        UTC+05:00
    </option>,
    <option key="tz-utc+0530" value="UTC+05:30">
        UTC+05:30
    </option>,
    <option key="tz-utc+0545" value="UTC+05:45">
        UTC+05:45
    </option>,
    <option key="tz-utc+06" value="UTC+06:00">
        UTC+06:00
    </option>,
    <option key="tz-utc+0630" value="UTC+06:30">
        UTC+06:30
    </option>,
    <option key="tz-utc+07" value="UTC+07:00">
        UTC+07:00
    </option>,
    <option key="tz-utc+08" value="UTC+08:00">
        UTC+08:00
    </option>,
    <option key="tz-utc+0845" value="UTC+08:00">
        UTC+08:45
    </option>,
    <option key="tz-utc+09" value="UTC+09:00">
        UTC+09:00
    </option>,
    <option key="tz-utc+0930" value="UTC+09:30">
        UTC+09:30
    </option>,
    <option key="tz-utc+10" value="UTC+10:00">
        UTC+10:00
    </option>,
    <option key="tz-utc+1030" value="UTC+10:30">
        UTC+10:30
    </option>,
    <option key="tz-utc+11" value="UTC+11:00">
        UTC+11:00
    </option>,
    <option key="tz-utc+12" value="UTC+12:00">
        UTC+12:00
    </option>,
    <option key="tz-utc+1245" value="UTC+12:45">
        UTC+12:45
    </option>,
    <option key="tz-utc+13" value="UTC+13:00">
        UTC+13:00
    </option>,
    <option key="tz-utc+14" value="UTC+14:00">
        UTC+14:00
    </option>,
];

function getPreferedTimezone(localStorage: Storage) {
    const DEFAULTS = "UTC" + DateTime.local().toFormat("ZZ");
    const prefer = getLocalStorageData(localStorage, "vtapi.offsetLoc", DEFAULTS);
    return prefer;
}

interface TimezoneState {
    selTZ: string;
}

class TimezoneSettings extends React.Component<{}, TimezoneState> {
    constructor(props) {
        super(props);
        this.state = {
            selTZ: "UTC+09:00",
        };
    }

    componentDidMount() {
        this.setState({ selTZ: getPreferedTimezone(localStorage) });
    }

    componentDidUpdate() {
        localStorage.setItem("vtapi-offsetLoc", this.state.selTZ);
    }

    render() {
        return (
            <>
                <h4 className="text-lg font-semibold ml-2">Timezone/Offset</h4>
                <div>
                    <select
                        className="form-select ml-2 w-full md:w-1/2 lg:w-1/3 mt-2 bg-gray-700"
                        value={this.state.selTZ}
                        onChange={(e) => this.setState({ selTZ: e.target.value })}
                        aria-label="timezone"
                    >
                        {TZ_LIST.map((res) => {
                            return res;
                        })}
                    </select>
                </div>
            </>
        );
    }
}

export default TimezoneSettings;
