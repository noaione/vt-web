import React, { useEffect, useState } from "react";

import { getLocalStorageData } from "./helper";
import { mapBoolean } from "../../lib/utils";

export default function FreeChatIncludeSettings() {
    const [enabled, setEnabled] = useState(false);
    const [run, setRun] = useState(false);

    useEffect(() => {
        if (run) {
            return;
        }
        const fcEnabled = getLocalStorageData(localStorage, "vtapi.fcEnabled", enabled ? "true" : "false");
        setEnabled(mapBoolean(fcEnabled));
        setRun(true);
    });

    useEffect(() => {
        localStorage.setItem("vtapi.fcEnabled", enabled ? "true" : "false");
    }, [enabled]);

    return (
        <>
            <div className="flex flex-row mt-4 items-center gap-2">
                <input
                    className="form-checkbox ml-2"
                    checked={enabled}
                    type="checkbox"
                    onChange={(e) => setEnabled(e.target.checked)}
                    aria-label="freechat"
                />
                <span>Add Free Chat?</span>
            </div>
        </>
    );
}
