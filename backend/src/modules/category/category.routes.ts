import { Router } from "express"
import { categoryController } from "./category.controller.js"

export const categoryRouter = Router()

// Specific paths before /:id, or Express matches :id = "reorder".
categoryRouter.patch("/reorder", categoryController.reorder)
categoryRouter.get("/", categoryController.list)
categoryRouter.post("/", categoryController.create)
categoryRouter.get("/:id", categoryController.getById)
categoryRouter.patch("/:id", categoryController.update)
categoryRouter.delete("/:id", categoryController.remove)

categoryRouter.post("/:id/products", categoryController.attachProduct)
categoryRouter.patch("/:id/products/reorder", categoryController.reorderProducts)
categoryRouter.delete("/:id/products/:productId", categoryController.detachProduct)
