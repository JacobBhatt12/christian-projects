import { errorResponse } from "@/lib/server/api-response";
import { getSearchData, listSavedItems, removeSavedItem, saveItem } from "@/lib/server/repository";
import { savedItemSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const clientId = new URL(request.url).searchParams.get("clientId") ?? "";
    const parsed = savedItemSchema.pick({ clientId: true }).parse({ clientId });
    const [savedItems, searchData] = await Promise.all([
      listSavedItems(parsed.clientId),
      getSearchData(),
    ]);
    const items = savedItems.flatMap((saved) => {
      const item =
        saved.itemType === "resource"
          ? searchData.resources.find((resource) => resource.id === saved.itemId)
          : searchData.alternatives.find((alternative) => alternative.id === saved.itemId);
      return item ? [{ saved, item }] : [];
    });
    return Response.json({ items });
  } catch (error) {
    return errorResponse(error, "We could not load saved results.");
  }
}

export async function POST(request: Request) {
  try {
    const input = savedItemSchema.parse(await request.json());
    const saved = await saveItem(input);
    return Response.json({ saved }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "We could not save this result.");
  }
}

export async function DELETE(request: Request) {
  try {
    const input = savedItemSchema.parse(await request.json());
    await removeSavedItem(input.clientId, input.itemType, input.itemId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, "We could not remove this saved result.");
  }
}
