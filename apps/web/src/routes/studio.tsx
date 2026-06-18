import { env } from "@colorir/env/web";
import { Button } from "@colorir/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@colorir/ui/components/card";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, ImageIcon, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STYLES = [
	{
		id: "mandala" as const,
		label: "Mandala",
		description: "Simetria e padrões circulares",
		icon: "◎",
	},
	{
		id: "cozy" as const,
		label: "Cozy",
		description: "Cenas aconchegantes e acolhedoras",
		icon: "☕",
	},
	{
		id: "botanica" as const,
		label: "Botânica",
		description: "Folhas, flores e natureza",
		icon: "🌿",
	},
	{
		id: "infantil" as const,
		label: "Infantil",
		description: "Desenhos simples e divertidos",
		icon: "🐰",
	},
] as const;

type StyleId = (typeof STYLES)[number]["id"];

type GenerationResult = {
	imageUrl: string;
	style: string;
	prompt: string;
};

type GenerationError = {
	type:
		| "timeout"
		| "provider"
		| "blocked"
		| "rate_limit"
		| "validation"
		| "unknown";
	message: string;
};

const TIMEOUT_MS = 60_000;

export const Route = createFileRoute("/studio")({
	component: RouteComponent,
});

function RouteComponent() {
	const [selectedStyle, setSelectedStyle] = useState<StyleId | null>(null);
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<GenerationError | null>(null);
	const [result, setResult] = useState<GenerationResult | null>(null);

	const handleGenerate = async () => {
		if (!selectedStyle) {
			setError({
				type: "validation",
				message: "Selecione um estilo para começar.",
			});
			return;
		}
		const trimmedPrompt = prompt.trim();
		if (!trimmedPrompt) {
			setError({
				type: "validation",
				message: "Escreva um prompt para gerar a imagem.",
			});
			return;
		}

		setIsGenerating(true);
		setError(null);
		setResult(null);

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

		try {
			const response = await fetch(
				`${env.VITE_SERVER_URL}/api/generate-image`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ style: selectedStyle, prompt: trimmedPrompt }),
					signal: controller.signal,
					credentials: "include",
				},
			);

			clearTimeout(timeoutId);

			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				if (response.status === 429) {
					throw {
						type: "rate_limit" as const,
						message: "Limite diário de gerações atingido. Volte amanhã!",
					};
				}
				if (response.status === 422) {
					throw {
						type: "validation" as const,
						message: body.error ?? "Dados inválidos.",
					};
				}
				if (response.status === 451) {
					throw {
						type: "blocked" as const,
						message: "Conteúdo bloqueado pelas diretrizes de segurança.",
					};
				}
				throw {
					type: "provider" as const,
					message: body.error ?? "Erro ao gerar imagem. Tente novamente.",
				};
			}

			const data = await response.json();
			setResult({
				imageUrl: data.url,
				style: selectedStyle,
				prompt: trimmedPrompt,
			});
			toast.success("Imagem gerada com sucesso!");
		} catch (err: unknown) {
			clearTimeout(timeoutId);

			if (err instanceof DOMException && err.name === "AbortError") {
				setError({
					type: "timeout",
					message: "A geração demorou muito. Tente um prompt mais simples.",
				});
				toast.error("Tempo limite excedido");
				return;
			}

			if (err && typeof err === "object" && "type" in err) {
				const genErr = err as GenerationError;
				setError(genErr);
				if (genErr.type !== "validation") {
					toast.error(genErr.message);
				}
				return;
			}

			setError({
				type: "unknown",
				message: "Erro inesperado. Tente novamente.",
			});
			toast.error("Erro inesperado");
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="container mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
			<div>
				<h1 className="font-semibold text-xl">Studio de Geração</h1>
				<p className="text-muted-foreground text-sm">
					Escolha um estilo e descreva sua ideia para gerar uma line-art
					personalizada.
				</p>
			</div>

			<section>
				<h2 className="mb-3 font-medium text-sm">1. Escolha o estilo</h2>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{STYLES.map((style) => {
						const isSelected = selectedStyle === style.id;
						return (
							<button
								key={style.id}
								type="button"
								onClick={() => {
									setSelectedStyle(style.id);
									setError(null);
								}}
								className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
									isSelected
										? "border-primary bg-primary/10 ring-1 ring-primary"
										: "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
								}`}
							>
								<span className="text-2xl">{style.icon}</span>
								<span className="font-medium text-xs">{style.label}</span>
								<span className="text-[10px] text-muted-foreground leading-tight">
									{style.description}
								</span>
							</button>
						);
					})}
				</div>
			</section>

			<section>
				<h2 className="mb-3 font-medium text-sm">2. Descreva sua ideia</h2>
				<textarea
					value={prompt}
					onChange={(e) => {
						setPrompt(e.target.value);
						setError(null);
					}}
					placeholder="Ex: uma borboleta pousada em uma flor com padrões geométricos ao redor..."
					className="h-24 w-full resize-none rounded-lg border border-input bg-transparent p-3 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:opacity-50"
					disabled={isGenerating}
					maxLength={500}
				/>
				<p className="mt-1 text-right text-[10px] text-muted-foreground">
					{prompt.length}/500
				</p>
			</section>

			{error && error.type === "validation" && (
				<div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-xs">
					<AlertCircle className="size-4 shrink-0" />
					<span>{error.message}</span>
				</div>
			)}

			<Button
				onClick={handleGenerate}
				disabled={isGenerating || !selectedStyle || !prompt.trim()}
				size="lg"
				className="w-full gap-2"
			>
				{isGenerating ? (
					<>
						<Loader2 className="size-4 animate-spin" />
						Gerando...
					</>
				) : (
					<>
						<Sparkles className="size-4" />
						Gerar Line-Art
					</>
				)}
			</Button>

			{error && error.type !== "validation" && (
				<Card className="border-destructive/30">
					<CardContent className="flex items-center gap-2 px-4 py-3">
						<AlertCircle className="size-4 shrink-0 text-destructive" />
						<div>
							<p className="font-medium text-destructive text-xs">Erro</p>
							<p className="text-muted-foreground text-xs">{error.message}</p>
						</div>
					</CardContent>
				</Card>
			)}

			{result && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ImageIcon className="size-4" />
							Resultado
						</CardTitle>
						<CardDescription>
							Estilo: {STYLES.find((s) => s.id === result.style)?.label}{" "}
							&middot; Prompt: {result.prompt}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<img
							src={result.imageUrl}
							alt={`Line-art gerada no estilo ${result.style}`}
							className="w-full rounded-lg border"
						/>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
