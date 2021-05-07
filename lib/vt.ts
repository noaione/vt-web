import fetcher from "./fetcher";
import { capitalizeLetters, Nullable } from "./utils";

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

export async function ihaAPIQuery(gqlSchemas: string, cursor: string = "") {
    let apiRes = await fetcher("https://api.ihateani.me/v2/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            query: gqlSchemas,
            variables: {
                cursor: cursor,
            },
        }),
    });
    return apiRes;
}
