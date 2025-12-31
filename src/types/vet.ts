export interface Vet {
  "姓 名": string;
  "註 冊 編 號": string;
  "註 冊 日 期(日/月/年)": string;
  "在 香 港 的 固 定 執 業 地 址 (如 適 用)": string;
  "學 歷": string;
  "年 份": string;
  "最 近 達 到 持 續 專 業 發 展 計 劃 要 求 的 日 期(日/月/年)": string;
  "診所類型": string;
  "治療動物": string;
  "提供服務": string;
  "地區": string;
  "診所規模": string;
  "緊急服務": string;
  "有固定地址": string;
  "電話號碼": string;
  "專業分數": string;
  "服務多樣性": string;
}

export interface RecommendationQuery {
  district?: string;
  animalType?: string;
  serviceType?: string;
  isEmergency?: boolean;
  searchQuery?: string;
}
