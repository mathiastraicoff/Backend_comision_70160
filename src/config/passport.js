import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/user.js";
import dotenv from "dotenv";

dotenv.config();

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

const jwtLogin = new JwtStrategy(jwtOptions, (jwt_payload, done) => {
    User.findById(jwt_payload.id, (err, user) => {
        if (err) return done(err, false);
        if (user) return done(null, user);
        return done(null, false);
    });
});

passport.use(jwtLogin);

export { passport };
