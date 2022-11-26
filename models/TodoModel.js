import { model, Schema } from "mongoose";

const TodoModel = new Schema({
    title: { type: String, require: true },
    date: { type: String, require: true },
    subtitle: { type: String, require: true },
    isCompleted: { type: Boolean, default: false },
    files: { type: Schema.Types.ObjectId, ref: "File" },
})

export default model("Todo", TodoModel)