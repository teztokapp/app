import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import {
  Haptics,
  ImpactStyle,
  NotificationType,
} from "@capacitor/haptics";

const isNative = () => Capacitor.isNativePlatform();

export function isNativePlatform() {
  return isNative();
}

const vibrate = (pattern) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
};

export function openExternalUrl(url, options = {}) {
  if (!url) {
    return Promise.resolve();
  }

  const preferSameTab = options.preferSameTab === true;

  if (isNative()) {
    return Browser.open({ url });
  }

  if (preferSameTab) {
    window.location.assign(url);
    return Promise.resolve();
  }

  const openedWindow = window.open(url, "_blank", "noopener,noreferrer");

  if (!openedWindow) {
    window.location.assign(url);
  }

  return Promise.resolve();
}

export async function triggerTabHaptic() {
  try {
    if (isNative()) {
      await Haptics.selectionChanged();
      return;
    }
  } catch {}

  vibrate(8);
}

export async function triggerSelectionHaptic() {
  try {
    if (isNative()) {
      await Haptics.selectionChanged();
      return;
    }
  } catch {}

  vibrate(6);
}

export async function triggerLikeHaptic(liked) {
  try {
    if (isNative()) {
      if (liked) {
        await Haptics.notification({ type: NotificationType.Success });
        return;
      }

      await Haptics.impact({ style: ImpactStyle.Light });
      return;
    }
  } catch {}

  vibrate(liked ? [14, 20, 18] : 10);
}

export async function triggerOpenHaptic() {
  try {
    if (isNative()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
      return;
    }
  } catch {}

  vibrate(12);
}
