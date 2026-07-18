import { Router } from "express"
import { productController } from "./product.controller.js"

export const productRouter = Router()

productRouter.get("/", productController.list)
productRouter.post("/", productController.create)
productRouter.get("/:id", productController.getById)
productRouter.patch("/:id", productController.update)
productRouter.delete("/:id", productController.remove)

productRouter.patch("/:id/seo", productController.upsertSeo)
