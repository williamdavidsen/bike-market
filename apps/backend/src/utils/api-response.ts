import type { Response } from "express";

type SuccessResponse<T> = {
  success: true;
  data: T;
  message: string;
};

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): Response<SuccessResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
}
