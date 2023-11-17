import { ApiError } from "@utils/errors/api-error";
import { StatusCodes } from "http-status-codes";
import { ObjectSchema, ValidationError } from "joi";

export function joiRequestValidator(schema: ObjectSchema): MethodDecorator {
  return (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const [req] = args;
      try {
        await schema.validateAsync(req.body);
        return originalMethod.apply(this, args);
      } catch (error) {
        const err = error as ValidationError;
        throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.details[0].message);
      }
    };
    return descriptor;
  };
}
