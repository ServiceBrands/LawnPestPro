import { NextResponse } from "next/server";

export const config = {
  matcher: "/integrations/:path*",
};

export function middleware(request) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-createxyz-project-id", "db568797-8c03-499e-892d-dd8ae64e254f");
  requestHeaders.set("x-createxyz-project-group-id", "c777ffb5-74e2-43a7-a6d1-c90b98e6b7f2");


  request.nextUrl.href = `https://www.create.xyz/${request.nextUrl.pathname}`;

  return NextResponse.rewrite(request.nextUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}