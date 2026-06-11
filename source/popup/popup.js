import { settingsKeys, loadSettings, loadPro, DONATE_URL } from "../modules/lib.js";

let statusTimer;

const flashStatus = (text) => {
  const status = document.getElementById("status");
  status.textContent = text;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    status.textContent = "";
  }, 1500);
};

const updateDisabledState = (enabled) => {
  document.getElementById("options").disabled = !enabled;
};

const init = async () => {
  const settings = await loadSettings();

  for (const key of settingsKeys) {
    const checkbox = document.getElementById(key);
    if (!checkbox) continue;
    checkbox.checked = settings[key];
    checkbox.addEventListener("change", async () => {
      await chrome.storage.local.set({ [key]: checkbox.checked });
      if (key === "enabled") updateDisabledState(checkbox.checked);
      flashStatus("Saved ✓");
    });
  }

  updateDisabledState(settings.enabled);

  // Donation link
  document.getElementById("donate").href = DONATE_URL;

  // Pro section: unlocked features become editable; otherwise show the upgrade
  // prompt. Payment/licensing isn't wired up yet — this is the upgrade path.
  const isPro = await loadPro();
  const proFieldset = document.getElementById("pro");
  const proBadge = document.getElementById("pro-badge");
  const upgrade = document.getElementById("upgrade");

  if (isPro) {
    proFieldset.disabled = false;
    proBadge.textContent = "Active";
    upgrade.hidden = true;
  } else {
    proBadge.textContent = "Coming soon";
    upgrade.hidden = false;
    upgrade.addEventListener("click", (e) => {
      e.preventDefault();
      // TODO: open the checkout/license flow (e.g. ExtensionPay) when available.
      flashStatus("Pro is coming soon — thanks for your interest!");
    });
  }
};

document.addEventListener("DOMContentLoaded", init);
