import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ZodError } from "zod";
import { ValidationError } from "../errors/app-error.js";

type RequestSchemas = {
  body?: ZodType<unknown>;
  params?: ZodType<unknown>;
  query?: ZodType<unknown>;
};

export function validateRequest(schemas: RequestSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request["params"];
      }

      if (schemas.query) {
        res.locals.validatedQuery = schemas.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError());
        return;
      }

      next(error);
    }
  };
}
