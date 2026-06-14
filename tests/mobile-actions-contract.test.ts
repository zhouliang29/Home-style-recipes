import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function parseSizeLimit(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  const match = value.trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb)?$/);
  if (!match) return 0;

  const amount = Number(match[1]);
  const unit = match[2] ?? "b";
  const multiplier = unit === "mb" ? 1024 * 1024 : unit === "kb" ? 1024 : 1;
  return amount * multiplier;
}

describe("mobile Server Action contract", () => {
  it("allows the phone browser origin to request Next.js dev assets", () => {
    expect(nextConfig.allowedDevOrigins).toContain("192.168.8.112");
  });

  it("allows mobile photo uploads up to the client-side 5MB limit", () => {
    const limit = nextConfig.experimental?.serverActions?.bodySizeLimit;

    expect(parseSizeLimit(limit)).toBeGreaterThanOrEqual(5 * 1024 * 1024);
  });

  it("returns ok:true after archiving from the detail page", () => {
    const source = readFileSync(join(process.cwd(), "app/recipes/actions.ts"), "utf8");

    expect(source).toMatch(/export async function archiveRecipeAction[\s\S]*return \{ ok: true \}/);
  });
});
