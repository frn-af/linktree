"use client";

import { useState } from "react";
import {
	Plus,
	Trash2,
	Edit2,
	Save,
	X,
	LogOut,
	Eye,
	EyeOff,
	Archive,
	Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
	useLinks,
	useCreateLink,
	useUpdateLink,
	useDeleteLink,
	type Link,
} from "@/hooks/use-links";
import { useSettings, useUpdateSetting } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminPage() {
	const [isAdding, setIsAdding] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [showArchived, setShowArchived] = useState(false);
	const [newLink, setNewLink] = useState({ title: "", url: "", order: 0 });
	const [editForm, setEditForm] = useState<Partial<Link>>({});
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

	// Settings State
	const [isEditingSettings, setIsEditingSettings] = useState(false);
	const [settingsForm, setSettingsForm] = useState({ title: "", subtitle: "" });

	const router = useRouter();

	const { data: links = [], isLoading } = useLinks(showArchived);
	const { data: settings = {} } = useSettings();
	const updateSetting = useUpdateSetting();
	const createLink = useCreateLink();
	const updateLink = useUpdateLink();
	const deleteLink = useDeleteLink();

	const handleLogout = async () => {
		await fetch("/api/auth/logout", { method: "POST" });
		router.push("/admin/login");
	};

	const handleAdd = async (e: React.FormEvent) => {
		e.preventDefault();
		createLink.mutate(
			{ ...newLink, order: links.length },
			{
				onSuccess: () => {
					setNewLink({ title: "", url: "", order: 0 });
					setIsAdding(false);
				},
			},
		);
	};

	const handleUpdate = async (id: string, updates?: Partial<Link>) => {
		updateLink.mutate(
			{ id, ...(updates || editForm) },
			{
				onSuccess: () => setEditingId(null),
			},
		);
	};

	const toggleVisibility = (link: Link) => {
		handleUpdate(link.id, { isVisible: !link.isVisible });
	};

	const toggleArchive = (link: Link) => {
		handleUpdate(link.id, { isArchived: !link.isArchived });
	};

	const startEditing = (link: Link) => {
		setEditingId(link.id);
		setEditForm(link);
	};

	const handleUpdateSettings = async (e: React.FormEvent) => {
		e.preventDefault();
		await updateSetting.mutateAsync({
			key: "site_title",
			value: settingsForm.title,
		});
		await updateSetting.mutateAsync({
			key: "site_subtitle",
			value: settingsForm.subtitle,
		});
		setIsEditingSettings(false);
	};

	const startEditingSettings = () => {
		setSettingsForm({
			title: settings["site_title"] || "Loading...",
			subtitle: settings["site_subtitle"] || "Loading...",
		});
		setIsEditingSettings(true);
	};

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
					<Button
						variant="destructive"
						onClick={handleLogout}
						className="flex items-center gap-2"
					>
						<LogOut size={18} /> Logout
					</Button>
				</div>

				{/* Navigation Tabs */}
				<div className="flex gap-4 mb-8">
					<Button
						asChild
						variant="default"
						className="bg-[#FF7F50] hover:bg-[#FF7F50]/90 rounded-full font-bold"
					>
						<a href="/admin">Links</a>
					</Button>
					<Button
						asChild
						variant="outline"
						className="bg-white text-gray-600 rounded-full font-bold"
					>
						<a href="/admin/presence">Presence</a>
					</Button>
				</div>

				{/* Site Settings Section */}
				<Card className="mb-8 border-indigo-100 shadow-md">
					<CardHeader className="pb-3">
						<div className="flex justify-between items-center">
							<div>
								<CardTitle className="text-xl">Page Settings</CardTitle>
								<CardDescription>
									Manage the main title and subtitle of your Linktree
								</CardDescription>
							</div>
							{!isEditingSettings && (
								<Button
									variant="outline"
									size="sm"
									onClick={startEditingSettings}
									className="flex items-center gap-2"
								>
									<Edit2 size={16} /> Edit Settings
								</Button>
							)}
						</div>
					</CardHeader>
					<CardContent>
						{isEditingSettings ? (
							<form onSubmit={handleUpdateSettings} className="space-y-4">
								<div className="grid grid-cols-1 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-medium">Site Title</label>
										<Input
											value={settingsForm.title}
											onChange={(e) =>
												setSettingsForm({
													...settingsForm,
													title: e.target.value,
												})
											}
											placeholder="Main Title"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium">Subtitle</label>
										<Input
											value={settingsForm.subtitle}
											onChange={(e) =>
												setSettingsForm({
													...settingsForm,
													subtitle: e.target.value,
												})
											}
											placeholder="Subtitle"
										/>
									</div>
								</div>
								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="ghost"
										onClick={() => setIsEditingSettings(false)}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={updateSetting.isPending}>
										{updateSetting.isPending && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										Save Settings
									</Button>
								</div>
							</form>
						) : (
							<div className="space-y-2">
								<div className="grid grid-cols-3 py-2 border-b border-gray-50">
									<span className="text-sm font-bold text-gray-500">Title</span>
									<span className="col-span-2 text-sm text-gray-900 font-semibold">
										{settings["site_title"] ||
											"Lokakarya Monitoring RPJP dan Penyusunan RPJPn KSA/KPA"}
									</span>
								</div>
								<div className="grid grid-cols-3 py-2">
									<span className="text-sm font-bold text-gray-500">
										Subtitle
									</span>
									<span className="col-span-2 text-sm text-gray-600">
										{settings["site_subtitle"] ||
											"Lingkup Balai Besar KSDA Papua Barat Daya"}
									</span>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				<div className="flex justify-between items-center mb-6">
					<div className="space-y-1">
						<h2 className="text-xl font-bold text-gray-800">
							Additional Links
						</h2>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="show-archived"
								checked={showArchived}
								onCheckedChange={(checked) => setShowArchived(!!checked)}
							/>
							<label
								htmlFor="show-archived"
								className="text-sm text-gray-600 cursor-pointer"
							>
								Show Archived Links
							</label>
						</div>
					</div>
					<Button
						onClick={() => setIsAdding(true)}
						className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
					>
						<Plus size={20} /> Add New Link
					</Button>
				</div>

				{isAdding && (
					<form
						onSubmit={handleAdd}
						className="bg-white p-6 rounded-xl shadow-md mb-8 space-y-4"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Input
								placeholder="Title"
								value={newLink.title}
								onChange={(e) =>
									setNewLink({ ...newLink, title: e.target.value })
								}
								required
							/>
							<Input
								type="url"
								placeholder="URL"
								value={newLink.url}
								onChange={(e) =>
									setNewLink({ ...newLink, url: e.target.value })
								}
								required
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="ghost"
								onClick={() => setIsAdding(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={createLink.isPending}>
								{createLink.isPending && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Save Link
							</Button>
						</div>
					</form>
				)}

				<div className="bg-white rounded-xl shadow-sm border overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="bg-gray-50/50">
								<TableHead className="px-6 py-4 font-bold text-gray-700">
									Title
								</TableHead>
								<TableHead className="hidden md:table-cell px-6 py-4 font-bold text-gray-700">
									URL
								</TableHead>
								<TableHead className="text-right px-6 py-4 font-bold text-gray-700">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={3} className="text-center py-10">
										<Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
									</TableCell>
								</TableRow>
							) : links.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={3}
										className="text-center py-10 text-gray-500"
									>
										No links found.
									</TableCell>
								</TableRow>
							) : (
								links.map((link) => (
									<TableRow
										key={link.id}
										className={`${link.isArchived ? "opacity-60 bg-gray-50" : ""} hover:bg-gray-50/50 transition-colors`}
									>
										<TableCell className="px-6 py-4">
											{editingId === link.id ? (
												<Input
													value={editForm.title}
													onChange={(e) =>
														setEditForm({ ...editForm, title: e.target.value })
													}
													className="h-9"
												/>
											) : (
												<div>
													<div className="font-semibold text-gray-800 flex items-center gap-2">
														{link.title}
														{link.isArchived && (
															<span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
																Archived
															</span>
														)}
														{!link.isVisible && (
															<span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
																Hidden
															</span>
														)}
													</div>
												</div>
											)}
										</TableCell>
										<TableCell className="hidden md:table-cell px-6 py-4">
											{editingId === link.id ? (
												<Input
													type="url"
													value={editForm.url}
													onChange={(e) =>
														setEditForm({ ...editForm, url: e.target.value })
													}
													className="h-9"
												/>
											) : (
												<span className="text-sm text-gray-500 truncate max-w-xs block">
													{link.url}
												</span>
											)}
										</TableCell>
										<TableCell className="text-right px-6 py-4">
											<div className="flex items-center justify-end gap-1">
												{editingId === link.id ? (
													<>
														<Button
															size="icon"
															variant="ghost"
															className="text-green-600"
															onClick={() => handleUpdate(link.id)}
															disabled={updateLink.isPending}
														>
															{updateLink.isPending ? (
																<Loader2 className="h-4 w-4 animate-spin" />
															) : (
																<Save size={18} />
															)}
														</Button>
														<Button
															size="icon"
															variant="ghost"
															className="text-gray-400"
															onClick={() => setEditingId(null)}
														>
															<X size={18} />
														</Button>
													</>
												) : (
													<>
														<Button
															size="icon"
															variant="ghost"
															onClick={() => toggleVisibility(link)}
															disabled={updateLink.isPending}
															className={
																link.isVisible
																	? "text-indigo-600"
																	: "text-gray-400"
															}
														>
															{link.isVisible ? (
																<Eye size={18} />
															) : (
																<EyeOff size={18} />
															)}
														</Button>
														<Button
															size="icon"
															variant="ghost"
															className="text-blue-600"
															onClick={() => startEditing(link)}
														>
															<Edit2 size={18} />
														</Button>
														<Button
															size="icon"
															variant="ghost"
															onClick={() => toggleArchive(link)}
															disabled={updateLink.isPending}
															className={
																link.isArchived
																	? "text-orange-600"
																	: "text-gray-400"
															}
														>
															<Archive size={18} />
														</Button>
														<Button
															size="icon"
															variant="ghost"
															className="text-red-600"
															onClick={() => setDeleteConfirmId(link.id)}
														>
															<Trash2 size={18} />
														</Button>
													</>
												)}
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			<AlertDialog
				open={!!deleteConfirmId}
				onOpenChange={(open) => !open && setDeleteConfirmId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							link from the database.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() =>
								deleteConfirmId && deleteLink.mutate(deleteConfirmId)
							}
							className="bg-red-600 hover:bg-red-700"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
