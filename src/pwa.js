import { registerSW } from "virtual:pwa-register";

export function registerPwa() {
  if (import.meta.env.DEV) {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          void registration.unregister();
        });
      });
    }

    return;
  }

  registerSW({
    immediate: true,
  });
}
