
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
    "solovtuber": "Solo/Indie",
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

export async function ihaAPIQuery(gqlSchemas, cursor = "") {
    let apiRes = await fetch("https://api.ihateani.me/v2/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            query: gqlSchemas,
            variables: {
                cursor: cursor
            }
        })
    }).then((res) => res.json());
    return apiRes;
}
