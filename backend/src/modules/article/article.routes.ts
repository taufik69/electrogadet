import { Router } from "express"
import { articleController } from "./article.controller.js"
import { uploadImageFile } from "../../shared/middlewares/upload.js"

export const articleRouter = Router()

// /published and /slug/:slug must be registered before /:id, or Express matches
// :id = "published" (same hazard as banner.routes.ts's /active and
// category.routes.ts's /reorder — spec §4).
articleRouter.get("/published", articleController.listPublished)
articleRouter.get("/slug/:slug", articleController.getBySlug)

articleRouter.get("/", articleController.list)
articleRouter.post("/", articleController.create)
articleRouter.get("/:id", articleController.getById)
articleRouter.patch("/:id", articleController.update)
articleRouter.put("/:id/seo", articleController.upsertSeo)
articleRouter.put("/:id/cover", uploadImageFile, articleController.replaceCover)
articleRouter.delete("/:id", articleController.remove)
