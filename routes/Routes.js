import { Router } from "express";
import TodoController from "../controller/TodoController.js"
import FileMiddleware from "../middleware/UploadFile.js"

//Создаем новый экземпляр роутера
const router = new Router;

//Указываем роуты
router.get("/todos", TodoController.getAll)
router.put("/todos", TodoController.completeTodo)
router.post("/todos", FileMiddleware.array("files", 10), TodoController.newTodo)
router.post("/todo", TodoController.removeTodo)
router.get("/file/:id", TodoController.downloadFiles)

export default router