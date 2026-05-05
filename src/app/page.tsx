"use client";

import { ExternalLink, Users, Loader2 } from "lucide-react";
import { useLinks } from "@/hooks/use-links";
import { usePresenceSessions } from "@/hooks/use-presence";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";

export default function Home() {
	const { data: links = [], isLoading: linksLoading } = useLinks(false);
	const { data: sessions = [], isLoading: sessionsLoading } =
		usePresenceSessions(false);
	const { data: settings = {} } = useSettings();

	const activeSession = sessions.find((s) => s.isActive);
	const showPresenceButton = !!activeSession && activeSession.isVisible;

	const siteTitle = settings["site_title"] || "Loading...";
	const siteSubtitle = settings["site_subtitle"] || "Loading...";

	return (
		<div className="relative min-h-screen text-white overflow-hidden bg-[#111827]">
			{/* Background Gradient Layer */}
			<div className="fixed inset-0 z-0">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-[#FF7F50]/20 via-[#111827] to-[#111827]"></div>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--tw-gradient-stops))] from-[#FF7F50]/10 via-transparent to-transparent"></div>
			</div>

			{/* Content Layer */}
			<div className="relative z-10 min-h-screen py-16 px-4 flex flex-col items-center overflow-y-auto">
				<div className="max-w-xl mx-auto flex flex-col items-center">
					{/* Profile Section */}
					<div className="mb-8 text-center">
						<div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-4 mx-auto border-4 border-white shadow-xl flex items-center justify-center overflow-hidden p-2">
							<img
								src="/logo.svg"
								alt="Logo"
								className="w-full h-full object-contain"
							/>
						</div>
						<h1 className="text-2xl font-bold">{siteTitle}</h1>
						<p className="text-gray-300 mt-2">{siteSubtitle}</p>
					</div>

					{/* Links Section */}
					<div className="w-full space-y-4">
						{/* Presence Link */}
						{linksLoading || sessionsLoading ? (
							<div className="flex justify-center py-10">
								<Loader2 className="h-10 w-10 animate-spin text-[#FF7F50]" />
							</div>
						) : (
							<>
								{showPresenceButton && (
									<Button
										asChild
										className="group w-full h-auto bg-white text-gray-900 p-4 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-between shadow-xl border-none"
									>
										<a href="/presence">
											<span className="font-bold text-lg flex items-center gap-2">
												<Users size={20} className="text-[#FF7F50]" />
												Absensi Kehadiran
											</span>
											<ExternalLink
												className="opacity-50 group-hover:opacity-100 transition-opacity"
												size={18}
											/>
										</a>
									</Button>
								)}

								{showPresenceButton && <div className="h-4"></div>}

								{links
									.filter((l) => l.isVisible)
									.map((link) => (
										<Button
											key={link.id}
											asChild
											className="group w-full h-auto flex text-black bg-white/90 backdrop-blur-md border border-white/80 p-4 rounded-xl hover:bg-white/70 transition-all duration-300 transform hover:scale-[1.02] items-center justify-between shadow-sm"
										>
											<a
												href={link.url}
												target="_blank"
												rel="noopener noreferrer"
											>
												<span className="font-semibold text-lg ">
													{link.title}
												</span>
												<ExternalLink
													className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500"
													size={18}
												/>
											</a>
										</Button>
									))}

								{links.filter((l) => l.isVisible).length === 0 &&
									!showPresenceButton && (
										<div className="text-center py-10 text-gray-400">
											No active links yet.
										</div>
									)}
							</>
						)}
					</div>

					{/* Footer */}
					<div className="mt-16 text-white text-sm text-center italic">
						Jangan Aneh2, Gunakan Data Semestinya Jangan Sampai Bocor!!!!!!!
					</div>
				</div>
			</div>
		</div>
	);
}
