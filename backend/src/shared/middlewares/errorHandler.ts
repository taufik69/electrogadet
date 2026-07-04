import type { ErrorRequestHandler } from "express"
import { ApiError } from "../helpers/ApiError.js"

// 4-arg signature required for Express to recognize this as error-handling middleware
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => { // eslint-disable-line @typescript-eslint/no-unused-vars
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    })
    return
  }

  console.error(err)
  res.status(500).json({ success: false, message: "Internal server error" })
}
