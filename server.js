const express = require("express");
const next = require("next");

const port = 6520;
const dev = process.env.NODE_ENV !== "production";
const app = next({dev});
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    server.get("/", (req, res) => {
        return app.render(req, res, "/index", req.query);
    });

    server.get("/lives", (req, res) => {
        return app.render(req, res, "/lives", req.query);
    });

    server.get("/schedules", (req, res) => {
        return app.render(req, res, "/schedules", req.query);
    });

    server.get("/settings", (req, res) => {
        return app.render(req, res, "/settings", req.query);
    });

    server.get("/admin", (req, res) => {
        return app.render(req, res, "/admin", req.query);
    });

    server.get("/login", (req, res) => {
        return app.render(req, res, "/login", req.query);
    });

    server.get("/channel/:chid", (req, res) => {
        const mergedQuery = {...req.params, ...req.query}
        return app.render(req, res, "/channel/[chid]", mergedQuery);
    });

    server.all("*", (req, res) => {
        return handle(req, res);
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.info(`> Now running express server + Next.js at: http://localhost:${port}`);
    })
})