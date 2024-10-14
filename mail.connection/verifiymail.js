import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config()
export let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.mail_name,
        pass: process.env.pass_key,
    },
});
export let mailobj = {
    "from": process.env.mail_name,
    "to": [],
    "subject": "Email Verification",
    "text": "Click on the below link to verify your account"
}