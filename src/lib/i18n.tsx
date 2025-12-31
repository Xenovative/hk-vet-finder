"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'tc';

interface Translations {
  [key: string]: {
    en: string;
    tc: string;
  };
}

const translations: Translations = {
  hero_title: {
    en: "Find the Right Vet for your Pet",
    tc: "為您的寵物尋找合適的獸醫"
  },
  hero_subtitle: {
    en: "Smart Recommendations for HK Pet Owners",
    tc: "為香港寵物主人提供智能推薦"
  },
  i_have_a: {
    en: "I have a:",
    tc: "我有一隻："
  },
  dog: {
    en: "Dog",
    tc: "狗狗"
  },
  cat: {
    en: "Cat",
    tc: "貓貓"
  },
  exotic: {
    en: "Exotic",
    tc: "特殊動物"
  },
  search_placeholder: {
    en: "Explain your pet's situation (e.g., 'My cat is vomiting and I'm in Central')...",
    tc: "請描述您寵物的情況（例如：「我的貓貓正在嘔吐，我住在中環」）..."
  },
  nl_input_label: {
    en: "What's happening with your pet?",
    tc: "您的寵物怎麼了？"
  },
  find_vets_btn: {
    en: "Find the Best Match",
    tc: "尋找最合適的獸醫"
  },
  all_districts: {
    en: "All Districts",
    tc: "所有地區"
  },
  search_btn: {
    en: "Search",
    tc: "搜尋"
  },
  emergency_only: {
    en: "24H Emergency Only",
    tc: "僅限24小時急診"
  },
  more_filters: {
    en: "More Filters",
    tc: "更多篩選"
  },
  recommended_vets: {
    en: "Recommended Veterinarians",
    tc: "推薦獸醫"
  },
  results_count: {
    en: "Showing {count} results",
    tc: "顯示 {count} 個結果"
  },
  ask_ai_finder: {
    en: "Ask AI Finder",
    tc: "諮詢 AI 助手"
  },
  no_vets_found: {
    en: "No veterinarians found",
    tc: "找不到相關獸醫"
  },
  try_adjusting: {
    en: "Try adjusting your search terms or filters.",
    tc: "請嘗試調整您的搜尋詞或篩選條件。"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('tc');

  const t = (key: string, params?: Record<string, any>) => {
    let text = translations[key]?.[language] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v.toString());
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
