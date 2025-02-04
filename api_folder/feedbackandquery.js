import { v4 } from "uuid"
import express from "express"
import { feedbackandquerymodel } from "../connection/feedbackandquerymodel.js"
import mongoose from "mongoose"
import { customermodel } from "../connection/customerdatamodel.js"
export let fdandqyserver = express.Router()
//Post call to post the new feedback or query in the database
fdandqyserver.post("/addfeedback", async (req, res) => {
    let data = req.body
    let cusdata = await customermodel.find({ email: data.email })
    if (!cusdata.length) {
        res.status(404).json({ msg: "Please Enter valid Email" })
    }
    let nordata = new Date()
    let fordate = nordata.toLocaleDateString("en-IN", { day: "2-digit", month: "numeric", year: "numeric" })
    let todaydate = fordate.split("/").reverse().join("-")
    let newdata = new feedbackandquerymodel({
        ...data,
        id: v4(),
        Date: todaydate,
        name: cusdata[0].name || "",
        number: cusdata[0].number,
    })
    if (data.selecttype === "query") {
        newdata.status = "Pending"
    }
    try {
        await newdata.save()
        res.json({ msg: "Feedback and query added successfully" })
    } catch (e) {
        if (e instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ msg: "Please fill all required fields" })
        } else {
            res.status(500).json({ msg: "Internal server error" })
        }
    }
})
//Get call to fetch all the feedback data from the database
fdandqyserver.get("/allfeedback", async (req, res) => {
    let data = await feedbackandquerymodel.find({ selecttype: "feedback" }).exec()
    if (data) {
        res.json(data)
    } else {
        res.status(404).json({ msg: "No data found" })
    }
})
//Post call to filter the status of the database like All,Resolve,Reject,Pending
fdandqyserver.post("/allqueries", async (req, res) => {
    let fdata = req.body
    let data = []
    if (fdata.filter === "All") {
        data = await feedbackandquerymodel.find({ selecttype: "query" }).exec()
    } else {
        data = await feedbackandquerymodel.find({ selecttype: "query", status: fdata.filter }).exec()
    }
    if (data) {
        res.json(data)
    } else {
        res.status(404).json({ msg: "No data found" })
    }
})
//Patch call to set the customer query to resolve or reject and mention the remarks
fdandqyserver.patch("/allqueries", async (req, res) => {
    let { id } = req.query
    let updatedata = req.body
    console.log(updatedata)
    try {
        await feedbackandquerymodel.updateOne({ id: id }, { $set: { status: updatedata.status, remark: updatedata.remark } })
        res.json({ msg: "Updated" })
    } catch (e) {
        res.status(500).json({ msg: "Internal Server Error" })
    }
})