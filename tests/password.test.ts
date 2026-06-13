import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("password helpers", () => {
  it("hashes passwords and verifies the original password only", async () => {
    const hash = await hashPassword("change-me");

    expect(hash).not.toBe("change-me");
    expect(await verifyPassword("change-me", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});
