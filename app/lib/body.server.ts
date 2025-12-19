import { parseWithValibot } from "@conform-to/valibot";
import type { BaseSchema, InferOutput } from "valibot";

export async function getValidatedBody<T extends BaseSchema<unknown, unknown>>(
  request: Request,
  schema: T,
) {
  const contentType = request.headers.get("Content-Type")?.split(";")[0];
  let formData: FormData;

  switch (contentType) {
    case "application/x-www-form-urlencoded":
    case "multipart/form-data":
      formData = await request.formData();
      break;
    case "application/json": {
      const json = await request.json();
      formData = new FormData();
      for (const [key, value] of Object.entries(json)) {
        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, String(v)));
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      }
      break;
    }
    case undefined:
      formData = new FormData();
      break;
    default:
      return {
        status: "error" as const,
        error: { root: ["Unsupported content type"] },
      };
  }

  return parseWithValibot(formData, { schema });
}

export async function getValidatedBodyOr400<T extends BaseSchema<unknown, unknown>>(
  request: Request,
  schema: T,
): Promise<InferOutput<T>> {
  const submission = await getValidatedBody(request, schema);
  
  if (submission.status !== "success") {
    throw Response.json(
      { code: "BAD_REQUEST", error: submission.error },
      { status: 400 }
    );
  }

  return submission.value;
}
