import dotenv from "dotenv";
import express from "express";
import path from "path";
import * as Routes from "./routes";
import express_compression from "compression";
import { altairExpress } from "altair-express-middleware";
import { expressErrorLogger, expressLogger } from "./utils/logger";

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
