import { render } from "preact";
import { App } from "./app.tsx";
import { registerSW } from "virtual:pwa-register";

render(<App />, document.getElementById("app")!);

// Register service worker for PWA
registerSW({
  onNeedRefresh() {
    console.log("New version available");
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});
