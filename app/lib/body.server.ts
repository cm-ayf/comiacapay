import { parseWithValibot } from "@conform-to/valibot";
import type { BaseSchema, InferOutput, BaseIssue } from "valibot";

export async function getValidatedBodyOr400<
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(request: Request, schema: TSchema): Promise<InferOutput<TSchema>> {
  const formData = await request.formData();
  const submission = parseWithValibot(formData, { schema });

  if (submission.status !== "success") {
    throw Response.json(
      { code: "BAD_REQUEST", error: submission.error },
      { status: 400 },
    );
  }

  return submission.value;
}
