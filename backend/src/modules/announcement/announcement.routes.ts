import { Router } from "express"
import { announcementController } from "./announcement.controller.js"

export const announcementRouter = Router()

announcementRouter.get("/active", announcementController.getActive)
announcementRouter.get("/", announcementController.list)
announcementRouter.post("/", announcementController.create)
announcementRouter.get("/:id", announcementController.getById)
announcementRouter.patch("/:id", announcementController.update)
announcementRouter.delete("/:id", announcementController.remove)
