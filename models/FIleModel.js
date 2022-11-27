import { model, Schema } from "mongoose";

//Модель файла которая будет в БД
const FileModel = new Schema({
    fileName: { type: String, require: true }
})

export default model("File", FileModel)
