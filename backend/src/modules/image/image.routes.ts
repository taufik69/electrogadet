import { Router } from "express"
import { imageController } from "./image.controller.js"
import { uploadImageFile } from "./image.middleware.js"

export const imageRouter = Router()

imageRouter.patch("/reorder", imageController.reorder)
imageRouter.get("/", imageController.list)
imageRouter.post("/", uploadImageFile, imageController.create)
imageRouter.patch("/:id", imageController.update)
imageRouter.delete("/:id", imageController.remove)
