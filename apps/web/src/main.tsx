import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

import ErrorBoundary from "@/components/error-boundary";
import Loader from "@/components/loader";
import { ThemeProvider } from "@/components/theme-provider";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultPendingComponent: () => <Loader />,
	context: {},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");

if (!rootElement) {
	throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<ThemeProvider
			attribute="class"
			defaultTheme="dark"
			disableTransitionOnChange
			storageKey="vite-ui-theme"
		>
			<ErrorBoundary>
				<RouterProvider router={router} />
			</ErrorBoundary>
		</ThemeProvider>,
	);
}
