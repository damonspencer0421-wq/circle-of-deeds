import { describe, expect, it } from "vitest";
import { codeEntryMessage, normalizeDeedCode } from "./codeEntry";

describe("code entry", () => {
  it("accepts six letters with or without a dash", () => {
    expect(normalizeDeedCode("7k3-mdp")).toBe("7K3MDP");
    expect(codeEntryMessage("7K3-MDP")).toBeNull();
    expect(codeEntryMessage("  7k3 mdp ")).toBeNull();
  });

  it("explains an empty code", () => {
    expect(codeEntryMessage("")).toMatch(/6-character/);
    expect(codeEntryMessage("---")).toMatch(/6-character/);
  });

  it("says how many characters are still needed", () => {
    expect(codeEntryMessage("A")).toMatch(/1 character/);
    expect(codeEntryMessage("AB")).toMatch(/2 characters/);
    expect(codeEntryMessage("7K3-MD")).toMatch(/5 characters/);
  });

  it("rejects a code that is too long", () => {
    expect(codeEntryMessage("7K3-MDPX")).toMatch(/more than 6/);
  });
});
