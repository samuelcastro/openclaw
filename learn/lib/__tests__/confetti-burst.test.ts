import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { ConfettiBurst } from "../../components/learn/confetti-burst";

describe("ConfettiBurst SSR", () => {
  it("renders no confetti pieces during SSR to avoid hydration mismatch", () => {
    const html = renderToString(createElement(ConfettiBurst, { trigger: 0 }));
    expect(html).not.toContain("confetti-piece");
  });
});
