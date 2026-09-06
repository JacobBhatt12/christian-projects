import { hasAdminSession } from "@/lib/server/admin-auth";
import { errorResponse } from "@/lib/server/api-response";
import {
  getSearchData,
  listResourceSubmissions,
  updateResourceSubmission,
  verifyResource,
} from "@/lib/server/repository";
import { adminUpdateSchema } from "@/lib/validation";

function unauthorized() {
  return Response.json({ error: "Admin sign-in is required." }, { status: 401 });
}

export async function GET() {
  if (!(await hasAdminSession())) return unauthorized();
  try {
    const [submissions, data] = await Promise.all([
      listResourceSubmissions(),
      getSearchData(),
    ]);
    return Response.json({ submissions, resources: data.resources, source: data.source });
  } catch (error) {
    return errorResponse(error, "We could not load the review queue.");
  }
}

export async function PATCH(request: Request) {
  if (!(await hasAdminSession())) return unauthorized();
  try {
    const input = adminUpdateSchema.parse(await request.json());
    if (input.entity === "submission") {
      const submission = await updateResourceSubmission(input.id, {
        status: input.status,
        reviewerNotes: input.reviewerNotes,
        edits: input.edits,
      });
      return Response.json({ submission });
    }

    const resource = await verifyResource(input.id, input.method, input.notes);
    return Response.json({ resource });
  } catch (error) {
    return errorResponse(error, "We could not update this record.");
  }
}
