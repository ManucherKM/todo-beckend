import JSZip from "jszip"
import fs from "fs"

import FileModel from "../models/FIleModel.js"
import TodoModel from "../models/TodoModel.js"
import { readFile, removeFile } from "../utils/FileAction.js"

/**
 * Весь функционал роутов для задач
 */
class TodoController {
    /**
     * Функция для получения задач из БД
     * @param {Object} req Входящие данные
     * @param {Object} res Наш ответ
     */
    async getAll(req, res) {
        try {
            //Получаем задачи из БД
            const todo = await TodoModel.find()
            //Отправляем их пользователю
            res.status(200).json(todo)
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: "Ошибка сервера"
            })
        }
    }

    /**
     * Функция для создания новой задачи
     * @param {Object} req Входящие данные
     * @param {Object} res Наш ответ
     */
    async newTodo(req, res) {
        try {
            //Достаем данные из запроса
            const { title, date, subtitle } = req.body;

            //Проверяем их на пустоту
            if (!title || !date || !subtitle) {
                return res.status(400).json({
                    message: "Неверные данные"
                })
            }

            //Достаем файлы из запроса
            const files = req.files;
            //Создаем переменную для задачи
            let todo = {};
            /*
            Если файлы не были указаны создаем обычную задачу
            в БД и отправляем ее пользователю
            */
            if (files.length === 0) {
                todo = await TodoModel.create({
                    title: title,
                    date: date,
                    subtitle: subtitle,
                })
                return res.status(200).json(todo)
            }

            //Если условие выше оказалось ложным - создаем экземпляр архива
            const zip = new JSZip();
            //Добавляем файлы пользователя в архив
            for (const item of files) {
                //Считываем файл который мы установили с помощью multer
                const fileValue = readFile(item.path)
                //И создаем такой же файл в архиве
                zip.file(item.filename, fileValue)
            }
            //Название архива для определенной задачи
            const archiveName = `${Date.now()}-${files[0].filename}.zip`

            zip
                .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                //Сохраняем архив на сервере
                .pipe(fs.createWriteStream("./upload/archive/" + archiveName))
            //Создаем в БД модель File с названием данного архива
            const archive = await FileModel.create({ fileName: archiveName })
            //Создаем саму задачу в БД с ссылкой на модель файла созданного выше 
            todo = await TodoModel.create({
                title: title,
                date: date,
                subtitle: subtitle,
                files: archive._id
            })
            //После того как мы создали архив - удаляем ненужные файлы
            for (const item of files) {
                removeFile("./upload/files/" + item.filename)
            }
            //И отправляем задачу пользователю
            res.status(200).json(todo)
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: "Ошибка сервера"
            })
        }
    }

    /**
     * Функция для скачивания файлов задачи
     * @param {Object} req Входящие данные
     * @param {Object} res Наш ответ
     */
    async downloadFiles(req, res) {
        try {
            //Достаем id из query параметров
            const { id } = req.params;
            //Если он не указан - отправляем пользователю сообщение с ошибкой
            if (id === undefined) {
                return res.status(400).json({
                    message: "Неверный id файла"
                })
            }
            //Получаем информацию о файле из БД
            const archive = await FileModel.findById({ _id: id })

            //Если БД нам ничего не вернула - отправляем пользователю сообщение с ошибкой
            if (!archive) {
                return res.status(400).json({
                    message: "Неверный id файла"
                })
            }
            //Если БД вернула нам информацию о файле -  указываем путь до этого файла
            const path = `./upload/archive/${archive.fileName}`
            //И отправляем его пользователю
            res.download(path, "Архив.zip")
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: "Ошибка сервера"
            })
        }
    }

    /**
     * Функция для удаления задачи
     * @param {Object} req Входящие данные
     * @param {Object} res Наш ответ
     */
    async removeTodo(req, res) {
        try {
            //Получаем id задачи
            const { id } = req.body;

            //Если id не был указан - отправляем пользователю сообщение с ошибкой
            if (id === undefined) {
                return res.status(400).json({
                    message: "Неверный id"
                })
            }

            //Если id был указан - пробуем найти задачу в БД
            const todo = await TodoModel.findById({ _id: id });

            //Если БД не нашла задачу - отправляем пользователю сообщение с ошибкой
            if (!todo) {
                return res.status(400).json({
                    message: "Неверный id"
                })
            }
            //Если к задаче не были прикреплены файлы - удаляем задачу только из БД
            if (todo.files === undefined) {
                await TodoModel.remove({ _id: id })
                return res.status(200).json({
                    message: "Успешно"
                })
            }

            //Если условие выше не отработало - достем из todo id файла
            const archiveId = todo.files;

            //Получаем информацию о фалйе из БД
            const archive = await FileModel.findById({ _id: archiveId })

            //Удаляем архив с файлами на сервере
            removeFile("./upload/archive/" + archive.fileName)

            //И также удаляем данные о файле и задаче в БД
            await FileModel.remove({ _id: archiveId })
            await TodoModel.remove({ _id: id })

            //Отправляем пользователю сообщение что все прошло успешно
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

    /**
     * Функция для смени состояния задчи (выполнена / не выполнена)
     * @param {Object} req Входящие данные
     * @param {Object} res Наш ответ
     */
    async completeTodo(req, res) {
        try {
            /*
                Достаем id и isCompleted из того что отправил нам пользователь.
                (isCompleted это состояние задачи если true - задача выполнена, если false - нет)
            */
            const { id, isCompleted } = req.body;

            //Проверяем id и isCompleted на пустоту
            if (!id || isCompleted === undefined) {
                return res.status(400).json({
                    message: "Неверные данные"
                })
            }

            //Получаем задачу из БД по id
            const todo = await TodoModel.findById({ _id: id })

            //Если БД не нашла задачу - отправляем пользователю сообщение с ошибкой
            if (!todo) {
                return res.status(400).json({
                    message: "Неверный id"
                })
            }

            //Если условие выше не отработало - обновляем задачу в БД
            const todoUpdate = await TodoModel.updateOne(
                {
                    _id: id
                },
                {
                    isCompleted: isCompleted
                }
            )

            //Если задачу не удалочь обовить - отправляем пользователю сообщение с ошибкой 
            if (!todoUpdate) {
                return res.status(400).json({
                    message: "Ошибка сервера"
                })
            }

            //Если задача обновилась - отправляем пользоваьелю сообщение что все хорошо
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