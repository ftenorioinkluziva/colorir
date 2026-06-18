import { env } from "@colorir/env/web";
import { Button } from "@colorir/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@colorir/ui/components/card";
import { Skeleton } from "@colorir/ui/components/skeleton";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const STYLE_LABELS: Record<string, string> = {
	mandala: "Mandala",
	cozy: "Cozy",
	botanica: "Botânica",
	infantil: "Infantil",
};

type ImageItem = {
	id: string;
	prompt: string;
	style: string;
	url: string;
	createdAt: string;
};

type ImagesResponse = {
	images: ImageItem[];
	total: number;
	page: number;
	pageSize: number;
};

const PAGE_SIZE = 12;

export const Route = createFileRoute("/gallery")({
	component: RouteComponent,
});

function RouteComponent() {
	const [images, setImages] = useState<ImageItem[]>([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const loadedRef = useRef(false);

	const fetchImages = useCallback(
		async (pageNum: number, append: boolean) => {
			if (append) {
				setLoadingMore(true);
			} else {
				setLoading(true);
			}
			setError(null);

			try {
				const params = new URLSearchParams({
					page: String(pageNum),
					pageSize: String(PAGE_SIZE),
				});
				const response = await fetch(
					`${env.VITE_SERVER_URL}/api/images?${params}`,
					{ credentials: "include" },
				);

				if (!response.ok) {
					if (response.status === 401) {
						setError("Faça login para ver sua galeria.");
						return;
					}
					throw new Error("Erro ao carregar imagens");
				}

				const data: ImagesResponse = await response.json();
				if (append) {
					setImages((prev) => [...prev, ...data.images]);
				} else {
					setImages(data.images);
				}
				setTotal(data.total);
				setPage(data.page);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Erro ao carregar imagens",
				);
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[],
	);

	useEffect(() => {
		if (!loadedRef.current) {
			loadedRef.current = true;
			fetchImages(1, false);
		}
	}, [fetchImages]);

	const handleLoadMore = () => {
		fetchImages(page + 1, true);
	};

	const hasMore = images.length < total;

	const formatDate = (iso: string) => {
		const date = new Date(iso);
		return date.toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	if (loading) {
		return (
			<div className="container mx-auto flex flex-col gap-6 px-4 py-6">
				<div>
					<h1 className="font-semibold text-xl">Galeria</h1>
					<p className="text-muted-foreground text-sm">
						Suas imagens geradas
					</p>
				</div>
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<Card key={i} size="sm">
							<Skeleton className="aspect-square w-full rounded-none" />
							<CardHeader>
								<Skeleton className="h-3 w-16" />
								<Skeleton className="h-3 w-24" />
							</CardHeader>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto flex flex-col items-center justify-center gap-4 px-4 py-20">
				<ImageIcon className="size-12 text-muted-foreground" />
				<p className="text-muted-foreground text-sm">{error}</p>
				{error === "Faça login para ver sua galeria." && (
					<Link
						to="/login"
						className="inline-flex h-8 items-center justify-center gap-1.5 rounded-none border border-border bg-background px-2.5 font-medium text-xs text-foreground hover:bg-muted"
					>
						Fazer login
					</Link>
				)}
			</div>
		);
	}

	if (images.length === 0) {
		return (
			<div className="container mx-auto flex flex-col items-center justify-center gap-4 px-4 py-20">
				<ImageIcon className="size-12 text-muted-foreground" />
				<h2 className="font-medium text-lg">Nenhuma imagem ainda</h2>
				<p className="text-muted-foreground text-sm">
					Suas imagens geradas aparecerão aqui.
				</p>
				<Link
					to="/studio"
					className="inline-flex h-9 items-center justify-center gap-1.5 rounded-none border border-transparent bg-primary px-2.5 font-medium text-xs text-primary-foreground"
				>
					<ImageIcon className="size-4" />
					Criar primeira imagem
				</Link>
			</div>
		);
	}

	return (
		<div className="container mx-auto flex flex-col gap-6 px-4 py-6">
			<div>
				<h1 className="font-semibold text-xl">Galeria</h1>
				<p className="text-muted-foreground text-sm">
					{total} {total === 1 ? "imagem" : "imagens"} geradas
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
				{images.map((image) => (
					<Card key={image.id} size="sm" className="overflow-hidden">
						<img
							src={image.url}
							alt={image.prompt}
							className="aspect-square w-full object-cover"
							loading="lazy"
						/>
						<CardHeader>
							<CardTitle className="text-xs">
								{STYLE_LABELS[image.style] ?? image.style}
							</CardTitle>
							<CardDescription>{formatDate(image.createdAt)}</CardDescription>
						</CardHeader>
					</Card>
				))}
			</div>

			{hasMore && (
				<div className="flex justify-center">
					<Button
						variant="outline"
						onClick={handleLoadMore}
						disabled={loadingMore}
					>
						{loadingMore ? "Carregando..." : "Carregar mais"}
					</Button>
				</div>
			)}
		</div>
	);
}
