import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import * as Routes from "./routes";
import express_compression from "compression";
import { altairExpress } from "altair-express-middleware";
import { expressErrorLogger, expressLogger, logger } from "./utils/logger";
import { capitalizeIt } from "./utils/toolbox";

let mongouri = process.env.MONGODB_URI;
if (typeof mongouri === "string" && mongouri.endsWith("/")) {
    mongouri = mongouri.slice(0, -1);
}

let MONGO_VERSIONING = {
    "type": "Unknown",
    "version": "X.XX.XX",
};

logger.info("Connecting to database...");
mongoose.connect(`${mongouri}/${process.env.MONGODB_DBNAME}`, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

mongoose.connection.on("open", () => {
    logger.info("Connected to VTubers Database!");
    let admin = mongoose.connection.db.admin();
    admin.serverInfo((err, info) => {
        MONGO_VERSIONING["version"] = info.version;
        let modules = info.modules;
        if (modules.length > 0) {
            MONGO_VERSIONING["type"] = modules[0];
            MONGO_VERSIONING["type"] = capitalizeIt(MONGO_VERSIONING["type"]);
        } else {
            MONGO_VERSIONING["type"] = "Community";
        }
    })
})

dotenv.config();
const app = express();

app.use(expressLogger);
app.use(express_compression());

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs");

app.use("/", Routes.UserRoutes);
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/admin", Routes.AdminRoutes);

let initialQuery = `query VTuberLives {
    vtuber {
        live {
            _total
            items {
                id
                title
                thumbnail
                platform
                group
            }
            pageInfo {
                nextCursor
                hasNextPage
            }
        }
    }
}
`

app.use("/playground", altairExpress({
    endpointURL: "https://api.ihateani.me/v2/graphql",
    initialQuery: initialQuery,
}))

app.use(expressErrorLogger);

app.use(function (req, res, next) {
    let current_utc = Date.now();
    res.status(404).json({"time": current_utc, "status": 404, "message": `path '${req.path}' not found.`});
});

const listener = app.listen(7200, () => {
    console.log("🚀 Server is up and running!");
    // @ts-ignore
    console.log("http://127.0.0.1:" + listener.address().port + "\n");
})
