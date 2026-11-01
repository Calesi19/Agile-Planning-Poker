type Location = { pathname: string; search: string };

function readLocation(): Location {
  const [pathname, search] = (window.location.hash.slice(1) || "/").split("?");
  return { pathname, search: search ? `?${search}` : "" };
}

// Hash routing keeps deep links and QR codes working on GitHub Pages' sub-path,
// in Capacitor, and on reload, none of which can serve /join/ABC123 as a path.
export const hashHistory = {
  get location(): Location {
    return readLocation();
  },

  listen(callback: (location: Location) => void): () => void {
    const onChange = () => callback(readLocation());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  },

  push(url: string): void {
    window.location.hash = url;
  },

  replace(url: string): void {
    window.history.replaceState(null, "", `#${url}`);
  },
};
