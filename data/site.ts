export type NavItem = {
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Notes", href: "/notes" },
  { label: "Lab", href: "/lab" },
  { label: "About", href: "/about" },
];

export type SocialLink = {
  label: string;
  url: string;
};

/** Verified links only (docs/CONTENT_INVENTORY.md). No email, no CV link. */
export const socialLinks: SocialLink[] = [
  { label: "GitHub", url: "https://github.com/hakanduyar" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/hakanduyar/" },
  { label: "Medium", url: "https://hakanduyar.medium.com/" },
];

export const siteName = "Built in Layers";
export const siteOwner = "Hakan Duyar";
