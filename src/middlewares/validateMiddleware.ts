import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { sendError } from "../utils/response.ts";

export const validate =
  (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = z.flattenError(result.error).fieldErrors;
      return sendError(res, "Validation faild", 400, errors);
    }

    req.body = result.data;
    next();
  };
