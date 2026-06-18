import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";

import ErrorBoundary from "./error-boundary";

function render(ui: ReactNode) {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	act(() => root.render(ui));
	return { container, root };
}

function Thrower({ message }: { message: string }): ReactNode {
	throw Error(message);
}

describe("ErrorBoundary", () => {
	it("renders children when no error occurs", () => {
		const { container } = render(<div id="child">Hello</div>);
		expect(container.querySelector("#child")).toBeTruthy();
		expect(container.textContent).toBe("Hello");
	});

	it("catches rendering errors and shows fallback", () => {
		const { container } = render(
			<ErrorBoundary>
				<Thrower message="Test error" />
			</ErrorBoundary>,
		);

		expect(container.textContent).toContain("Algo deu errado");
		expect(container.textContent).toContain("Tentar novamente");
	});

	it("shows error details in dev environment", () => {
		const { container } = render(
			<ErrorBoundary>
				<Thrower message="Dev test error" />
			</ErrorBoundary>,
		);

		expect(container.textContent).toContain("Algo deu errado");
		expect(container.textContent).toContain("Dev test error");
	});
});
