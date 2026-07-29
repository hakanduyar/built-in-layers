export type NavItem = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  url: string;
  verified: true;
};

export const siteName = "Built in Layers";
export const siteOwner = "Hakan Duyar";

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Notes", href: "/notes" },
  { label: "Lab", href: "/lab" },
  { label: "About", href: "/about" },
];

// Verified in docs/CONTENT_INVENTORY.md. No email or CV link: unconfirmed,
// omitted rather than placeholdered per TASK-002 scope.
export const socialLinks: SocialLink[] = [
  { label: "GitHub", url: "https://github.com/hakanduyar", verified: true },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/hakanduyar/", verified: true },
  { label: "Medium", url: "https://hakanduyar.medium.com/", verified: true },
];

export const contactUrl = "https://www.linkedin.com/in/hakanduyar/";
