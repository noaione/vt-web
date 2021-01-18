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

AdminRoutes.post("/access", passport.authenticate("local", {failureRedirect: "/admin/access", failureFlash: true}), (req, res) => {
    res.redirect("/admin");
})

AdminRoutes.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
})

AdminRoutes.use(express.json());

// CRUD
AdminRoutes.post("/admin/add", ensureLoggedIn("/admin/access"), async (req, res, next) => {
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
    if (!["youtube", "twitch", "twitcasting"].includes(platform)) {
        return res.status(400).json({"success": 0, "error": `Unknown "${platform}" platform.`});
    }
    logger.info(`Request received, adding ${channelId} (${group}) to ${platform} data`);
})

export { AdminRoutes };