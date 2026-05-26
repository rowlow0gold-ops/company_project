// Tiny i18n helper. Server-side translation lookups for nav, headings,
// and per-route data. Pairs with Astro's built-in i18n routing
// (configured in astro.config.mjs).

export type Lang = "ko" | "en";

export const SUPPORTED_LANGS: Lang[] = ["ko", "en"];
export const DEFAULT_LANG: Lang = "ko";

/** Detect the active language from a request URL pathname. */
export function detectLang(pathname: string): Lang {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ko";
}

/** Convenience: read lang straight from Astro.url. */
export function getLang(url: URL): Lang {
  return detectLang(url.pathname);
}

/** Strip the locale prefix to get the canonical path (e.g. /en/about -> /about). */
export function canonicalPath(pathname: string): string {
  if (pathname === "/en" || pathname === "/en/") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  return pathname;
}

/** Build the URL for the same page in the other language. */
export function switchLangHref(pathname: string, target: Lang): string {
  const canonical = canonicalPath(pathname);
  if (target === "ko") return canonical;
  // target === "en"
  return canonical === "/" ? "/en/" : "/en" + canonical;
}

/** Localize an internal route. */
export function localizePath(path: string, lang: Lang): string {
  if (lang === "ko") return path;
  if (path === "/") return "/en/";
  return "/en" + path;
}

/* ---------- UI strings ---------- */

export const UI_STRINGS = {
  ko: {
    inquiry_btn: "문의하기",
    nav_about: "About",
    nav_services: "Services",
    nav_news: "News & Media",
    nav_careers: "Careers",
    nav_contact: "Contact",
    theme_dark: "Dark",
    theme_light: "Light",
    lang_label: "언어",
    menu_open: "메뉴 열기",
    theme_toggle: "테마 전환",
    scroll_cue: "Scroll",
    // section labels
    services_section_title: "기획부터 운영까지,\n전 주기를 책임지는 SI 파트너.",
    services_section_eyebrow: "Services",
    services_section_cta: "전체 서비스 보기",
    news_section_title: "최근 소식.",
    news_section_eyebrow: "News & Media",
    news_section_cta: "모든 소식 보기",
    cta_primary_secondary: "프로젝트 문의",
    learn_more: "더 알아보기",
    read_more: "자세히 보기",
    // footer
    footer_company: "Company",
    footer_contact: "Contact",
    footer_policy: "Policy",
    footer_inquiry: "Inquiry",
    footer_about: "About",
    footer_services: "Services",
    footer_news: "News & Media",
    footer_careers: "Careers",
    footer_terms: "이용약관",
    footer_privacy: "개인정보처리방침",
    footer_email_policy: "이메일무단수집거부",
    footer_ceo: "대표",
    footer_biz_reg: "사업자등록번호",
    footer_hq: "본사",
    footer_branch: "대구지사",
    footer_rights: "All rights reserved.",
    // contact
    contact_form_company: "회사명 / Company",
    contact_form_owner: "담당자 / Contact",
    contact_form_email: "이메일 / Email",
    contact_form_phone: "연락처 / Phone",
    contact_form_message: "문의 내용 / Message",
    contact_form_submit: "보내기",
    contact_email_label: "Email",
    contact_phone_label: "Phone",
  },
  en: {
    inquiry_btn: "Get in touch",
    nav_about: "About",
    nav_services: "Services",
    nav_news: "News & Media",
    nav_careers: "Careers",
    nav_contact: "Contact",
    theme_dark: "Dark",
    theme_light: "Light",
    lang_label: "Language",
    menu_open: "Open menu",
    theme_toggle: "Toggle theme",
    scroll_cue: "Scroll",
    services_section_title: "From planning to operations —\nan SI partner for every stage.",
    services_section_eyebrow: "Services",
    services_section_cta: "View all services",
    news_section_title: "Latest news.",
    news_section_eyebrow: "News & Media",
    news_section_cta: "View all news",
    cta_primary_secondary: "Project inquiry",
    learn_more: "Learn more",
    read_more: "Read more",
    footer_company: "Company",
    footer_contact: "Contact",
    footer_policy: "Policy",
    footer_inquiry: "Inquiry",
    footer_about: "About",
    footer_services: "Services",
    footer_news: "News & Media",
    footer_careers: "Careers",
    footer_terms: "Terms of Service",
    footer_privacy: "Privacy Policy",
    footer_email_policy: "No unsolicited email",
    footer_ceo: "CEO",
    footer_biz_reg: "Reg. No.",
    footer_hq: "HQ",
    footer_branch: "Daegu",
    footer_rights: "All rights reserved.",
    contact_form_company: "Company",
    contact_form_owner: "Contact name",
    contact_form_email: "Email",
    contact_form_phone: "Phone",
    contact_form_message: "Message",
    contact_form_submit: "Send",
    contact_email_label: "Email",
    contact_phone_label: "Phone",
  },
} as const;

export type UIKey = keyof typeof UI_STRINGS["ko"];

export function t(lang: Lang, key: UIKey): string {
  return UI_STRINGS[lang][key];
}

/* ---------- Per-language data ---------- */

import siteKo from "../data/site.json";
import siteEn from "../data/en/site.json";
import homeKo from "../data/home.json";
import homeEn from "../data/en/home.json";
import servicesKo from "../data/services.json";
import servicesEn from "../data/en/services.json";
import newsKo from "../data/news.json";
import newsEn from "../data/en/news.json";
import aboutKo from "../data/about.json";
import aboutEn from "../data/en/about.json";
import careersKo from "../data/careers.json";
import careersEn from "../data/en/careers.json";
import servicesPageKo from "../data/services_page.json";
import servicesPageEn from "../data/en/services_page.json";
import newsPageKo from "../data/news_page.json";
import newsPageEn from "../data/en/news_page.json";
import contactPageKo from "../data/contact_page.json";
import contactPageEn from "../data/en/contact_page.json";

export function getSite(lang: Lang)         { return lang === "en" ? siteEn : siteKo; }
export function getHome(lang: Lang)         { return lang === "en" ? homeEn : homeKo; }
export function getServices(lang: Lang)     { return lang === "en" ? servicesEn : servicesKo; }
export function getNews(lang: Lang)         { return lang === "en" ? newsEn : newsKo; }
export function getAbout(lang: Lang)        { return lang === "en" ? aboutEn : aboutKo; }
export function getCareers(lang: Lang)      { return lang === "en" ? careersEn : careersKo; }
export function getServicesPage(lang: Lang) { return lang === "en" ? servicesPageEn : servicesPageKo; }
export function getNewsPage(lang: Lang)     { return lang === "en" ? newsPageEn : newsPageKo; }
export function getContactPage(lang: Lang)  { return lang === "en" ? contactPageEn : contactPageKo; }
