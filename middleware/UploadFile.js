import multer from "multer";

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null,path.join(__dirname, "../upload/files"))
    },
    filename(req, file, callback) {
        callback(null, Date.now() + "-" + file.originalname)
    }
})

export default multer({ storage })