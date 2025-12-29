import { parseWithValibot } from "@conform-to/valibot";
import {
  type BaseSchema,
  type InferOutput,
  type BaseIssue,
  safeParse,
} from "valibot";

export async function getValidatedFormDataOr400<
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

export async function getValidatedJsonOr400<
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(request: Request, schema: TSchema): Promise<InferOutput<TSchema>> {
  const json = await request.json();
  const result = safeParse(schema, json);

  if (!result.success) {
    throw Response.json(
      { code: "BAD_REQUEST", issues: result.issues },
      { status: 400 },
    );
  }

  return result.output;
}
