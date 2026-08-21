import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function countryCode(value: string | null) {
  const code = value?.toUpperCase();
  return code && /^[A-Z]{2}$/.test(code) ? code : undefined;
}

function decodedHeader(value: string | null) {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value.replaceAll("+", " "));
  } catch {
    return value;
  }
}

export function GET(request: NextRequest) {
  const headers = request.headers;
  return NextResponse.json({
    city: decodedHeader(headers.get("x-vercel-ip-city")),
    continentCode: countryCode(headers.get("x-vercel-ip-continent")),
    countryCode: countryCode(headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry")),
    timezone: decodedHeader(headers.get("x-vercel-ip-timezone")),
  }, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
