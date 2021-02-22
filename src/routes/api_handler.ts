import _ from "lodash";
import express from "express";
import moment from "moment-timezone";
import { ChannelStatsHistData, ChannelStatsHistProps } from "../utils/mongoose";
import { logger as TopLogger } from "../utils/logger";

const MainLogger = TopLogger.child({cls: "APIHandler"})
const APIRoutes = express.Router();
const ONE_WEEK = 604800;

APIRoutes.get("/history", async (req, res) => {
    const logger = MainLogger.child({fn: "history"})
    let queryParams = req.query;
    let platform = _.get(queryParams, "platform", undefined);
    let userId = _.get(queryParams, "id", undefined);

    if (typeof platform === "undefined" || typeof userId === "undefined") {
        return res.status(400).json({"code": 400, "message": "Bad format, missing platform or user ID"});
    }
    if (platform === "mildom") {
        return res.json({"data": {subs: [], views: []}});
    }

    let maxLookback = moment.tz("UTC").unix() - ONE_WEEK;

    logger.info(`Requesting user ${userId} on platform ${platform}`);
    let historyData: ChannelStatsHistProps = await ChannelStatsHistData.findOne({
        "id": {"$eq": userId},
        "platform": {"$eq": platform},
    });
    if (typeof historyData === "undefined" || historyData === null) {
        logger.warn(`Cannot find that user ${userId} on ${platform} database`);
        return res.status(404).json({"code": 404, "message": "cannot find user."});
    }
    logger.info(`Parsing data for user ${userId} on platform ${platform}`);
    historyData.history = historyData.history?.filter(res => res.timestamp >= maxLookback);
    let rawSubsData = historyData.history?.map((res) => {
        return {
            data: platform === "youtube" ? res.subscriberCount : res.followerCount,
            time: moment.unix(res.timestamp).format("MM/DD"),
        }
    });
    let rawViewsData;
    if (platform !== "twitcasting") {
        rawViewsData = historyData.history?.map((res) => {
            return {
                data: res.viewCount,
                time: moment.unix(res.timestamp).format("MM/DD"),
            }
        });
    } else {
        rawViewsData = [];
    }
    let groupedSubsData = _.groupBy(rawSubsData, "time");
    let groupedViewsData = _.groupBy(rawViewsData, "time");

    let formattedSubsData = [];
    for (let [key, data] of Object.entries(groupedSubsData)) {
        formattedSubsData.push({
            x: key,
            y: _.last(data)?.data,
        })
    }
    let formattedViewsData = [];
    if (platform !== "twitcasting") {
        // @ts-ignore
        for (let [key, data] of Object.entries(groupedViewsData)) {
            formattedViewsData.push({
                x: key,
                // @ts-ignore
                y: _.last(data)?.data,
            })
        }
    }
    let buildData = {data: {subs: formattedSubsData, views: formattedViewsData}, code: 200};
    res.json(buildData);
})

export { APIRoutes };