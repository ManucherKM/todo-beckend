import fs from "fs"

/**
 * Функция для удаления файла
 * @param {string} path Путь до удаляемого файла
 */
export function removeFile(path) {
    fs.unlink(path, (err) => {
        if (err) {
            console.log("Не удалось удалить файл\n\n", err);
        }
    });
}

/**
 * Функция для чтения файла
 * @param {string} path Путь до читаемого файла
 * @param {string} charest Кодировка
 * @returns {string | Buffer} Результат чтения файла
 */
export function readFile(path, charest = null) {
    return fs.readFileSync(path, charest)
}