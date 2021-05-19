import { DateTime } from "luxon";
import TimeAgo from "react-timeago";

import ClockIcon from "../Icon/ClockIcon";

import { isNone, isType } from "../../lib/utils";

interface VideoTimeAgoProps {
    timeData: string | number;
    isPremiere?: boolean;
    /**
     * This override isPremiere
     */
    isVideo?: boolean;
}

export default function VideoTimeAgo(props: VideoTimeAgoProps) {
    const { timeData, isPremiere, isVideo } = props;
    if (isNone(timeData)) {
        return null;
    }

    function parseToJSDate(data: any) {
        if (isType(data as string, "string")) {
            const parse = DateTime.fromISO(data, { zone: "UTC" });
            if (parse.isValid) {
                return parse.toJSDate();
            }
        } else if (isType(data as number, "number")) {
            const parse = DateTime.fromSeconds(data, { zone: "UTC" });
            if (parse.isValid) {
                return parse.toJSDate();
            }
        }
        return null;
    }

    const parsedJSDate = parseToJSDate(timeData);
    if (isNone(parsedJSDate)) {
        return null;
    }

    const asSeconds = parsedJSDate.getTime() / 1000;

    const isFuture = DateTime.utc().toSeconds() >= asSeconds;
    let spanText = isFuture ? "Streamed" : "Streaming";
    if (isPremiere) {
        spanText = isFuture ? "Premiered" : "Premiering";
    }
    if (isVideo) {
        spanText = "Uploaded";
    }

    return (
        <div className="flex flex-row justify-center items-center">
            <ClockIcon />
            <span className="ml-1 text-gray-400 font-bold">{spanText}</span>
            <TimeAgo className="ml-1 text-gray-400 font-light" date={parsedJSDate} />
        </div>
    );
}
