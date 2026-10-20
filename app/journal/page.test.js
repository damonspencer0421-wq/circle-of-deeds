import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Journal from "./page";

vi.mock("@/lib/supabase", () => ({
  supabase: () => ({
    from: () => ({
      select: () => ({ order: () => Promise.resolve({ data: [] }) }),
    }),
  }),
}));

vi.mock("@/lib/guest", () => ({ getGuestId: async () => null }));

describe("Journal note", () => {
  it("names the note field with a real label", async () => {
    render(<Journal />);
    const note = await screen.findByLabelText("Note for yourself");
    expect(note.tagName).toBe("TEXTAREA");
    expect(note).toHaveAttribute("id", "journal-note");
  });
});
