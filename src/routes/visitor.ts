import express from "express";

const UserRoutes = express.Router();

UserRoutes.get("/", (_, res) => {
    res.render("index");
})
UserRoutes.get("/live", (_, res) => {
    res.redirect(302, "/lives");
})
UserRoutes.get("/lives", (_, res) => {
    res.render("lives");
})
UserRoutes.get("/schedule", (_, res) => {
    res.redirect(302, "/schedules");
})
UserRoutes.get("/schedules", (_, res) => {
    res.render("schedules");
})
UserRoutes.get("/setting", (_, res) => {
    res.redirect(302, "/settings");
})
UserRoutes.get("/settings", (_, res) => {
    res.render("settings");
})

export { UserRoutes };
