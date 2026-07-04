import express from "express"
import cors from "cors"
import helmet from "helmet"
import { productRouter } from "./modules/product/product.routes.js"
import { announcementRouter } from "./modules/announcement/announcement.routes.js"
import { errorHandler } from "./shared/middlewares/errorHandler.js"

export const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.use("/api/products", productRouter)
app.use("/api/announcements", announcementRouter)

app.use(errorHandler)
