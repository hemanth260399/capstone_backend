import { model, Schema } from "mongoose";

let customerdatamodel = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    number: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: String, required: true },
    address: { type: String, required: true },
    purchase_history: { type: String, required: false },
    purchase_value: { type: Number, required: true },
    purchase_count: { type: Number, required: true },
    created_date: { type: String, required: true },
    active: { type: String, required: true }
})
export let customermodel = new model("customer", customerdatamodel, "customer")