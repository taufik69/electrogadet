import { Router } from "express"
import { bannerController } from "./banner.controller.js"

export const bannerRouter = Router()

// /active must be registered before /:id, or Express matches :id = "active"
// (same hazard as category.routes.ts's /reorder — spec §4).
bannerRouter.get("/active", bannerController.listActive)

bannerRouter.get("/", bannerController.list)
bannerRouter.post("/", bannerController.create)
bannerRouter.get("/:id", bannerController.getById)
bannerRouter.patch("/:id", bannerController.update)
bannerRouter.delete("/:id", bannerController.remove)
