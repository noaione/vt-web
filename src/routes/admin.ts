import _ from "lodash";
import express from "express";
import passport from "passport";
import bodyparser from "body-parser";
import express_session from "express-session";
import csurf from "csurf";
import { ensureLoggedIn } from "connect-ensure-login";
import { Strategy as LocalStrategy } from "passport-local";
import { logger as TopLogger } from "../utils/logger";
import { generateCustomString, isNone } from "../utils/toolbox";
import { TwitchHelix } from "../utils/twitchapi";
import { youtubeChannelDataset, ttvChannelDataset, twcastChannelsDataset, mildomChannelsDataset, vtapiRemoveVTuber } from "../utils/vtadmin";
import { MildomAPI } from "../utils/mildomapi";

const MainLogger = TopLogger.child({cls: "Routes.AdminRoutes"});

const AdminRoutes = express.Router();
passport.use(new LocalStrategy({
    usernameField: "_token"
    },
    (user, password, done) => {
        if (password !== process.env.VTAPI_ADMIN_PASSWORD) {
            return done(null, false, { message: "Incorrect admin password." });
        }
        return done(null, user);
    }
));

var TTVAPI: TwitchHelix;
if (!isNone(process.env.TWITCH_API_CLIENT) && !isNone(process.env.TWITCH_API_SECRET)) {
    // @ts-ignore
    TTVAPI = new TwitchHelix(process.env.TWITCH_API_CLIENT, process.env.TWITCH_API_SECRET);
}

const MDAPI = new MildomAPI();

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (id, cb) {
    // @ts-ignore
    cb(null, id);
});

const csrfProtected = csurf();
AdminRoutes.use(bodyparser.urlencoded({extended: true}));

let superSecretKeys = generateCustomString(25, true, true);
AdminRoutes.use(express_session({secret: `vtuber_${superSecretKeys}`, name: "vtapi", resave: true, saveUninitialized: false}));
AdminRoutes.use(require("flash")());
AdminRoutes.use(passport.initialize());
AdminRoutes.use(passport.session());

AdminRoutes.get("/", ensureLoggedIn("/admin/access"), (_q, res) => {
    res.render("admin_dashboard");
});

AdminRoutes.get("/access", csrfProtected, (req, res) => {
    let err_msg = null;
    // @ts-ignore
    if (req.session.flash.length > 0) {
        // @ts-ignore
        err_msg = req.session.flash[0].message;
    }
    res.render("login_page", {
        ERROR_MSG: err_msg,
        CSRF_TOKEN: req.csrfToken()
    });
    // @ts-ignore
    if (req.session.flash.length > 0) {
        // @ts-ignore
        req.session.flash = [];
    }
})

AdminRoutes.post("/access", passport.authenticate("local", {failureRedirect: "/admin/access", failureFlash: true}), (_q, res) => {
    res.redirect("/admin");
})

AdminRoutes.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
})

AdminRoutes.use(express.json());

// CRUD
AdminRoutes.post("/admin/add", ensureLoggedIn("/admin/access"), async (req, res) => {
    const logger = MainLogger.child({fn: "AdminAdd"});
    let jsonBody = req.body;
    let channelId = _.get(jsonBody, "channel", undefined);
    let group = _.get(jsonBody, "group", undefined);
    let platform = _.get(jsonBody, "platform", undefined);
    let en_name = _.get(jsonBody, "en_name", undefined);
    if (isNone(channelId)) {
        return res.status(400).json({"success": 0, "error": "Missing Channel ID"});
    }
    if (isNone(platform)) {
        return res.status(400).json({"success": 0, "error": "Missing Platform"});
    }
    if (isNone(group)) {
        return res.status(400).json({"success": 0, "error": "Missing Group"});
    }
    if (isNone(en_name, true)) {
        return res.status(400).json({"success": 0, "error": "Missing Romanized Name"});
    }
    if (!["youtube", "twitch", "twitcasting", "mildom"].includes(platform)) {
        return res.status(400).json({"success": 0, "error": `Unknown "${platform}" platform.`});
    }
    logger.info(`Request received, adding ${channelId} (${group}) to ${platform} data`);
    try {
        // @ts-ignore
        let success, error;
        if (platform === "youtube") {
            [success, error] = await youtubeChannelDataset(channelId, group, en_name);
        } else if (platform === "twitch") {
            if (isNone(TTVAPI)) {
                success = false;
                error = "Web Admin doesn't give a Twitch API Information to use in the environment table."
            } else {
                [success, error] = await ttvChannelDataset(channelId, group, en_name, TTVAPI);
            }
        } else if (platform === "twitcasting") {
            [success, error] = await twcastChannelsDataset(channelId, group, en_name);
        } else if (platform === "mildom") {
            [success, error] = await mildomChannelsDataset(channelId, group, en_name, MDAPI);
        }
        res.json({"success": success ? 1 : 0, "error": error});
    } catch (error) {
        res.status(500).json({"success": 0, "error": error.toString()});
    }
})

AdminRoutes.post("/admin/delete", ensureLoggedIn("/admin/access"), async (req, res) => {
    const logger = MainLogger.child({fn: "AdminRemove"});
    let jsonBody = req.body;
    let channelId = _.get(jsonBody, "channel", undefined);
    let platform = _.get(jsonBody, "platform", undefined);
    if (isNone(channelId)) {
        return res.status(400).json({"success": 0, "error": "Missing Channel ID"});
    }
    if (isNone(platform)) {
        return res.status(400).json({"success": 0, "error": "Missing Platform"});
    }
    if (!["youtube", "twitch", "twitcasting", "mildom"].includes(platform)) {
        return res.status(400).json({"success": 0, "error": `Unknown "${platform}" platform.`});
    }
    try {
        // @ts-ignore
        logger.info(`Request received, removing ${channelId} from ${platform} data`);
        let [success, error] = await vtapiRemoveVTuber(channelId, platform);
        logger.info(`Request finished, ${channelId} from ${platform} data have been removed`);
        res.json({"success": success ? 1 : 0, "error": error});
    } catch (error) {
        res.status(500).json({"success": 0, "error": error.toString()});
    }
})

export { AdminRoutes };