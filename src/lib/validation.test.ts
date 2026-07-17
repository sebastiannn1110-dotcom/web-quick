import { describe, expect, it } from "vitest";
import { contactSchema, rfqSchema, validateBomFile } from "./validation";

describe("submission validation", () => {
  it("sanitizes contact text fields", () => {
    const parsed = contactSchema.parse({
      name: "Jane <Buyer>",
      company: "Acme EMS",
      email: "jane@example.com",
      country: "Mexico",
      region: "Americas",
      requestType: "Sourcing",
      message: "Need sourcing support for shortage parts",
      consent: true,
    });

    expect(parsed.name).toBe("Jane Buyer");
  });

  it("coerces rfq quantity", () => {
    const parsed = rfqSchema.parse({
      company: "Acme EMS",
      contactName: "Jane Buyer",
      email: "jane@example.com",
      country: "Mexico",
      partNumber: "STM32F407VGT6",
      quantity: "2500",
      consent: true,
    });

    expect(parsed.quantity).toBe(2500);
  });

  it("rejects unsupported BOM types", () => {
    const file = new File(["hello"], "bom.txt", { type: "text/plain" });
    expect(validateBomFile(file)).toEqual({ ok: false, reason: "fileType" });
  });
});
