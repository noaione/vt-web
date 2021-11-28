import { DateTime } from "luxon";
import React from "react";

import { TokiProps } from "./Toki";
import TimeTicker from "../TimeTicker";

import { durationToText, isType } from "../../lib/utils";

function TimeToString(data?: any, tz?: string, format = "dd LLL yyyy"): string {
    if (isType(data as number, "number")) {
        return DateTime.fromSeconds(data, { zone: "UTC" })
            .setZone(tz || "UTC+09:00")
            .setLocale("en")
            .toFormat(format);
    } else if (isType(data as string, "string")) {
        const parse = DateTime.fromISO(data, { zone: "UTC" });
        if (parse.isValid) {
            return parse
                .setZone(tz || "UTC+09:00")
                .setLocale("en")
                .toFormat(format);
        }
    }
    return "XX XXXX 20XX";
}

function BottomText(status: "live" | "upcoming" | "past" | "video", tz?: string) {
    if (status === "video") {
        return `Published at (${tz ?? "UTC+09:00"})`;
    }
    if (status === "upcoming") {
        return `Scheduled start time (${tz ?? "UTC+09:00"})`;
    }
    return `Start time (${tz ?? "UTC+09:00"})`;
}

interface Locale {
    tz?: string;
}

export default function TimeVideoInfoBlock(props: TokiProps & Locale) {
    const { status, startTime, scheduledStartTime, endTime, publishedAt, isPremiere, duration, tz } = props;

    let rightSideText = isPremiere ? "Video" : "Stream";
    rightSideText += " Duration";
    if (status === "upcoming" && !isPremiere) {
        rightSideText = "Streaming in";
    }
    return (
        <div
            className={`grid ${
                status === "video" ? "grid-cols-1" : "grid-cols-2"
            } justify-between mt-4 items-center`}
        >
            <div className="flex flex-col">
                <div className="font-bold justify-center text-center">
                    {status === "video" ? (
                        <span>{TimeToString(publishedAt, tz)}</span>
                    ) : (
                        <span>
                            {TimeToString(status === "upcoming" ? scheduledStartTime : startTime, tz)}
                        </span>
                    )}
                </div>
                <div className="font-light text-2xl mt-1 justify-center text-center">
                    {status === "video" ? (
                        <span>{TimeToString(publishedAt, tz, "HH:mm:ss")}</span>
                    ) : (
                        <span>
                            {TimeToString(
                                status === "upcoming" ? scheduledStartTime : startTime,
                                tz,
                                "HH:mm:ss"
                            )}
                        </span>
                    )}
                </div>
                <div className="font-semibold text-sm mt-1 justify-center text-center text-gray-300">
                    {BottomText(status, tz)}
                </div>
            </div>
            {status !== "video" && (
                <>
                    <div className="flex flex-col">
                        <div className="font-bold justify-center text-center">
                            {status === "upcoming" ? (
                                <>
                                    {isPremiere ? (
                                        <span>{TimeToString(scheduledStartTime || startTime, tz)}</span>
                                    ) : (
                                        <span>XX/XX/20XX</span>
                                    )}
                                </>
                            ) : (
                                <span>{TimeToString(status === "past" ? endTime : startTime, tz)}</span>
                            )}
                        </div>
                        <div className="font-light text-2xl mt-1 justify-center text-center">
                            {status === "upcoming" ? (
                                <>
                                    {isPremiere ? (
                                        <span>{durationToText(duration)}</span>
                                    ) : (
                                        <TimeTicker startTime={scheduledStartTime} raw reversed />
                                    )}
                                </>
                            ) : (
                                <>
                                    {status === "live" ? (
                                        <TimeTicker startTime={startTime} raw />
                                    ) : (
                                        <span>{durationToText(endTime - startTime)}</span>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="font-semibold text-sm mt-1 justify-center text-center text-gray-300">
                            {rightSideText}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
