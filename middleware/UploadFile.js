import multer from "multer";

//__dirname с синтаксисом ES6
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Указываем название файлов и путь по которому они будут сохраняться
const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, path.join(__dirname, "../upload/files"))
    },
    filename(req, file, callback) {
        callback(null, Date.now() + "-" + file.originalname)
    }
})

export default multer({ storage })