import type { Request, Response } from "express"
import { ApiResponse } from "../../shared/helpers/apiResponse.js"
import { navigationService } from "./navigation.service.js"

export const navigationController = {
  async getSidebar(_req: Request, res: Response) {
    const data = await navigationService.getSidebarTree()
    ApiResponse.success(res, { message: "Fetched successfully", data })
  },
}
