import { createResourceSubmission } from "@/lib/server/repository";
import { errorResponse } from "@/lib/server/api-response";
import { resourceSubmissionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 30_000) {
      return Response.json({ error: "This submission is too large." }, { status: 413 });
    }
    const body = await request.json();
    const input = resourceSubmissionSchema.parse(body);
    const submission = await createResourceSubmission(input);
    return Response.json(
      {
        submission,
        message: "Thank you. The resource is queued for review and is not public yet.",
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, "We could not submit this resource.");
  }
}
