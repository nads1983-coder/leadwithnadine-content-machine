import { NextRequest } from "next/server";
import { handleGenerateImage } from "../../../server/generate-image-handler";

export const runtime = "nodejs";

export async function POST(nextRequest: NextRequest) {
  return handleGenerateImage(nextRequest);
}
