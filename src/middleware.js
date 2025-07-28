import { NextResponse } from "next/server";

export const config = {
  matcher: "/integrations/:path*",
};

export function middleware(request) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-createxyz-project-id", "09f1355f-8f8e-440f-8740-a4eb82c9acbb");
  requestHeaders.set("x-createxyz-project-group-id", "c777ffb5-74e2-43a7-a6d1-c90b98e6b7f2");


  request.nextUrl.href = `https://www.create.xyz/${request.nextUrl.pathname}`;

  return NextResponse.rewrite(request.nextUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}