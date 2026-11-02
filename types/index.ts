export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  image2x?: string;
  galleryImage: string;
  tags: string[];
  link?: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  role: string;
  timeframe: string;
  description: string;
}

export interface SocialMediaLinks {
  linkedin: string;
  twitter: string;
  instagram: string;
  dribbble: string;
  behance: string;
  pinterest: string;
  github: string;
}

export interface SiteNavData {
  brandName: string;
  intro: string;
  about: string;
  works: string;
  contact: string;
}

export interface HeroData {
  greeting: string;
  headline: string;
}

export interface AboutData {
  aboutTitle: string;
  aboutText: string;
  aboutImage: string;
  cvText: string;
  cvUrl: string;
}

export interface ExpertiseData {
  title: string;
  skills: string[];
}

export interface TimelineData {
  experienceTitle: string;
  experienceItems: TimelineItem[];
  educationTitle: string;
  educationItems: TimelineItem[];
}

export interface WorksData {
  worksTitle: string;
  worksDescription: string;
  projects: Project[];
}

export interface ContactData {
  contactTitle: string;
  contactDescription: string;
  reachMeTitle: string;
  email: string;
  phone: string;
  location: string;
  socialTitle: string;
}

export type ThemeMode = "dark" | "light";

export interface FullPortfolioData {
  themeMode: ThemeMode;
  accentColor?: string;
  nav: SiteNavData;
  hero: HeroData;
  socials: SocialMediaLinks;
  about: AboutData;
  expertise: ExpertiseData;
  timeline: TimelineData;
  works: WorksData;
  contact: ContactData;
}

