import express from "express"
import bcrypt from "bcrypt";
import { registermodel } from "../connection/registermodel.js";
import { transporter, mailobj } from "../mail.connection/verifiymail.js";
import { jwttoken } from "../mail.connection/jwt_token.js";
import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import dotenv from "dotenv"
import passport from "passport";
export let registerserver = express.Router()
dotenv.config()
//Post call to register the staff data
registerserver.post("/register", async (req, res) => {
    let data = req.body
    let userfind = await registermodel.findOne({ email: data.email })
    if (userfind) {
        return res.status(400).json({ msg: "user already exists" })
    }
    else {
        let userdata = new registermodel({
            ...data,
            id: v4(),
            passcode_change: "",
            isverified: false
        })
        let token = jwttoken({ email: userdata.email }, "1d")
        let link = ` ${process.env.FE_URL}/register-verify-email?token=${token}`
        await transporter.sendMail({
            ...mailobj,
            to: userdata.email,
            subject: "Email Verification",
            text: `Click on the link below to verify your email address: ${link}`
        })
        bcrypt.hash(userdata.password, 10, async (err, hashdata) => {
            try {
                userdata.password = hashdata
                try {
                    await userdata.save()
                    res.json({ msg: "User added succesfully" })
                } catch {
                    if (err instanceof mongoose.Error.ValidationError) {
                        res.status(400).json({ msg: "Sorry some field are missing" })
                    } else {
                        res.status(500).json({ msg: "Internal server error" })
                    }
                }
            } catch (err) {
                return res.status(500).json({ msg: "Internal server error" })
            }
        })
    }
})
//Post call to send the verify mail of the customer
registerserver.post("/register-verify-email", (req, res) => {
    let { token } = req.query;
    jwt.verify(token, process.env.JWT_KEY, async (err, data) => {
        if (err) {
            res
                .status(400)
                .json({ msg: "Link Seems To Be Expired, Please try again" });
        }
        let { email } = data;
        await registermodel.updateOne({ email: email }, { $set: { isverified: true } },)
        res.json({ msg: "User verified successfully" });
    });
})
//Post call to get the data to verify the data avialble in the db or not
registerserver.post("/login", async (req, res) => {
    let { email, password } = req.body
    try {
        let userfind = await registermodel.findOne({ email })
        let token = jwttoken({ email: userfind.email }, "1d")
        if (userfind) {
            if (userfind.isverified) {
                bcrypt.compare(password, userfind.password, (err, data) => {
                    if (data) {
                        delete userfind.password
                        res.json({ msg: `Successfully logged in ${userfind.name}`, staffdetails: userfind, token })
                    }
                    else if (err) {
                        res.status(400).json({ msg: "Something went wrong" })
                    }
                    else {
                        res.status(404).json({ msg: "Invalid credentials" })
                    }
                })
            } else {
                res.status(404).json({ msg: "Email not verified" })
            }
        }
        else {
            res.status(404).json({ msg: "User not found" })
        }
    } catch (e) {
        res.status(500).json({ msg: "User not found" })
    }
})
//Post call to get email and send the forget password mail to change the password
registerserver.post('/forgetpassword', async (req, res) => {
    let { email } = req.body
    let emailfind = await registermodel.findOne({ email: email })
    if (emailfind) {
        let tempdata = v4()
        await registermodel.updateOne({ email: emailfind.email }, { $set: { passcode_change: tempdata } })
        let currentuser = await registermodel.findOne({ email: emailfind.email })
        let token = jwttoken({ passcode: currentuser.passcode_change }, "1d")
        await transporter.sendMail({
            ...mailobj,
            to: currentuser.email,
            subject: "Password Recovery",
            text: `Click on the link below to reset your password: ${process.env.FE_URL}/changepassword?token=${token}`
        })
        res.json({ msg: 'Password recovery mail sent succesfully' })
    } else {
        res.status(404).json({ msg: "User not found" })
    }
})
//Post call to change the old password and update the new password
registerserver.post("/changepassword", (req, res) => {
    let { token } = req.query
    let password = req.body
    jwt.verify(token, process.env.JWT_KEY, async (err, data) => {
        let user = await registermodel.findOne({ passcode_change: data.passcode })
        console.log(data)
        if (user) {
            if (err) {
                res.status(400).json({ msg: "Sorry Link is expired" })
            }
            else {
                bcrypt.hash(password.password, 10, async (err, hashdata) => {
                    if (err) {
                        res.status(500).json({ msg: "Internal server error" })
                    }
                    else {
                        console.log(data.passcode)
                        await registermodel.updateOne({ passcode_change: data.passcode }, { $set: { password: hashdata } })
                        await registermodel.updateOne({ passcode_change: data.passcode }, { $set: { passcode_change: "" } })
                        res.json({ msg: "Password changed succesfully" })
                    }
                })
            }
        }
        else {
            res.status(400).json({ msg: "Sorry link already used" })
        }
    })
})
registerserver.get('/auth/google', passport.authenticate('google', { scope: ["profile", "email"] }));

registerserver.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: `${process.env.FE_URL}/auth/loginSuccess`,
        failureRedirect: '/auth/login/failure'
    }));

registerserver.get('/auth/github', passport.authenticate('github', { scope: ["profile"] }));

registerserver.get('/auth/github/callback',
    passport.authenticate('github', {
        successRedirect: `${process.env.FE_URL}/auth/loginSuccess`,
        failureRedirect: '/auth/login/failure'
    }));
registerserver.get("/auth/login/failure", (req, res) => {
    res.status(401).json({
        success: false,
        msg: "failure"
    })
})
registerserver.get("/auth/loginSuccess", (req, res) => {
    if (req.user) {
        let jwt_token = jwttoken({ email: req.user }, "1d")
        res.status(200).json({
            success: true,
            msg: "success",
            user: req.user,
            token: jwt_token
        })
    } else {
        res.status(401).json({ msg: "Something went wrong" })
    }
})