import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MobileNav from "./MobileNav";

const pathname = vi.hoisted(() => ({ current: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>,
}));

describe("MobileNav", () => {
  beforeEach(() => { pathname.current = "/"; });

  it("starts closed and opens every top-level page", () => {
    render(<MobileNav />);
    const button = screen.getByRole("button", { name: "Menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation", { name: "Pages" })).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    const nav = screen.getByRole("navigation", { name: "Pages" });
    expect(nav).not.toHaveAttribute("hidden");
    for (const [name, href] of [["Pass it on", "/start"], ["Got a code?", "/d"], ["Impact", "/impact"], ["Journal", "/journal"]]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });

  it("closes on Escape and when the page changes", () => {
    const { rerender } = render(<MobileNav />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    pathname.current = "/impact";
    rerender(<MobileNav />);
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
  });
});
