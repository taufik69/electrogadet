import express from "express"
import cors from "cors"
import helmet from "helmet"
import { productRouter } from "./modules/product/product.routes.js"
import { announcementRouter } from "./modules/announcement/announcement.routes.js"
import { categoryRouter } from "./modules/category/category.routes.js"
import { bannerRouter } from "./modules/banner/banner.routes.js"
import { flashSaleRouter } from "./modules/flash-sale/flash-sale.routes.js"
import { brandRouter } from "./modules/brand/brand.routes.js"
import { errorHandler } from "./shared/middlewares/errorHandler.js"
import { PUBLIC_DIR } from "./shared/middlewares/upload.js"

export const app = express()

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/public", express.static(PUBLIC_DIR))


app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.use("/api/products", productRouter)
app.use("/api/announcements", announcementRouter)
app.use("/api/categories", categoryRouter)
app.use("/api/banners", bannerRouter)
app.use("/api/flash-sales", flashSaleRouter)
app.use("/api/brands", brandRouter)

app.use(errorHandler)
