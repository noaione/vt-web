import { NextApiResponse } from "next";

import crypto from "crypto";
import withSession, { NextApiRequestWithSession } from "../../lib/session";

function validatePassword(input: string) {
    if (typeof input !== "string") return false;
    const compareTo = process.env.HASHED_WEB_PASSWORD;
    const inputHashed = crypto
        .pbkdf2Sync(input, process.env.TOKEN_SECRET, 1000, 32, "sha512")
        .toString("hex");
    return compareTo === inputHashed;
}

export default withSession(async (req: NextApiRequestWithSession, res: NextApiResponse) => {
    const { username, password } = await req.body;

    if (validatePassword(password)) {
        const user = { isLoggedIn: true, user: username };
        req.session.set("user", user);
        await req.session.save();
        res.json(user);
    } else {
        res.status(401).json({ error: "wrong password" });
    }
});
