import { ZodError } from "zod";

export function errorResponse(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: "Please check the information and try again.",
        fields: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const message = error instanceof Error ? error.message : fallback;
  return Response.json({ error: message || fallback }, { status: 500 });
}
