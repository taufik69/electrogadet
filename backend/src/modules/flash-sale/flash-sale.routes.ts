import { Router } from "express"
import { flashSaleController } from "./flash-sale.controller.js"

export const flashSaleRouter = Router()

flashSaleRouter.get("/active", flashSaleController.getActive)
flashSaleRouter.get("/", flashSaleController.list)
flashSaleRouter.post("/", flashSaleController.create)
flashSaleRouter.get("/:id", flashSaleController.getById)
flashSaleRouter.patch("/:id", flashSaleController.update)
flashSaleRouter.delete("/:id", flashSaleController.remove)

flashSaleRouter.post("/:id/products", flashSaleController.addProduct)
flashSaleRouter.patch("/:id/products/:entryId", flashSaleController.updateProduct)
flashSaleRouter.delete("/:id/products/:entryId", flashSaleController.removeProduct)
