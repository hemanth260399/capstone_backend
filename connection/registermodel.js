import { model, Schema } from "mongoose";

let registerdatamodel = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    password: { type: String, required: true },
    passcode_change: { type: String, required: false },
    isverified: { type: Boolean, required: true },
})
export let registermodel = new model("user", registerdatamodel, "user")