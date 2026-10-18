import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CircleRankLink from "./CircleRankLink";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>,
}));

describe("CircleRankLink", () => {
  it("makes the whole circle row one link", () => {
    render(<CircleRankLink id={9} linkCount={1} pointTotal={1} />);
    const link = screen.getByRole("link", { name: /Circle #9/ });
    expect(link).toHaveAttribute("href", "/circle/9");
    expect(link).toHaveClass("rank-link");
    expect(link).toHaveTextContent("1 links · 1 pts");
  });
});
