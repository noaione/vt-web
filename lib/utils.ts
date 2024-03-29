import { DateTime } from "luxon";
import { VideoCardProps } from "../components/VideoCard";

export type Nullable<T> = T | null;
export type NoneType = null | undefined;
export type NoneAble<T> = T | NoneType;
export type JSTypeof =
    | "string"
    | "function"
    | "bigint"
    | "number"
    | "boolean"
    | "undefined"
    | "object"
    | "symbol"
    | "array"; // Extra addition

export function capitalizeLetters(text: string) {
    return text.slice(0, 1).toUpperCase() + text.slice(1);
}

export function isType<T>(data: T, type: JSTypeof): data is typeof data {
    if (type === "array" && Array.isArray(data)) {
        return true;
    }
    return typeof data === type;
}

export function isNone(data: any): data is NoneType {
    return data === null || typeof data === "undefined";
}

export function walk(data: any, note: string) {
    const nots = note.split(".");
    for (let i = 0; i < nots.length; i++) {
        if (isNone(data)) {
            break;
        }
        const n = nots[i];
        data = data[n];
    }
    return data;
}

export function pickFirstLine(textdata: string) {
    if (typeof textdata !== "string") {
        return textdata;
    }
    const extractedLines = textdata.split("\n");
    if (extractedLines.length < 1) {
        return textdata;
    }
    return extractedLines[0];
}

/**
 * Map a string to a boolean, used for Express query.
 * @param { any } input_data - data to map
 * @returns { boolean } mapped boolean
 */
export function mapBoolean<T extends any>(input_data: T): boolean {
    if (isNone(input_data)) {
        return false;
    }
    let fstat = false;
    let data: any;
    if (typeof input_data === "string") {
        data = input_data.toLowerCase() as string;
    } else if (typeof input_data === "number") {
        data = input_data.toString().toLowerCase() as string;
    } else if (typeof input_data === "object") {
        data = JSON.stringify(input_data);
    } else if (typeof input_data === "boolean") {
        return input_data;
    } else {
        // @ts-ignore
        data = input_data.toString().toLowerCase();
    }
    switch (data) {
        case "y":
            fstat = true;
            break;
        case "enable":
            fstat = true;
            break;
        case "true":
            fstat = true;
            break;
        case "1":
            fstat = true;
            break;
        case "yes":
            fstat = true;
            break;
        default:
            break;
    }
    return fstat;
}

export function zeroPad(num: number) {
    return Math.floor(num).toString().padStart(2, "0");
}

export function durationToText(seconds: number) {
    if (seconds < 0) {
        return "N/A";
    }
    const s = seconds % 60;
    const m = (seconds / 60) % 60;
    const h = (seconds / 3600) % 60;
    if (h > 0) {
        return `${zeroPad(h)}:${zeroPad(m)}:${zeroPad(s)}`;
    }
    return `${zeroPad(m)}:${zeroPad(s)}`;
}

export type CurrentType = "live" | "schedule" | "past";

export function determineTimeTitle(
    o: VideoCardProps,
    currentType: CurrentType = "live",
    timeZonePrefer: string = "UTC+09:00",
    textFormat = "yyyy LL dd HH':'mm"
) {
    if (currentType === "past") {
        const {
            timeData: { startTime, endTime },
        } = o;
        if (typeof endTime === "number") {
            const d = DateTime.fromSeconds(endTime, { zone: "UTC" }).setZone(timeZonePrefer).startOf("hour");
            return d.toFormat(textFormat);
        } else {
            const d = DateTime.fromSeconds(startTime, { zone: "UTC" })
                .setZone(timeZonePrefer)
                .startOf("hour");
            return d.toFormat(textFormat);
        }
    } else if (currentType === "schedule") {
        const {
            timeData: { startTime, scheduledStartTime },
        } = o;
        if (typeof scheduledStartTime === "number") {
            const d = DateTime.fromSeconds(scheduledStartTime, { zone: "UTC" }).setZone(timeZonePrefer);
            return d.toFormat(textFormat);
        } else {
            const d = DateTime.fromSeconds(startTime, { zone: "UTC" })
                .setZone(timeZonePrefer)
                .startOf("hour");
            return d.toFormat(textFormat);
        }
    }
    const {
        timeData: { startTime },
    } = o;
    const d = DateTime.fromSeconds(startTime, { zone: "UTC" }).setZone(timeZonePrefer).startOf("hour");
    return d.toFormat(textFormat);
}
