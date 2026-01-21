import { NextResponse } from "next/server";

import { getKaiaDevInternData } from "@/lib/services/social-media";

export async function GET(): Promise<NextResponse> {
  const kaiaDevInternData = await getKaiaDevInternData(365);

  return NextResponse.json({
    kaiaDevIntern: kaiaDevInternData,
  });
}
