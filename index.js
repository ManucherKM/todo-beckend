import express from "express"
import mongoose from "mongoose"
import router from "./routes/Routes.js"
import cors from "cors"

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const PORT = process.env.PORT || 5000
app.use(cors())
app.use(express.json())
app.use("/", router)
app.use("/upload", express.static(path.join(__dirname, "/upload/files")))

const start = async () => {
    try {
        await mongoose.connect("mongodb+srv://admin:admin123@cluster0.pief8vg.mongodb.net/todo?retryWrites=true&w=majority")
            .then(() => console.log("БД успешно подключена"))
            .catch(() => console.log("Не удалось подключиться к БД"))
        app.listen(PORT, (e) => {
            if (e) {
                console.log("Сервер не запустился");
                return
            }
            console.log(`Сервер запустился на ${PORT} порту`)
        })
    } catch (e) {
        console.log(e);
    }
}
start()
