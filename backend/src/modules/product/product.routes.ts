import { Router } from "express"
import { productController } from "./product.controller.js"

export const productRouter = Router()

productRouter.get("/", productController.list)
productRouter.post("/", productController.create)
