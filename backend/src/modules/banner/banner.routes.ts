import { Router } from "express"
import { bannerController } from "./banner.controller.js"
import { bannerImageUpload } from "../../shared/middlewares/upload.js"

export const bannerRouter = Router()

bannerRouter.get("/active", bannerController.getActive)
bannerRouter.get("/", bannerController.list)
bannerRouter.post("/", bannerImageUpload.single("image"), bannerController.create)
bannerRouter.get("/:id", bannerController.getById)
bannerRouter.patch("/:id", bannerImageUpload.single("image"), bannerController.update)
bannerRouter.delete("/:id", bannerController.remove)
