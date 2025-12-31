"use client";

import { Vet } from "@/types/vet";
import { Phone, MapPin, Award, Activity, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface VetCardProps {
  vet: Vet & { reason?: string };
}

export function VetCard({ vet }: VetCardProps) {
  const address = vet["在 香 港 的 固 定 執 業 地 址 (如 適 用)"];
  const isEmergency = vet["緊急服務"] === "True";
  const services = vet["提供服務"]?.split(",").map(s => s.trim()) || [];
  const animals = vet["治療動物"]?.split(",").map(a => a.trim()) || [];

  // Placeholder images based on vet name hash or pet type
  const placeholderImg = animals.includes("貓貓") || animals.includes("cat") 
    ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400"
    : "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=400";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col h-full">
      <div className="relative h-40 w-full overflow-hidden">
        <img 
          src={placeholderImg} 
          alt="Vet placeholder" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-4">
          <p className="text-white font-bold text-sm tracking-wide uppercase">{vet["地區"]}</p>
        </div>
      </div>
      <div className="p-5 flex-1">
        {vet.reason && (
          <div className="mb-3 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            {vet.reason}
          </div>
        )}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {vet["姓 名"]}
            </h3>
            <p className="text-sm text-slate-500 font-medium">{vet["註 冊 編 號"]}</p>
          </div>
          {isEmergency && (
            <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-red-100 flex-shrink-0">
              <Activity className="w-3 h-3" />
              24H
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
            <span className="line-clamp-2">{address === "/" ? "No fixed address" : address}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4 flex-shrink-0 text-slate-400" />
            <span>{vet["電話號碼"] || "No phone listed"}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-slate-600">
            <Award className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
            <span className="line-clamp-2">{vet["學 歷"]}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {animals.map((animal) => (
            <span key={animal} className="bg-blue-50 text-blue-700 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">
              {animal}
            </span>
          ))}
          {services.map((service) => (
            <span key={service} className="bg-slate-100 text-slate-700 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">
              {service}
            </span>
          ))}
        </div>
      </div>
      
      <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
          Verified Vet
        </div>
        <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
          View Details →
        </button>
      </div>
    </div>
  );
}
