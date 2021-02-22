import _ from "lodash";
import express from "express";
import { GROUPS_NAME_MAP, ihaAPIv2, Platforms } from "../utils/ihaapi";
import { capitalizeIt } from "../utils/toolbox";

const UserRoutes = express.Router();
const ihaAPI = new ihaAPIv2();

UserRoutes.get("/", (_, res) => {
    res.render("index");
});
UserRoutes.get("/live", (_, res) => {
    res.redirect(302, "/lives");
});
UserRoutes.get("/lives", (_, res) => {
    res.render("lives");
});
UserRoutes.get("/schedule", (_, res) => {
    res.redirect(302, "/schedules");
});
UserRoutes.get("/schedules", (_, res) => {
    res.render("schedules");
});
UserRoutes.get("/setting", (_, res) => {
    res.redirect(302, "/settings");
});
UserRoutes.get("/settings", (_, res) => {
    res.render("settings");
});

const UUIDMap = {
    "yt": "youtube",
    "ttv": "twitch",
    "tw": "twitcasting",
    "md": "mildom",
    "b2": "bilibili"
}

const RingColorMap = {
    "yt": "border-danger",
    "ttv": "border-twitch",
    "tw": "border-twcast",
    "md": "border-mildom",
    "b2": "border-bili2",
}

const IconMap = {
    "yt": "youtube_icon",
    "ttv": "twitch_icon",
    "tw": "twitcasting_icon",
    "md": "mildom_sicon",
    "b2": "bilibili_icon",
}

// Extras
UserRoutes.get("/channel/:uuid", async (req, res) => {
    let rawUuid = _.get(req.params, "uuid", undefined);
    if (typeof rawUuid !== "string") {
        res.status(404).render("404_page", {path: req.path});
    } else {
        let splitData = rawUuid.split("-");
        if (splitData.length < 2) {
            return res.status(404).render("404_page", {path: req.path});
        }
        let platform = splitData[0];
        if (!["yt", "ttv", "tw", "md", "b2"].includes(platform.toLowerCase())) {
            res.status(404).render("404_page", {path: req.path});
        } else {
            let uuid = splitData.slice(1).join("-");
            let [channelInfo, oldStreams] = await ihaAPI.channelInfo(UUIDMap[platform as keyof typeof UUIDMap] as Platforms, uuid);
            if (typeof channelInfo === "undefined") {
                return res.status(404).render("404_page", {path: req.path});
            }
            res.render(
                "channel_page", {
                    gql_data: channelInfo,
                    streams: oldStreams,
                    // @ts-ignore
                    group_orgs: GROUPS_NAME_MAP[channelInfo.group] || capitalizeIt(channelInfo.group),
                    // @ts-ignore
                    ring_color: RingColorMap[platform] || "",
                    // @ts-ignore
                    icon_name: IconMap[platform] + " " || ""
                }
            );
        }
    }
})

export { UserRoutes };
