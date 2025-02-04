import express from 'express'
import cors from "cors";
import { registerserver } from './api_folder/loginpage.js';
import { dbconnection } from './connection/mongoose.js';
import { customerserver } from './api_folder/customerdata.js';
import { commserver } from './api_folder/communication.js';
import { fdandqyserver } from './api_folder/feedbackandquery.js';
import dotenv from "dotenv"
import passport from 'passport';
import session from "express-session";
import './passport/passportFile.js';
import jwt from "jsonwebtoken";
dotenv.config()
let server = express()
server.use(express.json())
server.use(cors({
    origin: process.env.FE_URL,
    credentials: true,
    methods: 'GET, POST,PUT,DELETE'
}))
server.set("trust proxy", 1)
server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: "auto",
        sameSite: "none",
    }
}))
server.use(passport.initialize());
server.use(passport.session());
let verifyAuthorization = (req, res, next) => {
    let token = req.headers["auth-token"]
    if (token) {
        jwt.verify(token, process.env.JWT_KEY, async (err, data) => {
            if (err) {
                res.status(403).json({ msg: "Unauthorized or Invalid Token" });
            } else {
                req.user = data.email.userdata
                next();
            }
        })
    } else {
        res.status(403).json({ msg: "Unauthorized" });
    }
}
let port = 7777
server.use("/", registerserver)
server.use("/", verifyAuthorization, customerserver)
server.use("/", verifyAuthorization, commserver)
server.use("/", verifyAuthorization, fdandqyserver)
await dbconnection();
server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})