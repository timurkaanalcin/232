import { describe, expect, it } from "vitest";
import { isLocalOpenAI } from "./openai-local";

describe("isLocalOpenAI", () => {
  it("detects LM Studio origins", () => {
    expect(isLocalOpenAI("http://127.0.0.1:1234")).toBe(true);
    expect(isLocalOpenAI("http://localhost:1234/")).toBe(true);
    expect(isLocalOpenAI("https://aipo.customer.org.tr")).toBe(false);
    expect(isLocalOpenAI("")).toBe(false);
  });
});
