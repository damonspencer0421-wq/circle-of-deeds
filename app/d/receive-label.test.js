import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Receive from "./[code]/page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ code: "ABCDEF" }),
}));

vi.mock("@/lib/analytics", () => ({ track: async () => {} }));
vi.mock("@/lib/guest", () => ({
  getGuestId: async () => null,
  rememberLink: () => {},
  openLink: () => null,
}));
vi.mock("@/lib/geo", () => ({ coarseLocate: async () => null }));

vi.mock("@/lib/supabase", () => ({
  supabase: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({
            data: {
              id: 1,
              circle_id: 1,
              deed_type_id: "held-door",
              points: 1,
              accepted_at: null,
              expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
              city: null,
              region: null,
              parent_link_id: null,
              deed_types: { name: "Held a door" },
            },
          }),
        }),
      }),
    }),
    rpc: () => Promise.reject(new Error("accept must not run in this test")),
  }),
}));

describe("Receive city field", () => {
  it("connects the city label to the input", async () => {
    render(<Receive />);
    fireEvent.click(await screen.findByRole("button", { name: /Add my city/ }));
    const city = screen.getByLabelText(/City only/);
    expect(city).toHaveAttribute("id", "receive-city");
    expect(city.tagName).toBe("INPUT");
  });
});
