import { Router } from "express"
import { brandController } from "./brand.controller.js"
import { brandImageUpload } from "../../shared/middlewares/upload.js"

export const brandRouter = Router()

brandRouter.get("/", brandController.list)
brandRouter.post("/", brandImageUpload.single("image"), brandController.create)
brandRouter.get("/slug/:slug", brandController.getBySlug)
brandRouter.get("/:id", brandController.getById)
brandRouter.patch("/:id", brandImageUpload.single("image"), brandController.update)
brandRouter.delete("/:id", brandController.remove)
