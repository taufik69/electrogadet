import multer from "multer"

/** Where multer stages uploaded files before the worker reads and uploads them. */
export const UPLOAD_TMP_DIR = "tmp/uploads"

/**
 * disk storage, not memory: the worker (a separate process) reads the file by
 * path, and localPath is persisted on the Image row for retry after a crash.
 *
 * Lives in shared/ rather than the image module because more than one module
 * mounts it — the article module accepts a cover upload on its own route
 * (PUT /api/articles/:id/cover), and importing sideways between modules is
 * forbidden by ARCHITECTURE.md §5.
 */
export const uploadImageFile = multer({ dest: UPLOAD_TMP_DIR }).single("file")
