import { Vet } from "@/types/vet";
import vetData from "@/data/vets.json";

export interface RecommendedVet extends Vet {
  reason: string;
}

export function findRecommendedVets(query: string, limit = 5): RecommendedVet[] {
  const vets = vetData as any as Vet[];
  const lowerQuery = query.toLowerCase();

  // Basic scoring mechanism
  const scoredVets = vets.map(vet => {
    let score = 0;
    let reasons: string[] = [];
    const name = (vet["姓 名"] || "").toLowerCase();
    const address = (vet["在 香 港 的 固 定 執 業 地 址 (如 適 用)"] || "").toLowerCase();
    const services = (vet["提供服務"] || "").toLowerCase();
    const district = (vet["地區"] || "").toLowerCase();
    const treatAnimals = (vet["治療動物"] || "").toLowerCase();

    // Direct matches
    if (name.includes(lowerQuery)) {
      score += 50;
      reasons.push("Name match");
    }
    if (address.includes(lowerQuery)) {
      score += 30;
      reasons.push("Location match");
    }
    if (district.includes(lowerQuery)) {
      score += 40;
      reasons.push(`Located in ${vet["地區"]}`);
    }
    
    // Symptom and Specialization mapping
    const medicalKeywords = {
      emergency: ["vomiting", "bleeding", "accident", "emergency", "unconscious", "急診", "流血", "意外", "嘔吐", "24小時"],
      surgery: ["bone", "fracture", "limping", "surgery", "surgical", "tumor", "骨折", "手術", "外科", "腫瘤"],
      exotic: ["bird", "rabbit", "hamster", "reptile", "exotic", "鳥", "兔", "倉鼠", "爬蟲", "特殊"],
      skin: ["itchy", "skin", "allergy", "rash", "皮膚", "過敏", "發癢"]
    };

    if (Object.values(medicalKeywords.emergency).some(k => lowerQuery.includes(k)) && vet["緊急服務"] === "True") {
      score += 100;
      reasons.push("24/7 Emergency Support");
    }

    if (Object.values(medicalKeywords.surgery).some(k => lowerQuery.includes(k)) && services.includes("外科")) {
      score += 80;
      reasons.push("Surgical Specialist");
    }

    if (Object.values(medicalKeywords.exotic).some(k => lowerQuery.includes(k)) && treatAnimals.includes("特殊")) {
      score += 80;
      reasons.push("Exotic Animal Specialist");
    }

    // Experience scoring (based on registration year)
    const regDate = vet["註 冊 日 期(日/月/年)"];
    if (regDate && regDate.includes("/")) {
      const year = parseInt(regDate.split("/").pop() || "0");
      if (year > 0) {
        const fullYear = year < 50 ? 2000 + year : 1900 + year;
        const yearsExp = new Date().getFullYear() - fullYear;
        if (yearsExp > 15) {
          score += 30;
          reasons.push("Highly experienced (15+ years)");
        }
      }
    }

    // Keyword matching
    const keywords = lowerQuery.split(/\s+/);
    keywords.forEach(keyword => {
      if (keyword.length < 2) return;
      if (name.includes(keyword) || address.includes(keyword) || services.includes(keyword)) {
        score += 5;
      }
    });

    return { 
      vet: { 
        ...vet, 
        reason: reasons.length > 0 ? reasons.join(", ") : "Matches your search criteria" 
      } as RecommendedVet, 
      score 
    };
  });

  return scoredVets
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.vet);
}
