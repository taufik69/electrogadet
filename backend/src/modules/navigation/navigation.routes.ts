import { Router } from "express"
import { navigationController } from "./navigation.controller.js"

export const navigationRouter = Router()

navigationRouter.get("/sidebar", navigationController.getSidebar)
