import { settingsKeys, loadSettings } from "../modules/lib.js";

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
};

document.addEventListener("DOMContentLoaded", init);
