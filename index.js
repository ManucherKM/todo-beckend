import express from "express"
import mongoose from "mongoose"
import router from "./routes/Routes.js"
import cors from "cors"
import path from 'path';

//__dirname с синтаксисом ES6
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Создаем приложение express
const app = express()
//Указываем порт, если он не указан в переменных окружения указываем 5000
const PORT = process.env.PORT || 5000

//Устанавливаем доролнительные настройки
app.use(cors())
app.use(express.json())
app.use("/", router)
app.use("/upload", express.static(path.join(__dirname, "/upload/files")))

/**
 * Функция для запуска сервера
 */
const start = async () => {
    try {
        //Подключаем БД
        await mongoose.connect("mongodb+srv://admin:admin123@cluster0.pief8vg.mongodb.net/todo?retryWrites=true&w=majority")
            .then(() => console.log("БД успешно подключена"))
            .catch(() => console.log("Не удалось подключиться к БД"))
        //Запускаем сервер
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
