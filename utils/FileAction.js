import fs from "fs"

export function removeFile(path) {
    return fs.unlink(path, (err) => {
        if (err) {
            console.log("Не удалось удалить файл\n\n", err);
        }
    });
}

export function readFile(path, charest) {
    return fs.readFileSync(path, charest)
}