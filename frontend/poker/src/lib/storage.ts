const DISPLAY_NAME_KEY = "pp_display_name";
const hostKeyName = (code: string) => `pp_host_key_${code}`;

export const storage = {
  getDisplayName(): string {
    return localStorage.getItem(DISPLAY_NAME_KEY) || "";
  },

  setDisplayName(name: string): void {
    localStorage.setItem(DISPLAY_NAME_KEY, name);
  },

  // Kept out of the URL: anyone holding it can run the table.
  getHostKey(code: string): string {
    return localStorage.getItem(hostKeyName(code)) || "";
  },

  setHostKey(code: string, hostKey: string): void {
    localStorage.setItem(hostKeyName(code), hostKey);
  },
};
