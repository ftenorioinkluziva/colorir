import { env } from "@colorir/env/web";
import { Button } from "@colorir/ui/components/button";
import {
	ArrowDown,
	ArrowUp,
	ExternalLink,
	FileText,
	Loader2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type PreviewImage = {
	id: string;
	url: string;
};

type PdfPreviewProps = {
	images: PreviewImage[];
	open: boolean;
	onClose: () => void;
};

export default function PdfPreview({ images, open, onClose }: PdfPreviewProps) {
	const [orderedIds, setOrderedIds] = useState<string[]>(() =>
		images.map((img) => img.id),
	);
	const [generating, setGenerating] = useState(false);
	const [result, setResult] = useState<{
		url: string;
		imageCount: number;
	} | null>(null);
	const [error, setError] = useState<string | null>(null);

	const imageMap = new Map(images.map((img) => [img.id, img.url]));

	useEffect(() => {
		if (open) {
			setOrderedIds(images.map((img) => img.id));
		}
	}, [images, open]);

	const moveUp = useCallback((index: number) => {
		if (index === 0) return;
		setOrderedIds((prev) => {
			const next = [...prev];
			[next[index - 1], next[index]] = [next[index], next[index - 1]];
			return next;
		});
	}, []);

	const moveDown = useCallback(
		(index: number) => {
			if (index === orderedIds.length - 1) return;
			setOrderedIds((prev) => {
				const next = [...prev];
				[next[index], next[index + 1]] = [next[index + 1], next[index]];
				return next;
			});
		},
		[orderedIds.length],
	);

	const handleGenerate = useCallback(async () => {
		setGenerating(true);
		setError(null);
		setResult(null);

		try {
			if (orderedIds.length === 0) {
				throw new Error("Selecione pelo menos uma imagem para exportar");
			}

			const response = await fetch(`${env.VITE_SERVER_URL}/api/generate-pdf`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ imageIds: orderedIds }),
				credentials: "include",
			});

			if (response.status === 413) {
				throw new Error("PDF excede o limite de tamanho (20MB)");
			}

			if (!response.ok) {
				throw new Error("Erro ao gerar PDF");
			}

			const data = await response.json();
			setResult({ url: data.url, imageCount: data.imageCount });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao gerar PDF");
		} finally {
			setGenerating(false);
		}
	}, [orderedIds]);

	const handleClose = () => {
		setOrderedIds(images.map((img) => img.id));
		setResult(null);
		setError(null);
		onClose();
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border bg-popover shadow-lg">
				<div className="flex items-center justify-between border-b px-6 py-4">
					<h2 className="font-semibold text-lg">Preview do PDF</h2>
					<Button variant="outline" size="xs" onClick={handleClose}>
						Fechar
					</Button>
				</div>

				<div className="flex-1 overflow-y-auto p-6">
					{result ? (
						<div className="flex flex-col items-center gap-4 py-8">
							<FileText className="size-12 text-primary" />
							<p className="font-medium text-base">PDF gerado com sucesso!</p>
							<p className="text-muted-foreground text-sm">
								{result.imageCount}{" "}
								{result.imageCount === 1 ? "página" : "páginas"}
							</p>
							<a
								href={result.url}
								target="_blank"
								rel="noopener noreferrer"
								download
							>
								<Button variant="default">
									<ExternalLink className="size-4" />
									Baixar PDF
								</Button>
							</a>
						</div>
					) : (
						<div className="flex flex-col gap-3">
							<p className="text-muted-foreground text-sm">
								Arraste ou use os botões para reordenar as páginas.
							</p>

							{error && (
								<p className="rounded bg-destructive/10 p-2 text-destructive text-sm">
									{error}
								</p>
							)}

							{orderedIds.map((id, index) => {
								const url = imageMap.get(id);
								return (
									<div
										key={id}
										className="flex items-center gap-3 rounded-lg border bg-background p-2"
									>
										<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted font-mono text-muted-foreground text-xs">
											{index + 1}
										</span>
										{url && (
											<img
												src={url}
												alt={`Página ${index + 1}`}
												className="h-16 w-16 shrink-0 rounded object-cover"
											/>
										)}
										<span className="flex-1 truncate text-muted-foreground text-xs">
											Página {index + 1}
										</span>
										<div className="flex shrink-0 gap-1">
											<Button
												variant="outline"
												size="icon"
												disabled={index === 0}
												onClick={() => moveUp(index)}
												aria-label={`Mover página ${index + 1} para cima`}
											>
												<ArrowUp className="size-3" />
											</Button>
											<Button
												variant="outline"
												size="icon"
												disabled={index === orderedIds.length - 1}
												onClick={() => moveDown(index)}
												aria-label={`Mover página ${index + 1} para baixo`}
											>
												<ArrowDown className="size-3" />
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{!result && (
					<div className="flex items-center justify-end gap-2 border-t px-6 py-4">
						<Button variant="outline" size="sm" onClick={handleClose}>
							Cancelar
						</Button>
						<Button
							variant="default"
							size="sm"
							disabled={generating}
							onClick={handleGenerate}
						>
							{generating ? (
								<>
									<Loader2 className="size-4 animate-spin" />
									Gerando...
								</>
							) : (
								"Gerar PDF"
							)}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
