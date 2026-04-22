"use client";

import { Dithering } from "@paper-design/shaders-react";
import { ExternalLink, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface Link {
  id: string;
  title: string;
  url: string;
  order: number;
}

export default function Home() {
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    async function fetchLinks() {
      const res = await fetch("/api/links");
      const data = await res.json();
      setLinks(data.sort((a: Link, b: Link) => a.order - b.order));
    }
    fetchLinks();
  }, []);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Background Shader Layer */}
      <div className="fixed inset-0 z-0">
        <Dithering
          style={{ width: "100%", height: "100%" }}
          colorFront="#FF7F50"
          colorBack="#111827"
          shape="simplex"
          type="random"
          speed={0.5}
          scale={1.5}
        />
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
            <h1 className="text-2xl font-bold">
              Lokakarya Monitoring RPJP dan Penyusunan RPJPn KSA/KPA
            </h1>
            <p className="text-gray-300 mt-2">
              Lingkup Balai Besar KSDA Papua Barat Daya
            </p>
          </div>

          {/* Links Section */}
          <div className="w-full space-y-4">
            {/* Presence Link */}
            <a
              href="/presence"
              className="group block w-full bg-white text-gray-900 p-4 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-between shadow-xl"
            >
              <span className="font-bold text-lg flex items-center gap-2">
                <Users size={20} className="text-[#FF7F50]" />
                Absensi Kehadiran
              </span>
              <ExternalLink
                className="opacity-50 group-hover:opacity-100 transition-opacity"
                size={18}
              />
            </a>

            <div className="h-4"></div>

            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block w-full bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-between"
              >
                <span className="font-semibold text-lg">{link.title}</span>
                <ExternalLink
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  size={18}
                />
              </a>
            ))}

            {links.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                No extra links yet.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-16 text-gray-400 text-sm text-center italic">
            Jangan Aneh2 Gunakan Data Semestinya Jangan Sampai Bocor!!!!!!!
          </div>
        </div>
      </div>
    </div>
  );
}
