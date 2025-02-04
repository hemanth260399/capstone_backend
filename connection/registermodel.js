import { model, Schema } from "mongoose";

let registerdatamodel = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: false },
    email: { type: String, required: false },
    role: { type: String, required: true, default: 'staff' },
    password: { type: String, required: false },
    passcode_change: { type: String, required: false },
    isverified: { type: Boolean, required: false },
    type: { type: String, required: false },
    userName: { type: String, required: false }
})
export let registermodel = new model("user", registerdatamodel, "user")