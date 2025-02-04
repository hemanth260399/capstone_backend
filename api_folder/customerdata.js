import { v4 } from "uuid"
import { customermodel } from "../connection/customerdatamodel.js"
import express from "express"
import mongoose from "mongoose"
import { commodel } from "../connection/communicationmodel.js"
export let customerserver = express.Router()
//Post call to add the new customer in the customer database
customerserver.post("/newcustomer", async (req, res) => {
    let data = req.body
    let newcustomer = []
    let excustomer = await customermodel.findOne({ email: data.email })
    if (excustomer) {
        return res.status(400).json({ msg: "customer already exists" })
    } else {
        newcustomer = new customermodel({
            ...data,
            id: v4(),
            created_date: new Date().toISOString().slice(0, 10)
        })
    }
    let startdate = Date.parse(newcustomer.date)
    let enddate = Date.parse(newcustomer.created_date)
    let differenceMonths = Math.floor((enddate - startdate) / (1000 * 60 * 60 * 24 * 30))
    if (differenceMonths > 6) {
        newcustomer.active = "Inactive"
    } else {
        newcustomer.active = "Active"
    }
    try {
        await newcustomer.save()
        res.json({ msg: "Customer data added succesfully" })
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ msg: "Sorry some field are missing" })
        } else {
            res.status(500).json({ msg: "Internal server error" })
        }
    }
})
//Get call to get all customer details from the db
customerserver.get("/customerdetail", async (req, res) => {
    let data = await customermodel.find({}).exec()
    if (data) {
        res.json(data)
    } else {
        res.status(404).json({ msg: "No data found" })
    }
})
//Get call to get single customer details
customerserver.get("/customerdata", async (req, res) => {
    let { id } = req.query
    let data = await customermodel.findOne({ id: id })
    if (data) {
        res.json(data)
    } else {
        res.status(404).json({ msg: "No data found" })
    }
})
//Delete method to delete the customer form db
customerserver.delete("/customerdata", async (req, res) => {
    let { id } = req.query
    try {
        await customermodel.deleteOne({ id: id })
        res.json({ msg: "Customer data deleted successfully" })
    } catch (err) {
        res.status(500).json({ msg: "Internal server error" })
    }
})
//patch call to update the customer data in the db
customerserver.put("/newcustomeredit", async (req, res) => {
    let { id } = req.query
    let data = req.body
    data = { ...data, created_date: new Date().toISOString().slice(0, 10) }
    let startdate = Date.parse(data.date)
    let enddate = Date.parse(data.created_date)
    let differenceMonths = Math.floor((enddate - startdate) / (1000 * 60 * 60 * 24 * 30))
    if (differenceMonths > 6) {
        data.active = "Inactive"
    } else {
        data.active = "Active"
    }
    try {
        await customermodel.updateOne({ id: id }, { $set: data })
        res.json({ msg: "Customer data updated successfully" })
    } catch (err) {
        res.status(500).json({ msg: "Internal server error" })
    }
})
//Get call to get both customer db and communiation db
customerserver.get("/userpage", async (req, res) => {
    let cusdata = await customermodel.find({}).exec()
    let comdata = await commodel.find({}).exec()
    if (cusdata && comdata) {
        res.json({ customer: cusdata, communication: comdata })
    } else {
        res.status(404).json({ msg: "No data found" })
    }
})