import express from "express";
import { commodel } from "../connection/communicationmodel.js";
import { v4 } from "uuid";
import { mailobj, transporter } from "../mail.connection/verifiymail.js";
import mongoose from "mongoose";
import { customermodel } from "../connection/customerdatamodel.js";
export let commserver = express.Router()
import dotenv from "dotenv";
import { registermodel } from "../connection/registermodel.js";
dotenv.config()
//Post method to add the new communictaion 
commserver.post("/addcommunication", async (req, res) => {
    let data = req.body
    let cusdata = await registermodel.findOne({ email: data.email })
    if (!cusdata) {
        return res.status(404).json({ msg: "Customer not found" })
    }
    let nordata = new Date()
    let fordate = nordata.toLocaleDateString("en-IN", { day: "2-digit", month: "numeric", year: "numeric" })
    let todaydate = fordate.split("/").reverse().join("-")
    let newcommunication = new commodel({
        ...data,
        id: v4(),
        Date: todaydate
    })
    if (data.communicationMethod == "Email") {
        let maildata = ""
        let link = `${process.env.FE_URL}/addfeedback`
        if (data.offer == "Gift") {
            maildata = `You won the speical gift from our side you can collect in our office /n If you have any query and feedback you can submit in this link ${link}`
            newcommunication.discountproduct = "Gift Product"
        }
        else if (data.offer == "Voucher") {
            if (cusdata.active == "Inactive") {
                let vouchercode = v4()
                newcommunication.discountproduct = vouchercode
                newcommunication.couponvalue = "Rs.3000"
                maildata = `You Got a Rs.3000 Voucher to get back to us we are waiting for your comeback Voucher Code : ${vouchercode} /n If you have any query and feedback you can submit in this link ${link}`
            } else {
                let vouchercode = v4()
                newcommunication.discountproduct = vouchercode
                newcommunication.couponvalue = "Rs.1500"
                maildata = `You won the special Voucher for Rs.1500 discount to get more product with your money Voucher Code : ${vouchercode} /n If you have any query and feedback you can submit in this link ${link}`
            }
        } else {
            if (cusdata.active == "Inactive") {
                let couponcode = v4()
                newcommunication.discountproduct = couponcode
                newcommunication.couponvalue = "50%"
                maildata = `You Got a flat 50% discount to get back to us we are waiting for your comeback Coupon Code : ${couponcode} /n If you have any query and feedback you can submit in this link ${link}`
            } else {
                let couponcode = v4()
                newcommunication.discountproduct = couponcode
                newcommunication.couponvalue = "30%"
                maildata = `You won the special Coupon for flat 30% discount to get more product with your money Coupon Code : ${couponcode} /n If you have any query and feedback you can submit in this link ${link}`
            }
        }
        await transporter.sendMail({
            ...mailobj,
            to: data.email,
            subject: `Reward Communication`,
            text: `${maildata}`
        })
    }
    try {
        await newcommunication.save()
        res.json({ msg: "Customer data added succesfully" })
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ msg: "Sorry some field are missing" })
        } else {
            res.status(500).json({ msg: "Internal server error" })
        }
    }
})
//Get method to get the communictaion details of the customer
commserver.get("/allcommunication", async (req, res) => {
    let data = await commodel.find({}).exec()
    if (data) {
        res.json(data)
    } else {
        res.status(404).json({ msg: "No data found" })
    }
})
//In this Delete method commuincation data will delete
commserver.delete("/allcommunication", async (req, res) => {
    let { id } = req.query
    try {
        await commodel.deleteOne({ id: id })
        res.json({ msg: "Communication data deleted successfully" })
    } catch (err) {
        res.status(500).json({ msg: "Internal server error" })
    }
})