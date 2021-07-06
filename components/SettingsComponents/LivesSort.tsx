import React, { useEffect, useState } from "react";

import { getLocalStorageData } from "./helper";

export default function LivesSortSettings() {
    const [sortBy, setSort] = useState("group");
    const [run, setRun] = useState(false);

    useEffect(() => {
        if (run) {
            return;
        }
        const sortedBy = getLocalStorageData(localStorage, "vtapi.sortBy", sortBy);
        setSort(sortedBy);
        setRun(true);
    });

    useEffect(() => {
        localStorage.setItem("vtapi.sortBy", sortBy);
    }, [sortBy]);

    return (
        <div className="flex flex-col mt-4 gap-2 ml-2">
            <div className="flex text-lg font-semibold">Lives/Upcoming Sorting</div>
            <div className="flex text-sm text-gray-300 -mt-1">
                Selecting &quot;Group&quot; will sort and group the lives/upcoming video by the Group or
                Organization it belongs to.
            </div>
            <div className="flex text-sm text-gray-300 -mt-1">
                Selecting &quot;Time&quot; will sort and group the start/end time of the video/stream, It will
                group it by every new HOUR:MINUTE data.
            </div>
            <div>
                <select
                    className="form-select w-full md:w-1/2 lg:w-1/3 mt-1 bg-gray-700 rounded-lg border-gray-700 hover:border-gray-400 transition duration-200"
                    value={sortBy}
                    onChange={(e) => setSort(e.target.value)}
                    aria-label="timezone"
                >
                    <option value="group">Sort by Group</option>
                    <option value="time">Sort by Start Time/End Time</option>
                </select>
            </div>
        </div>
    );
}
