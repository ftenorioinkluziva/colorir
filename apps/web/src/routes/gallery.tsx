import { env } from "@colorir/env/web";
import { Button } from "@colorir/ui/components/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@colorir/ui/components/card";
import { Checkbox } from "@colorir/ui/components/checkbox";
import { Skeleton } from "@colorir/ui/components/skeleton";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ImageIcon, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import PdfPreview from "@/components/pdf-preview";

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

	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [deleting, setDeleting] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [showPreview, setShowPreview] = useState(false);

	const fetchImages = useCallback(async (pageNum: number, append: boolean) => {
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
			setError(err instanceof Error ? err.message : "Erro ao carregar imagens");
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	}, []);

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

	const someSelected = selectedIds.size > 0;
	const allVisibleSelected = images.every((img) => selectedIds.has(img.id));

	const toggleSelect = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const toggleSelectAll = () => {
		if (allVisibleSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(images.map((img) => img.id)));
		}
	};

	const handleDelete = useCallback(async () => {
		const ids = Array.from(selectedIds);
		if (ids.length === 0) return;

		setDeleting(true);
		try {
			const response = await fetch(`${env.VITE_SERVER_URL}/api/images`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ids }),
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Erro ao excluir imagens");
			}

			const data = await response.json();
			setImages((prev) => prev.filter((img) => !ids.includes(img.id)));
			setTotal((prev) => prev - data.deleted);
			setSelectedIds(new Set());
			setConfirmDelete(false);
			toast.success(`${data.deleted} imagem(ns) excluída(s)`);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Erro ao excluir imagens",
			);
		} finally {
			setDeleting(false);
		}
	}, [selectedIds]);

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
					<p className="text-muted-foreground text-sm">Suas imagens geradas</p>
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
						className="inline-flex h-8 items-center justify-center gap-1.5 rounded-none border border-border bg-background px-2.5 font-medium text-foreground text-xs hover:bg-muted"
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
					className="inline-flex h-9 items-center justify-center gap-1.5 rounded-none border border-transparent bg-primary px-2.5 font-medium text-primary-foreground text-xs"
				>
					<ImageIcon className="size-4" />
					Criar primeira imagem
				</Link>
			</div>
		);
	}

	return (
		<div className="container mx-auto flex flex-col gap-6 px-4 py-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-semibold text-xl">Galeria</h1>
					<p className="text-muted-foreground text-sm">
						{total} {total === 1 ? "imagem" : "imagens"} geradas
					</p>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<div className="flex cursor-pointer items-center gap-2">
					<Checkbox
						checked={allVisibleSelected && someSelected}
						onCheckedChange={toggleSelectAll}
						aria-label={
							allVisibleSelected && someSelected
								? "Limpar seleção"
								: "Selecionar todos"
						}
					/>
					<span className="text-muted-foreground text-xs">
						{allVisibleSelected && someSelected
							? "Limpar seleção"
							: "Selecionar todos"}
					</span>
				</div>
			</div>

			{someSelected && (
				<div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2">
					<span className="text-muted-foreground text-xs">
						{selectedIds.size} {selectedIds.size === 1 ? "item" : "itens"}{" "}
						selecionado{selectedIds.size !== 1 ? "s" : ""}
					</span>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="xs"
							onClick={() => setShowPreview(true)}
						>
							Exportar PDF
						</Button>
						<Button
							variant="destructive"
							size="xs"
							disabled={deleting}
							onClick={() => setConfirmDelete(true)}
						>
							{deleting ? (
								<Loader2 className="size-3 animate-spin" />
							) : (
								<Trash2 className="size-3" />
							)}
							Excluir selecionados
						</Button>
					</div>
				</div>
			)}

			{confirmDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="w-full max-w-sm rounded-lg border bg-popover p-6 shadow-lg">
						<h3 className="font-medium text-sm">Excluir imagens</h3>
						<p className="mt-2 text-muted-foreground text-xs">
							Tem certeza? Esta ação não pode ser desfeita.
						</p>
						<div className="mt-4 flex justify-end gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={deleting}
								onClick={() => setConfirmDelete(false)}
							>
								Cancelar
							</Button>
							<Button
								variant="destructive"
								size="sm"
								disabled={deleting}
								onClick={handleDelete}
							>
								{deleting ? "Excluindo..." : "Excluir"}
							</Button>
						</div>
					</div>
				</div>
			)}

			<PdfPreview
				images={images.filter((img) => selectedIds.has(img.id))}
				open={showPreview}
				onClose={() => setShowPreview(false)}
			/>

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
				{images.map((image) => (
					<Card key={image.id} size="sm" className="relative overflow-hidden">
						<div className="absolute top-2 left-2 z-10">
							<Checkbox
								checked={selectedIds.has(image.id)}
								onCheckedChange={() => toggleSelect(image.id)}
							/>
						</div>
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
