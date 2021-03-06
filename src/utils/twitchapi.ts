import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import moment from "moment-timezone";
import { logger as MainLogger } from "./logger";
import { isNone } from "./toolbox";
import _ from "lodash";
import { resolveDelayCrawlerPromises } from "./toolbox";
import { Logger } from "winston";

interface AnyDict {
    [key: string]: any;
}

export class TwitchHelix {
    private cid: string
    private csc: string

    private nextReset: number
    private remainingBucket: number

    private session: AxiosInstance
    private authorized: boolean
    private bearer_token?: string
    private expires: number
    private logger: Logger

    BASE_URL: string
    OAUTH_URL: string

    constructor(client_id: string, client_secret: string) {
        this.bearer_token = undefined;
        this.expires = 0;
        this.cid = client_id;
        this.csc = client_secret;
        this.session = axios.create({
            headers: {"User-Agent": `vt-web/1.0.0 (https://github.com/noaione/vt-web)`}
        })
        this.authorized = false;

        this.BASE_URL = "https://api.twitch.tv/helix/";
        this.OAUTH_URL = "https://id.twitch.tv/oauth2/";

        this.nextReset = -1;
        this.remainingBucket = -1;

        this.session.interceptors.response.use(this.handleRateLimitResponse.bind(this), (error) => {
            return Promise.reject(error);
        })
        this.session.interceptors.request.use(this.handleRateLimitRequest.bind(this), (error) => {
            return Promise.reject(error);
        })
        this.logger = MainLogger.child({cls: "TwitchHelix"});
    }

    private delayBy(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private current() {
        return moment.tz("UTC").unix();
    }

    private async handleRateLimitRequest(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
        const logger = this.logger.child({fn: "handleRateLimit"});
        if (this.remainingBucket < 1 && this.remainingBucket !== -1) {
            let currentTime = moment.tz("UTC").unix();
            if (this.nextReset > currentTime) {
                logger.info(`currently rate limited, delaying by ${this.nextReset - currentTime} seconds`)
                await this.delayBy((this.nextReset - currentTime) * 1000);
            }
        }
        return config;
    }

    private handleRateLimitResponse(response: AxiosResponse<any>): AxiosResponse<any> | Promise<AxiosResponse<any>> {
        this.nextReset = parseInt(_.get(response.headers, "ratelimit-reset", this.nextReset));
        this.remainingBucket = parseInt(_.get(response.headers, "ratelimit-remaining", this.remainingBucket));
        return response;
    }

    // @ts-ignore
    private async getReq(url: string, params: AnyDict, headers: AnyDict = null) {
        let param_url = "";
        if (typeof params === "object" && Array.isArray(params)) {
            param_url = params.join("&");
        } else if (typeof params === "object") {
            let s_ = [];
            for (let [key, val] of Object.entries(params)) {
                s_.push(`${key}=${val}`);
            }
            param_url = s_.join("&");
        } else if (typeof params === "string") {
            param_url = params;
        }
        if (isNone(headers)) {
            let resp = await this.session.get(`${url}?${param_url}`);
            return resp.data;
        } else {
            let resp = await this.session.get(`${url}?${param_url}`, {
                headers: headers
            })
            return resp.data;
        }
    }

    // @ts-ignore
    private async postReq(url: string, params: AnyDict, headers: AnyDict = null) {
        if (isNone(headers)) {
            let resp = await this.session.post(url, null, {
                params: params
            })
            return resp.data;
        } else {
            let resp = await this.session.post(url, null, {
                params: params,
                headers: headers
            })
            return resp.data;   
        }
    }

    async expireToken() {
        const logger = this.logger.child({fn: "expireToken"});
        let params = {"client_id": this.cid, "token": this.bearer_token};
        if (this.authorized) {
            logger.info("de-authorizing...");
            await this.postReq(this.OAUTH_URL + "revoke", params);
            logger.info("de-authorized.");
            this.expires = 0;
            this.bearer_token = undefined;
            this.authorized = false;
        }
    }

    async authorizeClient() {
        const logger = this.logger.child({fn: "authorizeClient"});
        let params = {"client_id": this.cid, "client_secret": this.csc, "grant_type": "client_credentials"};
        logger.info("authorizing...");
        let res = await this.postReq(this.OAUTH_URL + "token", params);
        this.expires = this.current() + res["expires_in"];
        this.bearer_token = res["access_token"];
        logger.info("authorized.");
        this.authorized = true;
    }

    async fetchLivesData(usernames: string[]) {
        const logger = this.logger.child({fn: "fetchLivesData"});
        if (!this.authorized) {
            logger.warn("You're not authorized yet, requesting new bearer token...");
            await this.authorizeClient();
        }
        if (this.current() >= this.expires) {
            logger.warn("Token expired, rerequesting...");
            await this.authorizeClient();
        }

        let chunkedUsernames = _.chunk(usernames, 90);
        const headers = {
            "Authorization": `Bearer ${this.bearer_token}`,
            "Client-ID": this.cid
        }

        const chunkedPromises: Promise<any[]>[] = chunkedUsernames.map((username_sets, idx) => (
            this.getReq(this.BASE_URL + "streams", _.concat(["first=100"], _.map(username_sets, (o) => `user_login=${o}`)), headers)
            .then((results: any) => {
                return results["data"];
            }).catch((error: any) => {
                logger.error(`Failed to fetch chunk ${idx}, ${error.toString()}`);
                return [];
            })
        ))
        const chunkedPromisesDelayed = resolveDelayCrawlerPromises(chunkedPromises, 500);
        const returnedPromises = await Promise.all(chunkedPromisesDelayed);
        return _.flattenDeep(returnedPromises);
    }

    async fetchChannels(usernames: string[]) {
        const logger = this.logger.child({fn: "fetchChannels"});
        if (!this.authorized) {
            logger.warn("You're not authorized yet, requesting new bearer token...");
            await this.authorizeClient();
        }
        if (this.current() >= this.expires) {
            logger.warn("Token expired, rerequesting...");
            await this.authorizeClient();
        }

        const headers = {
            "Authorization": `Bearer ${this.bearer_token}`,
            "Client-ID": this.cid
        }
        let chunkedUsernames = _.chunk(usernames, 90);
        const chunkedPromises: Promise<any[]>[] = chunkedUsernames.map((username_sets, idx) => (
            this.getReq(this.BASE_URL + "users", _.map(username_sets, (o) => `login=${o}`), headers)
            .then((results: any) => {
                return results["data"];
            }).catch((error: any) => {
                logger.error(`Failed to fetch chunk ${idx}, ${error.toString()}`);
                return [];
            })
        ))
        const chunkedPromisesDelayed = resolveDelayCrawlerPromises(chunkedPromises, 500);
        const returnedPromises = await Promise.all(chunkedPromisesDelayed);
        return _.flattenDeep(returnedPromises);
    }

    async fetchChannelFollowers(user_id: string) {
        const logger = this.logger.child({fn: "fetchChannelFollowers"});
        if (!this.authorized) {
            logger.warn("You're not authorized yet, requesting new bearer token...");
            await this.authorizeClient();
        }
        if (this.current() >= this.expires) {
            logger.warn("Token expired, rerequesting...");
            await this.authorizeClient();
        }

        let headers = {
            "Authorization": `Bearer ${this.bearer_token}`,
            "Client-ID": this.cid
        }
        let params: string[] = [`to_id=${user_id}`];
        let res = await this.getReq(this.BASE_URL + "users/follows", params, headers);
        return res;
    }

    async fetchChannelVideos(user_id: string) {
        const logger = this.logger.child({fn: "fetchChannelVideos"});
        if (!this.authorized) {
            logger.warn("You're not authorized yet, requesting new bearer token...");
            await this.authorizeClient();
        }
        if (this.current() >= this.expires) {
            logger.warn("Token expired, rerequesting...");
            await this.authorizeClient();
        }

        let headers = {
            "Authorization": `Bearer ${this.bearer_token}`,
            "Client-Id": this.cid
        }
        let params_base: string[] = [`user_id=${user_id}`];
        let main_results = [];
        let res = await this.getReq(this.BASE_URL + "videos", [params_base[0], "first=50"], headers);
        main_results.push(res["data"]);
        if (Object.keys(res["pagination"]).length < 1) {
            return main_results;
        }
        if (_.has(res["pagination"], "cursor")) {
            if (isNone(res["pagination"]["cursor"]) || !res["pagination"]["cursor"]) {
                return main_results;
            }
        }
        let next_page = res["pagination"]["cursor"];
        if (isNone(next_page) || !next_page) {
            return main_results;
        }
        let doExit = false;
        while (!doExit) {
            let next_res = await this.getReq(this.BASE_URL + "videos", [params_base[0], `after=${next_page}`], headers);
            main_results.push(next_res["data"]);
            if (Object.keys(res["pagination"]).length < 1) {
                break;
            }
            if (_.has(res["pagination"], "cursor")) {
                if (isNone(res["pagination"]["cursor"]) || !res["pagination"]["cursor"]) {
                    doExit = true;
                    break;
                }
            }
            if (doExit) {
                break;
            }
            next_page = next_res["pagination"]["cursor"];
            if (isNone(next_page) || !next_page) {
                break;
            }
        }
        main_results = _.flattenDeep(main_results);
        return main_results;
    }
}
