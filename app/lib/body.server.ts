import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import { getValidatedFormData, validateFormData } from "remix-hook-form";

export async function getValidatedBody<T extends FieldValues>(
  request: Request,
  resolver: Resolver<T>,
): ReturnType<typeof validateFormData<T>> {
  switch (request.headers.get("Content-Type")?.split(";")[0]) {
    case "application/x-www-form-urlencoded":
    case "multipart/form-data":
      return getValidatedFormData(request, resolver);
    case "application/json":
      const json = await request.json();
      return validateFormData(json, resolver);
    case undefined:
      return validateFormData({}, resolver);
    default:
      return {
        errors: { root: {} } as FieldErrors<T>,
        data: undefined,
      };
  }
}
