import { Button } from "@colorir/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@colorir/ui/components/card";
import { Toaster } from "@colorir/ui/components/sonner";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AlertTriangle, RefreshCw } from "lucide-react";

import Header from "@/components/header";

import "../index.css";

export type RouterAppContext = {};

function RouteErrorComponent({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	return (
		<div className="flex h-full items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex items-center gap-2">
						<AlertTriangle className="size-5 text-destructive" />
						<CardTitle>Algo deu errado</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						Ocorreu um erro inesperado. Tente novamente ou recarregue a página.
					</p>
					{import.meta.env.DEV && error.stack && (
						<pre className="mt-4 max-h-40 overflow-auto rounded bg-muted p-3 font-mono text-muted-foreground text-xs">
							{error.stack}
						</pre>
					)}
				</CardContent>
				<CardFooter>
					<Button variant="outline" onClick={() => reset()}>
						<RefreshCw className="size-4" />
						Tentar novamente
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	errorComponent: RouteErrorComponent,
	head: () => ({
		meta: [
			{
				title: "colorir",
			},
			{
				name: "description",
				content: "colorir is a web application",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	return (
		<>
			<HeadContent />
			<div className="grid h-svh grid-rows-[auto_1fr]">
				<Header />
				<Outlet />
			</div>
			<Toaster richColors />
			<TanStackRouterDevtools position="bottom-left" />
		</>
	);
}
