import { Button } from "@colorir/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@colorir/ui/components/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	error: Error | null;
}

export default class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, info);
	}

	render() {
		if (this.state.error) {
			return <ErrorFallback error={this.state.error} />;
		}

		return this.props.children;
	}
}

function ErrorFallback({ error }: { error: Error }) {
	const isDev = import.meta.env.DEV;

	return (
		<div className="flex h-svh items-center justify-center p-4">
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
					{isDev && error.stack && (
						<pre className="mt-4 max-h-40 overflow-auto rounded bg-muted p-3 font-mono text-muted-foreground text-xs">
							{error.stack}
						</pre>
					)}
				</CardContent>
				<CardFooter>
					<Button variant="outline" onClick={() => window.location.reload()}>
						<RefreshCw className="size-4" />
						Tentar novamente
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

export { ErrorFallback };
