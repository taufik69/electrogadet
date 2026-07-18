import multer from "multer"
import { UPLOAD_TMP_DIR } from "./image.constant.js"

// disk storage, not memory: the worker (a separate process) reads the file by
// path, and localPath is persisted on the Image row for retry after a crash.
export const uploadImageFile = multer({ dest: UPLOAD_TMP_DIR }).single("file")
