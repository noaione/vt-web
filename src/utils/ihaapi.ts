import axios, { AxiosInstance, AxiosResponse } from "axios";

interface ChannelResult {
    id: string
    name: string
    en_name: string
    image: string
    group: string
    statistics: {
        subscriberCount: number
        viewCount?: number
    }
    platform: string
    publishedAt: string
}

interface PastStreams {
    id: string
    title: string
    thumbnail: string
    viewers: number
    peakViewers: number
    timeData: {
        endTime: number
    }
}

interface ItemsSet<T> {
    items: T[]
}

export const GROUPS_NAME_MAP = {
    "animare": "Animare",
    "axel-v": "AXEL-V",
    "cattleyarg": "Cattleya Regina Games",
    "dotlive": ".LIVE",
    "eilene": "Eilene",
    "entum": "ENTUM",
    "hanayori": "Hanayori",
    "hololive": "Hololive",
    "hololiveen": "Hololive English",
    "hololivecn": "Hololive China",
    "hololiveid": "Hololive Indonesia",
    "holostars": "Holostars",
    "honeystrap": "Honeystrap",
    "irisbg": "Iris Black Games",
    "kamitsubaki": "KAMITSUBAKI Studio",
    "kizunaai": "Kizuna Ai Co.",
    "lupinusvg": "Lupinus Video Games",
    "mahapanca": "MAHA5",
    "nijisanji": "NIJISANJI",
    "nijisanjiid": "NIJISANJI Indonesia",
    "nijisanjiin": "NIJISANJI India",
    "nijisanjikr": "NIJISANJI Korea",
    "nijisanjien": "NIJISANJI English",
    "noriopro": "Norio Production",
    "paryiproject": "Paryi Project",
    "solovtuber": "No Organization (Indie)",
    "sugarlyric": "SugarLyric",
    "tsunderia": "Tsunderia",
    "upd8": "upd8",
    "vapart": "VAPArt",
    "veemusic": "VEEMusic",
    "vgaming": "VGaming",
    "vic": "VIC",
    "virtuareal": "VirtuaReal",
    "vivid": "ViViD",
    "voms": "VOMS",
    "vspo": "VTuber eSports Project",
    "vshojo": "VShojo"
}

export type Platforms = "youtube" | "bilibili" | "twitch" | "twitcasting" | "mildom";

const IHAAPIV2_SCHEMAS = `query VTuberChannel($id:[ID!],$plat:[PlatformName]) {
    vtuber {
        channels(platforms:$plat,id:$id) {
            items {
                id
                name
                en_name
                image
                group
                statistics {
                    subscriberCount
                    viewCount
                }
                platform
                publishedAt
            }
        }
    }
}

query RecentStream($id:[ID],$plat:[PlatformName]) {
    vtuber {
        ended(channel_id:$id,platforms:$plat,limit:10) {
            items {
                id
                title
                thumbnail
                viewers
                peakViewers
                timeData {
                    endTime
                }
            }
        }
    }
}
`

interface VTuberResults<T = any> {
    data: {
        vtuber: {
            channels?: ItemsSet<T>
            ended?: ItemsSet<T>
        }
    }
}

export class ihaAPIv2 {
    sesi: AxiosInstance
    constructor() {
        this.sesi = axios.create({
            baseURL: "https://api.ihateani.me/v2/",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "vt-web/v1.1.0"
            }
        })
    }

    async channelInfo(platform: Platforms, channel_id: string) {
        const variables = {
            id: [channel_id],
            plat: [platform]
        }
        let configChannel = {
            query: IHAAPIV2_SCHEMAS,
            variables: variables,
            operationName: "VTuberChannel"
        }
        let configStream = {
            query: IHAAPIV2_SCHEMAS,
            variables: variables,
            operationName: "RecentStream"
        }
        const requestResults: AxiosResponse<VTuberResults>[] = await axios.all(
            [
                this.sesi({url: "graphql", method: "POST", data: configChannel}),
                // this.sesi({url: "graphql", method: "POST", data: configStream})
            ]
        )
        const channelRes: VTuberResults<ChannelResult> = requestResults[0].data;
        // const streamRes: VTuberResults<PastStreams> = requestResults[1].data;
        return [channelRes.data.vtuber.channels?.items[0], []]
    }
}
