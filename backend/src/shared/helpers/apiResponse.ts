import type { Response } from "express"

interface SuccessArgs<T> {
  statusCode?: number
  message: string
  data: T
  meta?: Record<string, unknown>
}

export const ApiResponse = {
  success<T>(res: Response, { statusCode = 200, message, data, meta }: SuccessArgs<T>) {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    })
  },
}
