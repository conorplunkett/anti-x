import {
  settingsKeys,
  loadSettings,
  loadPro,
  loadProSettings,
  summarizeStats,
  getBudgetUsedToday,
  CUSTOM_MESSAGE_KEY,
  STATS_KEY,
  DONATE_URL,
} from "../modules/lib.js";

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

    const proSettings = await loadProSettings();

    // Generic wiring: a feature toggle whose sub-settings panel (id + "Sub")
    // shows only while the toggle is on.
    const wireProToggle = (id, onChange) => {
      const cb = document.getElementById(id);
      const sub = document.getElementById(`${id}Sub`);
      cb.checked = proSettings[id];
      if (sub) sub.hidden = !cb.checked;
      cb.addEventListener("change", async () => {
        if (sub) sub.hidden = !cb.checked;
        await chrome.storage.local.set({ [id]: cb.checked });
        if (onChange) onChange(cb.checked);
        flashStatus("Saved ✓");
      });
    };

    // Generic wiring: a sub-setting input saved on change.
    const wireProInput = (id, parse = (v) => v) => {
      const input = document.getElementById(id);
      input.value = proSettings[id];
      input.addEventListener("change", async () => {
        await chrome.storage.local.set({ [id]: parse(input.value) });
        flashStatus("Saved ✓");
      });
    };

    const clampInt = (min, max, fallback) => (v) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
    };

    // Scheduled blocking: only block between these times.
    wireProToggle("proScheduledBlocking");
    wireProInput("proScheduleStart");
    wireProInput("proScheduleEnd");

    // Daily feed budget: allow Home for N minutes/day, then block.
    const renderBudgetUsed = async () => {
      const used = Math.round((await getBudgetUsedToday()) / 60);
      document.getElementById("budgetUsed").textContent = `· ${used} min used today`;
    };
    wireProToggle("proDailyBudget", renderBudgetUsed);
    wireProInput("proDailyBudgetMinutes", clampInt(1, 240, 15));
    renderBudgetUsed();

    // Breathing room: countdown friction before the feed unlocks.
    wireProToggle("proBreathingRoom");
    wireProInput("proBreathingSeconds", clampInt(5, 300, 30));

    // Custom blocked-screen message: toggle + text input (saved on edit).
    const msgToggle = document.getElementById("proCustomMessage");
    const msgInput = document.getElementById(CUSTOM_MESSAGE_KEY);
    msgToggle.checked = proSettings.proCustomMessage;
    msgInput.value = proSettings[CUSTOM_MESSAGE_KEY];
    msgInput.hidden = !proSettings.proCustomMessage;
    msgToggle.addEventListener("change", async () => {
      msgInput.hidden = !msgToggle.checked;
      await chrome.storage.local.set({ proCustomMessage: msgToggle.checked });
      flashStatus("Saved ✓");
    });
    let msgTimer;
    msgInput.addEventListener("input", () => {
      clearTimeout(msgTimer);
      msgTimer = setTimeout(async () => {
        await chrome.storage.local.set({ [CUSTOM_MESSAGE_KEY]: msgInput.value });
        flashStatus("Saved ✓");
      }, 400);
    });

    // Local focus stats: toggle + today/this-week summary.
    const statsToggle = document.getElementById("proLocalStats");
    const statsEl = document.getElementById("stats");
    statsToggle.checked = proSettings.proLocalStats;
    const renderStats = async () => {
      statsEl.hidden = !statsToggle.checked;
      if (statsEl.hidden) return;
      const { [STATS_KEY]: stats } = await chrome.storage.local.get(STATS_KEY);
      const { today, week } = summarizeStats(stats);
      statsEl.textContent = `Feed opens blocked: ${today} today · ${week} this week`;
    };
    statsToggle.addEventListener("change", async () => {
      await chrome.storage.local.set({ proLocalStats: statsToggle.checked });
      renderStats();
      flashStatus("Saved ✓");
    });
    renderStats();
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
