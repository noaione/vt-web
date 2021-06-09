import { has } from "lodash";

import fetcher from "./fetcher";
import { capitalizeLetters, isNone, mapBoolean, Nullable } from "./utils";

import { getLocalStorageData } from "../components/SettingsComponents/helper";

export type PlatformType = "youtube" | "bilibili" | "twitch" | "twitcasting" | "mildom";
export type VideoType = "live" | "upcoming" | "past" | "video";

export const GROUPS_NAME_MAP = {
    animare: "Animare",
    "axel-v": "AXEL-V",
    cattleyarg: "Cattleya Regina Games",
    dotlive: ".LIVE",
    eilene: "Eilene",
    entum: "ENTUM",
    hanayori: "Hanayori",
    hololive: "Hololive",
    hololiveen: "Hololive English",
    hololivecn: "Hololive China",
    hololiveid: "Hololive Indonesia",
    holostars: "Holostars",
    honeystrap: "Honeystrap",
    irisbg: "Iris Black Games",
    kamitsubaki: "KAMITSUBAKI Studio",
    kizunaai: "Kizuna Ai Co.",
    lupinusvg: "Lupinus Video Games",
    mahapanca: "MAHA5",
    nijisanji: "NIJISANJI",
    nijisanjiid: "NIJISANJI Indonesia",
    nijisanjiin: "NIJISANJI India",
    nijisanjikr: "NIJISANJI Korea",
    nijisanjien: "NIJISANJI English",
    noriopro: "Norio Production",
    paryiproject: "Paryi Project",
    prismproject: "PRISM Project",
    solovtuber: "Solo/Indie",
    sugarlyric: "SugarLyric",
    tsunderia: "Tsunderia",
    upd8: "upd8",
    vapart: "VAPArt",
    veemusic: "VEEMusic",
    vgaming: "VGaming",
    vic: "VIC",
    virtuareal: "VirtuaReal",
    vivid: "ViViD",
    voms: "VOMS",
    vspo: "VTuber eSports Project",
    vshojo: "VShojo",
};

export function selectPlatformColor(platform: PlatformType) {
    switch (platform) {
        case "youtube":
            return "#FE0000";
        case "bilibili":
            return "#00a1d6";
        case "twitch":
            return "#9146FF";
        case "twitcasting":
            return "#3381ff";
        case "mildom":
            return "#38cce3";
        default:
            return null;
    }
}

export function selectBorderColor(platform: PlatformType) {
    switch (platform) {
        case "youtube":
            return "border-youtube";
        case "bilibili":
            return "border-bili2";
        case "twitch":
            return "border-twitch";
        case "twitcasting":
            return "border-twcast";
        case "mildom":
            return "border-mildom";
        default:
            return "border-gray-300";
    }
}

export function selectTextColor(platform: PlatformType) {
    switch (platform) {
        case "youtube":
            return "text-youtube";
        case "bilibili":
            return "text-bili2";
        case "twitch":
            return "text-twitch";
        case "twitcasting":
            return "text-twcast";
        case "mildom":
            return "text-mildom";
        default:
            return "text-gray-300";
    }
}

export function prependChannelURL(channelId: string, platform: PlatformType) {
    if (platform === "youtube") {
        return `https://youtube.com/channel/${channelId}`;
    } else if (platform === "bilibili") {
        return `https://space.bilibili.com/${channelId}`;
    } else if (platform === "twitch") {
        return `https://twitch.tv/${channelId}`;
    } else if (platform === "twitcasting") {
        return `https://twitcasting.tv/${channelId}`;
    } else if (platform === "mildom") {
        return `https://mildom.com/profile/${channelId}`;
    }
}

export function prependWatchUrl(videoId: string, channelId: string, roomId: string, platform: PlatformType) {
    if (platform === "youtube") {
        return `https://youtube.com/watch?v=${videoId}`;
    } else if (platform === "bilibili") {
        return `https://live.bilibili.com/${roomId}`;
    } else if (platform === "twitch") {
        return `https://twitch.tv/${channelId}`;
    } else if (platform === "twitcasting") {
        return `https://twitcasting.tv/${channelId}`;
    } else if (platform === "mildom") {
        return `https://mildom.com/${channelId}`;
    }
}

export function prependVideoURLPage(
    videoId: string,
    channelId: string,
    roomId: string,
    platform: PlatformType,
    status: "live" | "upcoming" | "past" | "video" = "past"
) {
    if (status === "video" || status === "past") {
        if (platform === "youtube") {
            return `https://youtube.com/watch?v=${videoId}`;
        } else if (platform === "bilibili") {
            return `https://space.bilibili.com/${channelId}/video`;
        } else if (platform === "twitch") {
            return `https://twitch.tv/${channelId}/videos`;
        } else if (platform === "twitcasting") {
            return `https://twitcasting.tv/${channelId}/movie/${videoId}`;
        } else if (platform === "mildom") {
            return `https://mildom.com/playback/${channelId}/${videoId}`;
        }
    }
    return prependWatchUrl(videoId, channelId, roomId, platform);
}

export function prettyPlatformName(platform: PlatformType) {
    switch (platform) {
        case "youtube":
            return "YouTube";
        case "bilibili":
            return "BiliBili";
        case "twitch":
            return "Twitch";
        case "twitcasting":
            return "Twitcasting";
        case "mildom":
            return "Mildom";
        default:
            return capitalizeLetters(platform);
    }
}

export function platformToShortCode(platform: PlatformType) {
    let shortCode: string;
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
    return shortCode;
}

export function shortCodeToPlatform(shortCode: string): Nullable<PlatformType> {
    switch (shortCode) {
        case "yt":
            return "youtube";
        case "b2":
            return "bilibili";
        case "ttv":
            return "twitch";
        case "twcast":
            return "twitcasting";
        case "md":
            return "mildom";
        default:
            return null;
    }
}

interface GQLDataErrorLocation {
    line: number;
    column: number;
}

interface GQLDataErrorExtension {
    code: string;
    timestamp: string;
}

interface GQLDataError {
    message: string;
    locations: GQLDataErrorLocation[];
    path: any[];
    extensions?: GQLDataErrorExtension;
}

interface GQLDataResponse<T> {
    data?: T;
    errors?: GQLDataError[];
}

export async function ihaAPIQuery<T = any>(
    gqlSchemas: string,
    cursor: string = "",
    extraVariables = {}
): Promise<GQLDataResponse<T>> {
    const mergedVariables = Object.assign({}, extraVariables, { cursor });
    const apiRes = await fetcher("https://api.ihateani.me/v2/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            query: gqlSchemas,
            variables: mergedVariables,
        }),
    });
    return apiRes;
}

export function filterFreeChat(title: string) {
    const matched = title.match(/(fr[e]{2}).*(chat)/i);
    if (isNone(matched)) {
        // include since it's unmatched
        return true;
    }
    return matched.length > 0 ? false : true;
}

export function getGroupsAndPlatformsFilters(localStorage: Storage) {
    const loadedGroups = getLocalStorageData(localStorage, "vtapi.excluded", JSON.stringify([])) as string[];
    const allGroups = Object.keys(GROUPS_NAME_MAP).filter((e) => !loadedGroups.includes(e));
    let allPlatforms = ["youtube", "twitch", "twitcasting", "bilibili", "mildom"];
    const platformInclude = getLocalStorageData(
        localStorage,
        "vtapi.platInc",
        JSON.stringify({
            yt: true,
            ttv: true,
            md: true,
            b2: true,
            tw: true,
        })
    ) as any;
    if (has(platformInclude, "yt")) {
        if (!mapBoolean(platformInclude.yt)) {
            allPlatforms = allPlatforms.filter((e) => e !== "youtube");
        }
    }
    if (has(platformInclude, "ttv")) {
        if (!mapBoolean(platformInclude.ttv)) {
            allPlatforms = allPlatforms.filter((e) => e !== "twitch");
        }
    }
    if (has(platformInclude, "md")) {
        if (!mapBoolean(platformInclude.md)) {
            allPlatforms = allPlatforms.filter((e) => e !== "mildom");
        }
    }
    if (has(platformInclude, "b2")) {
        if (!mapBoolean(platformInclude.b2)) {
            allPlatforms = allPlatforms.filter((e) => e !== "bilibili");
        }
    }
    if (has(platformInclude, "tw")) {
        if (!mapBoolean(platformInclude.tw)) {
            allPlatforms = allPlatforms.filter((e) => e !== "twitcasting");
        }
    }
    return {
        platform: allPlatforms,
        groups: allGroups,
    };
}
