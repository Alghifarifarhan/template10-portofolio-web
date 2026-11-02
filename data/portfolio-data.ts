import { FullPortfolioData } from "@/types";

/**
 * Pure empty initial state with NO hardcoded sample text.
 * Ensures that when clean or loading, 0 milliseconds of mock text is ever displayed.
 */
export const emptyPortfolioData: FullPortfolioData = {
  themeMode: "dark",
  accentColor: "#eabe7c",
  nav: {
    brandName: "",
    intro: "",
    about: "",
    works: "",
    contact: "",
  },
  hero: {
    greeting: "",
    headline: "",
  },
  socials: {
    linkedin: "",
    twitter: "",
    instagram: "",
    dribbble: "",
    behance: "",
    pinterest: "",
    github: "",
  },
  about: {
    aboutTitle: "",
    aboutText: "",
    aboutImage: "",
    cvText: "",
    cvUrl: "",
  },
  expertise: {
    title: "",
    skills: [],
  },
  timeline: {
    experienceTitle: "",
    educationTitle: "",
    experienceItems: [],
    educationItems: [],
  },
  works: {
    worksTitle: "",
    worksDescription: "",
    projects: [],
  },
  contact: {
    contactTitle: "",
    contactDescription: "",
    reachMeTitle: "",
    socialTitle: "",
    email: "",
    phone: "",
    location: "",
  },
};

/**
 * Default fallback / template sample data (available if user explicitly wants sample content)
 */
export const templateSampleData: FullPortfolioData = {
  themeMode: "dark",
  accentColor: "#eabe7c",
  nav: {
    brandName: "Luther",
    intro: "Intro",
    about: "About",
    works: "Works",
    contact: "Say Hello",
  },
  hero: {
    greeting: "Hello World",
    headline: "I am Luther,\na digital designer\n& frontend\ndeveloper based\nin Somewhere.",
  },
  socials: {
    linkedin: "https://linkedin.com/",
    twitter: "https://twitter.com/",
    instagram: "https://instagram.com/",
    dribbble: "https://dribbble.com/",
    behance: "https://behance.net/",
    pinterest: "https://pinterest.com/",
    github: "https://github.com/",
  },
  about: {
    aboutTitle: "About",
    aboutText:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    aboutImage: "/images/about-photo.jpg",
    cvText: "Download CV",
    cvUrl: "#",
  },
  expertise: {
    title: "Expertise",
    skills: [
      "Visual Design",
      "Branding Identity",
      "UI Design",
      "Product Design",
      "Prototyping",
      "Frontend Development",
    ],
  },
  timeline: {
    experienceTitle: "Experience",
    educationTitle: "Education",
    experienceItems: [
      {
        id: "exp-1",
        title: "Dropbox",
        role: "Product Designer",
        timeframe: "August 2019 - Present",
        description:
          "Pendisse feugiat ante eget massa bibendum tristique. Donec pellentesque magna vitae diam semper egestas.",
      },
      {
        id: "exp-2",
        title: "Facebook",
        role: "Frontend Developer",
        timeframe: "August 2018 - July 2019",
        description:
          "Fusce ut ligula vulputate, tempor nulla et, semper erat. Ut nec nisi viverra, molestie nibh vel, commodo.",
      },
    ],
    educationItems: [
      {
        id: "edu-1",
        title: "University of Life",
        role: "Master in Graphic Design",
        timeframe: "October 2015 - July 2017",
        description:
          "Donec pellentesque magna vitae diam semper egestas. Pellentesque molestie scelerisque odio sed vehicula.",
      },
      {
        id: "edu-2",
        title: "School of Tech",
        role: "B.A. in Computer Science",
        timeframe: "September 2011 - June 2015",
        description:
          "Ut nec nisi viverra, molestie nibh vel, commodo. Vestibulum sed felis id libero tristique vulputate.",
      },
    ],
  },
  works: {
    worksTitle: "Recent Works",
    worksDescription:
      "Here are some of my favorite projects I have done lately. Feel free to check them out.",
    projects: [
      {
        id: "proj-1",
        title: "Retro Camera.",
        category: "Website",
        description:
          "Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes.",
        image: "/images/portfolio/fuji.jpg",
        galleryImage: "/images/portfolio/gallery/g-fuji.jpg",
        tags: ["Branding", "UI Design"],
        link: "https://www.behance.net/",
      },
      {
        id: "proj-2",
        title: "Woodcraft.",
        category: "Branding",
        description:
          "A modern branding package designed for bespoke woodcraft artisans, blending clean typography with earthy elegance.",
        image: "/images/portfolio/woodcraft.jpg",
        galleryImage: "/images/portfolio/gallery/g-woodcraft.jpg",
        tags: ["Branding", "Packaging"],
        link: "https://www.behance.net/",
      },
    ],
  },
  contact: {
    contactTitle: "Get In Touch",
    contactDescription:
      "I love to hear from you. Whether you have a question or just want to chat about design, tech & art — shoot me a message.",
    reachMeTitle: "Reach me at",
    socialTitle: "Social",
    email: "sayhello@luther.com",
    phone: "+197 543 2345",
    location: "1600 Amphitheatre Parkway, Mountain View, CA 94043",
  },
};

/**
 * Permanent unchangeable copyright footer required by theme license.
 */
export const FIXED_FOOTER_COPYRIGHT = {
  text: "© Copyright Luther 2021 Design by StyleShout (https://www.styleshout.com/) Distribution By Themewagon (https://themewagon.com/)",
  author: "Luther",
  year: "2021",
  styleShoutUrl: "https://www.styleshout.com/",
  themeWagonUrl: "https://themewagon.com/",
};
