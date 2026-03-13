import { describe, expect, it } from "vitest";
import type { Request } from "express";
import { getSessionCookieOptions } from "./cookies";

function createRequest(
  overrides: Partial<Request> = {}
): Request {
  return {
    protocol: "http",
    headers: {},
    ...overrides,
  } as Request;
}

describe("getSessionCookieOptions", () => {
  it("uses lax cookies for local non-secure requests", () => {
    const options = getSessionCookieOptions(createRequest());

    expect(options).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    });
  });

  it("uses none cookies for secure requests", () => {
    const options = getSessionCookieOptions(
      createRequest({
        protocol: "https",
      })
    );

    expect(options).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
    });
  });
});
