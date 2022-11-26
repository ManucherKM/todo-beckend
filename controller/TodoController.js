import JSZip from "jszip"
import fs from "fs"

import FileModel from "../models/FIleModel.js"
import TodoModel from "../models/TodoModel.js"
import { readFile, removeFile } from "../utils/FileAction.js"

class TodoController {
    async getAll(req, res) {
        try {
            const todo = await TodoModel.find()
            if (!todo) {
                return res.status(500).json({
                    message: "Ошибка сервера"
                })
            }
            res.status(200).json(todo)
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: "Ошибка сервера"
            })
        }
    }

    async newTodo(req, res) {
        try {
            const { title, date, subtitle } = req.body;

            if (!title || !date || !subtitle) {
                return res.status(400).json({
                    message: "Неверные данные"
                })
            }

            const files = req.files;
            let todo = {};

            if (files.length === 0) {
                todo = await TodoModel.create({
                    title: title,
                    date: date,
                    subtitle: subtitle,
                })
                return res.status(200).json(todo)
            }

            const zip = new JSZip();
            for (const item of files) {
                const fileValue = readFile(item.path)
                zip.file(item.filename, fileValue)
            }
            const archiveName = `${Date.now()}-${files[0].filename}.zip`
            zip
                .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(fs.createWriteStream("./upload/archive/" + archiveName))
            const archive = await FileModel.create({ fileName: archiveName })
            todo = await TodoModel.create({
                title: title,
                date: date,
                subtitle: subtitle,
                files: archive._id
            })

            for (const item of files) {
                removeFile("./upload/files/" + item.filename)
            }
            res.status(200).json(todo)
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: "Ошибка сервера"
            })
        }
    }

    async downloadFiles(req, res) {
        try {
            const { id } = req.params;
            if (id === undefined) {
                return res.status(400).json({
                    message: "Неверный id файла"
                })
            }

            const archive = await FileModel.findById({ _id: id })

            if (!archive) {
                return res.status(400).json({
                    message: "Неверный id файла"
                })
            }
            const path = `./upload/archive/${archive.fileName}`
            res.download(path, "Архив.zip")
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: "Ошибка сервера"
            })
        }
    }

    async removeTodo(req, res) {
        try {
            const { id } = req.body;
            if (id === undefined) {
                return res.status(400).json({
                    message: "Неверный id"
                })
            }

            const todo = await TodoModel.findById({ _id: id });

            if (!todo) {
                return res.status(400).json({
                    message: "Неверный id"
                })
            }
            if (todo.files === undefined) {
                await TodoModel.remove({ _id: id })
                return res.status(200).json({
                    message: "Успешно"
                })
            }
            const archiveId = todo.files;

            const archive = await FileModel.findById({ _id: archiveId })

            removeFile("./upload/archive/" + archive.fileName)

            await FileModel.remove({ _id: archiveId })
            await TodoModel.remove({ _id: id })

            res.status(200).json({
                message: "Успешно"
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: "Ошибка сервера"
            })
        }
    }

    async completeTodo(req, res) {
        try {
            const { id, isCompleted } = req.body;

            if (!id) {
                return res.status(400).json({
                    message: "Неверный id"
                })
            }

            const todo = await TodoModel.findById({ _id: id })

            if (!todo) {
                return res.status(400).json({
                    message: "Неверный id"
                })
            }

            const todoUpdate = await TodoModel.updateOne(
                {
                    _id: id
                },
                {
                    isCompleted: isCompleted
                }
            )

            if (!todoUpdate) {
                return res.status(400).json({
                    message: "Ошибка сервера"
                })
            }

            res.status(200).json({
                message: "Успешно"
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: "Ошибка сервера"
            })
        }
    }
}

export default new TodoController