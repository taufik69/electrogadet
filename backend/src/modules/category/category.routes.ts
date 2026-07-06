import { Router } from "express"
import { categoryController } from "./category.controller.js"
import { categoryImageUpload } from "../../shared/middlewares/upload.js"

export const categoryRouter = Router()

categoryRouter.get("/tree", categoryController.getTree)
categoryRouter.get("/", categoryController.list)
categoryRouter.post("/", categoryImageUpload.single("image"), categoryController.create)
categoryRouter.get("/:id", categoryController.getById)
categoryRouter.patch("/:id", categoryImageUpload.single("image"), categoryController.update)
categoryRouter.delete("/:id", categoryController.remove)
