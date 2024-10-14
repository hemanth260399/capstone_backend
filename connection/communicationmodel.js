import { model, Schema } from "mongoose";

let comdatamodel = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    communicationMethod: { type: String, required: true },
    offer: { type: String, required: false },
    directmeet: { type: String, required: false },
    followupdate: { type: String, required: true },
    content: { type: String, required: true },
    discountproduct: { type: String, required: false },
    couponvalue: { type: String, required: false },
    Date: { type: String, required: true }
})
export let commodel = new model("communication", comdatamodel, "communication")