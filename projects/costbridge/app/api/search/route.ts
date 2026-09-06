import { searchData } from "@/lib/search";
import { getSearchData } from "@/lib/server/repository";
import { errorResponse } from "@/lib/server/api-response";
import { searchSchema } from "@/lib/validation";

function isEnabled(value: string | null) {
  return value === "true" || value === "1" || value === "on";
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const parsed = searchSchema.parse({
      zip: params.get("zip"),
      category: params.get("category"),
      need: params.get("need") ?? "",
      distance: params.get("distance") ?? 25,
      sort: params.get("sort") ?? "savings",
      free: isEnabled(params.get("free")),
      discounted: isEnabled(params.get("discounted")),
      transitAccessible: isEnabled(params.get("transitAccessible")),
      onlineAvailable: isEnabled(params.get("onlineAvailable")),
    });
    const data = await getSearchData();
    const results = searchData(
      {
        zip: parsed.zip,
        category: parsed.category,
        need: parsed.need,
        distance: parsed.distance,
        sort: parsed.sort,
        filters: {
          free: parsed.free,
          discounted: parsed.discounted,
          transitAccessible: parsed.transitAccessible,
          onlineAvailable: parsed.onlineAvailable,
        },
      },
      data.alternatives,
      data.resources,
    );
    return Response.json({ ...results, source: data.source });
  } catch (error) {
    return errorResponse(error, "Search is temporarily unavailable.");
  }
}
