const DISPLAY_NAME_KEY = "pp_display_name";

export const storage = {
  getDisplayName(): string {
    return localStorage.getItem(DISPLAY_NAME_KEY) || "";
  },

  setDisplayName(name: string): void {
    localStorage.setItem(DISPLAY_NAME_KEY, name);
  },
};
