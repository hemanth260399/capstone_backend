import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import passport from 'passport';
import { registermodel } from '../connection/registermodel.js';
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK,
}, async function (accessToken, refreshToken, profile, done) {
    try {
        let user = await registermodel.findOne({ email: profile.emails[0].value });
        if (user) {
            return done(null, { userdata: user });
        } else {
            let data = new registermodel({
                id: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                type: "google",
                isverified: true,
            })
            await data.save()
            return done(null, { userdata: user });
        }
    } catch (err) {
        return done(err, null);
    }
}));
passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK,
}, async function (accessToken, refreshToken, profile, done) {
    try {
        let user = await registermodel.findOne({ id: profile.nodeId });
        if (user) {
            return done(null, { userdata: user });
        } else {
            let data = new registermodel({
                id: profile.nodeId,
                name: profile.displayName,
                userName: profile.username,
                type: "github",
            })
            await data.save()
            return done(null, { userdata: user });
        }
    } catch (err) {
        return done(err, null);
    }
}));
passport.serializeUser((user, done) => {
    return done(null, user);
});

passport.deserializeUser((user, done) => {
    return done(null, user);
});

