import crypto from "crypto";
import passport from "passport"
import LocalStrategy from "passport-local"

function validatePassword(input) {
    const compareTo = process.env.HASHED_WEB_PASSWORD;
    const inputHashed = crypto.pbkdf2Sync(input, process.env.TOKEN_SECRET, 1000, 32, "sha512").toString("hex");
    return compareTo === inputHashed;
};

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(
    new LocalStrategy(
        (username, password, done) => {
            if (validatePassword(password)) {
                done(null, username);
            } else {
                done(null, null);
            }
        }
    )
)

export default passport
