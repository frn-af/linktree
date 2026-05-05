import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Link {
	id: string;
	title: string;
	url: string;
	order: number;
	isVisible: boolean;
	isArchived: boolean;
	createdAt: string;
}

export function useLinks(showAll: boolean = false) {
	return useQuery<Link[]>({
		queryKey: ["links", showAll],
		queryFn: async () => {
			const res = await fetch(`/api/links${showAll ? "?all=true" : ""}`);
			if (!res.ok) throw new Error("Failed to fetch links");
			return res.json();
		},
	});
}

export function useCreateLink() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (newLink: Partial<Link>) => {
			const res = await fetch("/api/links", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newLink),
			});
			if (!res.ok) throw new Error("Failed to create link");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["links"] });
			toast.success("Link created successfully");
		},
		onError: () => {
			toast.error("Failed to create link");
		},
	});
}

export function useUpdateLink() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (updatedLink: Partial<Link> & { id: string }) => {
			const res = await fetch("/api/links", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updatedLink),
			});
			if (!res.ok) throw new Error("Failed to update link");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["links"] });
			toast.success("Link updated successfully");
		},
		onError: () => {
			toast.error("Failed to update link");
		},
	});
}

export function useDeleteLink() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/links?id=${id}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Failed to delete link");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["links"] });
			toast.success("Link deleted permanently");
		},
		onError: () => {
			toast.error("Failed to delete link");
		},
	});
}
