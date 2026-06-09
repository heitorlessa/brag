export interface NavLink {
  label: string;
  icon: string;
  to: string;
}

/** Primary navigation, shared by the sidebar rail and the command palette. */
export const NAV_LINKS: NavLink[] = [
  { label: "Dashboard", icon: "i-lucide-sparkles", to: "/" },
  { label: "Achievements", icon: "i-lucide-trophy", to: "/achievements" },
  { label: "Goals", icon: "i-lucide-target", to: "/goals" },
  { label: "Mentoring", icon: "i-lucide-users-round", to: "/mentoring" },
  { label: "Enablement", icon: "i-lucide-presentation", to: "/enablement" },
  { label: "Energy", icon: "i-lucide-activity", to: "/energy" },
];

export const SETTINGS_LINK: NavLink = {
  label: "Settings",
  icon: "i-lucide-settings",
  to: "/settings",
};
