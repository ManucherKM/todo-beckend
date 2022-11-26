import { model, Schema } from "mongoose";

const FileModel = new Schema({
    fileName: { type: String, require: true }
})

export default model("File", FileModel)
