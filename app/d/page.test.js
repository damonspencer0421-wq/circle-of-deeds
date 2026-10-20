import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EnterCode from "./page";

const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("Enter a code", () => {
  it("shows a friendly message instead of failing quietly", () => {
    push.mockClear();
    render(<EnterCode />);
    fireEvent.click(screen.getByRole("button", { name: "Open it" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter the 6-character code");
    expect(push).not.toHaveBeenCalled();

    fireEvent.change(screen.getByRole("textbox", { name: "Deed code" }), { target: { value: "7K3" } });
    fireEvent.click(screen.getByRole("button", { name: "Open it" }));
    expect(screen.getByRole("alert")).toHaveTextContent("That's 3 characters");
    expect(push).not.toHaveBeenCalled();
  });

  it("opens a full code and ignores the dash", () => {
    push.mockClear();
    render(<EnterCode />);
    fireEvent.change(screen.getByRole("textbox", { name: "Deed code" }), { target: { value: "7k3-mdp" } });
    fireEvent.click(screen.getByRole("button", { name: "Open it" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(push).toHaveBeenCalledWith("/d/7K3MDP");
  });
});
