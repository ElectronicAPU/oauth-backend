import type { Response } from "express";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string,
  statusCode: number = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error: any = null,
) => {
  return res.status(statusCode).json({
    success: false,
    error,
    message,
  });
};
