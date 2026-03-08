import { BadRequestException } from "@nestjs/common";

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: { issues: Array<{ message?: string }> } };

type SchemaLike<T> = {
  safeParse(input: unknown): ParseResult<T>;
};

export function parseWithSchema<T>(schema: SchemaLike<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    const message =
      result.error.issues[0]?.message ?? "Invalid request payload";
    throw new BadRequestException(message);
  }

  return result.data;
}
