import { Router } from "express"
import { brandController } from "./brand.controller.js"

export const brandRouter = Router()

// /reorder must be registered before /:id, or Express matches :id = "reorder".
brandRouter.patch("/reorder", brandController.reorder)
brandRouter.get("/", brandController.list)
brandRouter.post("/", brandController.create)
brandRouter.get("/:id", brandController.getById)
brandRouter.patch("/:id", brandController.update)
brandRouter.delete("/:id", brandController.remove)
