import { ApiError } from "@utils/errors/api-error";
import { StatusCodes } from "http-status-codes";
import { ObjectSchema, ValidationError } from "joi";

interface IJoiRequestValidatorOptions {
  body?: boolean;
  params?: boolean;
  query?: boolean;
}

export function joiRequestValidator(
  schema: ObjectSchema,
  options: IJoiRequestValidatorOptions = {
    body: true,
    params: false,
    query: false,
  },
): MethodDecorator {
  return (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const [req] = args;
      try {
        if (options.body) await schema.validateAsync(req.body);
        if (options.params) await schema.validateAsync(req.params);
        if (options.query) await schema.validateAsync(req.query);
        return originalMethod.apply(this, args);
      } catch (error) {
        const err = error as ValidationError;
        throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err?.details?.[0]?.message);
      }
    };
    return descriptor;
  };
}
