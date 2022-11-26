import { Router } from "express";
import TodoController from "../controller/TodoController.js"
import FileMiddleware from "../middleware/UploadFile.js"

const router = new Router;

router.get("/todos", TodoController.getAll)
router.post("/todos", FileMiddleware.array("files", 10), TodoController.newTodo)
router.post("/todo", TodoController.removeTodo)
router.put("/todos", TodoController.completeTodo)
router.get("/file/:id", TodoController.downloadFiles)

export default router