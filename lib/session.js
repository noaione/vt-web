import { withIronSession } from "next-iron-session";

export default function withSession(handler) {
    return withIronSession(handler, {
        password: process.env.TOKEN_SECRET,
        cookieName: "vtapi/iron",
        cookieOptions: {
            secure: process.env.NODE_ENV === "production" ? true : false,
        }
    })
}
