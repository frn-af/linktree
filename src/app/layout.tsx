import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

const barlow = Barlow({
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	variable: "--font-barlow",
});

export async function generateMetadata() {
	const allSettings = await db.select().from(settings);
	const settingsMap = allSettings.reduce(
		(acc, curr) => {
			acc[curr.key] = curr.value;
			return acc;
		},
		{} as Record<string, string>,
	);

	const title = settingsMap["site_title"] || "Loading...";
	const description = settingsMap["site_subtitle"] || "Loading...";

	return {
		title,
		description,
		icons: {
			icon: [
				{ url: "/favicon/favicon.ico" },
				{
					url: "/favicon/favicon-96x96.png",
					sizes: "96x96",
					type: "image/png",
				},
				{ url: "/favicon/favicon.svg", type: "image/svg+xml" },
			],
			apple: [
				{
					url: "/favicon/apple-touch-icon.png",
					sizes: "180x180",
					type: "image/png",
				},
			],
		},
		manifest: "/favicon/site.webmanifest",
	};
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${barlow.variable} h-full antialiased`}>
			<body className="min-h-full flex flex-col">
				<QueryProvider>
					{children}
					<Toaster position="top-center" />
				</QueryProvider>
			</body>
		</html>
	);
}
