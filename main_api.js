import express from 'express'
import cors from "cors";
import { registerserver } from './api_folder/loginpage.js';
import { dbconnection } from './connection/mongoose.js';
import { customerserver } from './api_folder/customerdata.js';
import { commserver } from './api_folder/communication.js';
import jwt from "jsonwebtoken";
import { fdandqyserver } from './api_folder/feedbackandquery.js';
import dotenv from "dotenv"
dotenv.config()
let server = express()
server.use(express.json())
server.use(cors())
let verifyAuthorization = (req, res, next) => {
    let token = req.headers["auth-token"]
    if (token) {
        jwt.verify(token, process.env.JWT_KEY, (err) => {
            if (err) {
                console.log(err);
                res.status(403).json({ msg: "Unauthorized or Invalid Token" });
            } else {
                next();
            }
        });
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