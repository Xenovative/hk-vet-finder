"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Filter, Sparkles, MessageSquare, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Vet } from "@/types/vet";
import { VetCard } from "@/components/vet/VetCard";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useTranslation } from "@/lib/i18n";
import { findRecommendedVets } from "@/lib/ai/recommendation";
import vetData from "@/data/vets.json";
import ReactMarkdown from "react-markdown";

const districts = [
  "中西區", "灣仔區", "東區", "南區",
  "油尖旺區", "深水埗區", "九龍城區", "黃大仙區", "觀塘區",
  "荃灣區", "屯門區", "元朗區", "北區", "大埔區", "沙田區", "西貢區", "葵青區", "離島區"
];

export default function Home() {
  const { t, language, setLanguage } = useTranslation();
  const [vets, setVets] = useState<Vet[]>([]);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [petType, setPetType] = useState<string>("dog");
  const [isEmergencyOnly, setIsEmergencyOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    // Initial load
    setVets(vetData as any as Vet[]);
    setIsLoading(false);
  }, []);

  // Simulate AI matching process when search term changes
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      setIsMatching(true);
      const timer = setTimeout(() => setIsMatching(false), 600);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const handleAskAI = () => {
    setIsChatOpen(true);
  };

  const handleFindVets = async () => {
    if (!searchTerm.trim()) return;
    
    setIsMatching(true);
    setAiResponse(""); // Clear previous response
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: searchTerm,
          petType,
          language
        }),
      });
      const data = await response.json();
      if (data.recommendations) {
        setVets(data.recommendations);
      }
      if (data.text) {
        setAiResponse(data.text);
      }
    } catch (error) {
      console.error("AI Search Error:", error);
    } finally {
      setIsMatching(false);
    }
  };

  const filteredVets = searchTerm.trim() !== "" && !isMatching
    ? findRecommendedVets(searchTerm + (selectedDistrict ? ` ${selectedDistrict}` : ""), 40)
    : (vets.length > 0 ? vets : (vetData as any as Vet[]).filter((vet: Vet) => {
        const matchesDistrict = selectedDistrict === "" || vet["地區"] === selectedDistrict;
        const matchesEmergency = !isEmergencyOnly || vet["緊急服務"] === "True";
        const treatAnimals = (vet["治療動物"] || "").toLowerCase();
        const matchesPet = treatAnimals.includes(petType.toLowerCase()) || treatAnimals.includes("所有動物");
        return matchesDistrict && matchesEmergency && matchesPet;
      }).slice(0, 40));

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Navbar with Language Switcher */}
      <nav className="bg-white border-b border-slate-100 py-4 px-6 relative z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">HKVetFinder</span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setLanguage('en')}
              className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", language === 'en' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('tc')}
              className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", language === 'tc' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              繁中
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200 relative overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03]">
          <img 
            src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=2000" 
            alt="Pet background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-100 shadow-sm">
              <Sparkles className="w-4 h-4" />
              {t('hero_subtitle')}
            </div>
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight sm:text-7xl leading-[1.1]">
              {t('hero_title')}
            </h1>
            
            {/* Pet Profile Selector */}
            <div className="flex flex-col items-center gap-4 mt-10">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">{t('i_have_a')}</span>
              <div className="flex bg-slate-50 p-2 rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full">
                {[
                  { id: "dog", label: t('dog'), emoji: "🐶", img: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=100&h=100" },
                  { id: "cat", label: t('cat'), emoji: "🐱", img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=100&h=100" },
                  { id: "exotic", label: t('exotic'), emoji: "🦜", img: "https://images.unsplash.com/photo-1452857297128-d9c29adba80b?auto=format&fit=crop&q=80&w=100&h=100" }
                ].map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setPetType(pet.id)}
                    className={cn(
                      "flex-1 px-4 py-4 rounded-2xl text-sm font-bold transition-all flex flex-col items-center gap-3",
                      petType === pet.id 
                        ? "bg-white text-blue-600 shadow-lg scale-[1.05] ring-1 ring-slate-100" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                    )}
                  >
                    <div className="relative">
                      <img src={pet.img} alt={pet.label} className={cn("w-12 h-12 rounded-full object-cover border-2 transition-all", petType === pet.id ? "border-blue-500" : "border-transparent grayscale opacity-50")} />
                      {petType === pet.id && <span className="absolute -bottom-1 -right-1 bg-blue-600 text-[10px] p-0.5 rounded-full border-2 border-white">✅</span>}
                    </div>
                    {pet.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Natural Language Search Bar */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-white p-3 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col gap-3">
              <div className="relative flex-1">
                <div className="absolute left-6 top-6 text-blue-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <textarea
                  rows={2}
                  placeholder={t('search_placeholder')}
                  className="w-full pl-16 pr-6 py-5 rounded-[2rem] text-slate-900 border-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-xl font-medium resize-none leading-relaxed placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-center px-4 pb-2">
                <div className="flex gap-2">
                  <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedDistrict || t('all_districts')}
                  </button>
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors group">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-4 h-4"
                      checked={isEmergencyOnly}
                      onChange={(e) => setIsEmergencyOnly(e.target.checked)}
                    />
                    <span className="text-xs font-bold text-slate-600">{t('emergency_only')}</span>
                  </label>
                </div>
                <button 
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center gap-2"
                  onClick={handleFindVets}
                >
                  <Sparkles className="w-5 h-5" />
                  {t('find_vets_btn')}
                </button>
              </div>
            </div>

            {/* Quick Context Chips */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {[
                { label: language === 'en' ? "My cat is vomiting 🤮" : "我的貓貓正在嘔吐 🤮", query: "cat vomiting" },
                { label: language === 'en' ? "Puppy checkup 🐕" : "幼犬檢查 🐕", query: "puppy checkup" },
                { label: language === 'en' ? "Emergency in Central 🚨" : "中環急診 🚨", query: "emergency central" },
                { label: language === 'en' ? "Skin allergy 🧴" : "皮膚過敏 🧴", query: "skin allergy" },
              ].map((chip) => (
                <button
                  key={chip.query}
                  onClick={() => setSearchTerm(chip.label.split(' ').slice(0, -1).join(' '))}
                  className="px-4 py-2 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm text-slate-500 text-xs font-bold hover:border-blue-300 hover:text-blue-600 transition-all hover:shadow-sm"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              {isMatching ? (
                <span className="flex items-center gap-2 animate-pulse text-blue-600">
                  <Sparkles className="w-6 h-6" />
                  {language === 'en' ? 'AI is matching...' : 'AI 正在匹配...'}
                </span>
              ) : (
                selectedDistrict ? `${selectedDistrict} ${t('recommended_vets')}` : t('recommended_vets')
              )}
            </h2>
            <p className="text-slate-500 mt-2 font-medium bg-slate-100 inline-block px-3 py-1 rounded-lg text-sm">
              {isMatching ? '...' : t('results_count', { count: filteredVets.length })}
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleAskAI}
              className="w-full sm:w-auto bg-slate-900 text-white px-6 py-4 rounded-[1.25rem] text-sm font-black flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all hover:translate-y-[-2px] active:translate-y-0"
            >
              <MessageSquare className="w-5 h-5" />
              {t('ask_ai_finder')}
            </button>
          </div>
        </div>

        {/* AI Diagnostic Assessment Box */}
        {aiResponse && !isMatching && (
          <div className="mb-12 bg-white rounded-[2.5rem] border border-blue-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-blue-600 px-8 py-4 flex items-center gap-3 text-white">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-black text-lg tracking-tight">AI Assistant Assessment</h3>
            </div>
            <div className="p-8">
              <div className="prose prose-blue max-w-none text-slate-700 font-medium leading-relaxed">
                <ReactMarkdown>{aiResponse}</ReactMarkdown>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                Medical Disclaimer: Not a substitute for professional veterinary advice.
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] h-[400px] animate-pulse border border-slate-100 shadow-sm"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredVets.map((vet) => (
              <VetCard key={vet["註 冊 編 號"]} vet={vet} />
            ))}
          </div>
        )}

        {filteredVets.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">{t('no_vets_found')}</h3>
            <p className="text-slate-500 font-medium">{t('try_adjusting')}</p>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <ChatInterface 
        petType={petType} 
        isOpen={isChatOpen} 
        setIsOpen={setIsChatOpen} 
        initialMessage={searchTerm}
      />
    </main>
  );
}
