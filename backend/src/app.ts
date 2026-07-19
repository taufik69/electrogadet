import express from "express"
import cors from "cors"
import helmet from "helmet"
import { brandRouter } from "./modules/brand/brand.routes.js"
import { categoryRouter } from "./modules/category/category.routes.js"
import { productRouter } from "./modules/product/product.routes.js"
import { navigationRouter } from "./modules/navigation/navigation.routes.js"
import { imageRouter } from "./modules/image/image.routes.js"
import { bannerRouter } from "./modules/banner/banner.routes.js"
import { errorHandler } from "./shared/middlewares/errorHandler.js"

export const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.use("/api/brands", brandRouter)
app.use("/api/categories", categoryRouter)
app.use("/api/products", productRouter)
app.use("/api/navigation", navigationRouter)
app.use("/api/images", imageRouter)
app.use("/api/banners", bannerRouter)

app.use(errorHandler)
