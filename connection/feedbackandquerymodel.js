import { model, Schema } from "mongoose";

let feedbackdatamodel = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    number: { type: String, required: true },
    selecttype: { type: String, required: true },
    selecttype: { type: String, required: true },
    Content: { type: String, required: true },
    Date: { type: String, required: true },
    status: { type: String, required: false },
    remark: { type: String, required: false },
})
export let feedbackandquerymodel = new model("feedback and query", feedbackdatamodel)