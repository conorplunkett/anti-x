"use client";

import { useState } from "react";

const GITHUB_URL = "https://github.com/conorplunkett/anti-x";
const DONATE_URL = "https://www.buymeacoffee.com/yourname"; // keep in sync with source/modules/lib.js

/* ---------- tiny building blocks ---------- */

function Switch({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      className={`switch ${on ? "on" : ""}`}
      onClick={() => onChange(!on)}
      aria-pressed={on}
      aria-label={label}
    >
      <span className="knob" />
    </button>
  );
}

const W = [92, 64, 80, 71, 88, 58, 76, 95, 67, 84];

function FakeTweet({ i, tag }: { i: number; tag?: string }) {
  return (
    <div className="tweet">
      <span className="avatar" />
      <span className="tweet-lines">
        <span className="line name" style={{ width: 60 + (i % 4) * 14 }} />
        <span className="line" style={{ width: `${W[i % W.length]}%` }} />
        <span className="line" style={{ width: `${W[(i + 3) % W.length] - 18}%` }} />
        {tag && <span className="tweet-tag">{tag}</span>}
      </span>
    </div>
  );
}

/* ---------- hero: flip the extension on/off ---------- */

function HeroDemo() {
  const [on, setOn] = useState(true);
  return (
    <div className="browser-mock">
      <div className="browser-bar">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="url">x.com/home</span>
        <span className="bar-toggle">
          <span className="bar-toggle-label">⛔️ Anti-Timeline</span>
          <Switch on={on} onChange={setOn} label="Toggle Anti-Timeline" />
        </span>
      </div>

      {on ? (
        <div className="browser-body calm">
          <div className="mock-title">Timeline blocked</div>
          <div className="mock-sub">Use X intentionally.</div>
          <div className="mock-pills">
            {["Post", "Search", "Messages", "Notifications", "Bookmarks", "Lists"].map((p) => (
              <span className="pill" key={p}>{p}</span>
            ))}
          </div>
        </div>
      ) : (
        <div className="browser-body doom">
          <div className="doom-scroll">
            {Array.from({ length: 16 }).map((_, i) => (
              <FakeTweet key={i} i={i} tag={i % 5 === 2 ? "Suggested" : i % 7 === 3 ? "Promoted" : undefined} />
            ))}
            {Array.from({ length: 16 }).map((_, i) => (
              <FakeTweet key={`b${i}`} i={i} tag={i % 5 === 2 ? "Suggested" : undefined} />
            ))}
          </div>
          <div className="doom-fade" />
          <div className="doom-hint">😵‍💫 this never ends — flip the switch</div>
        </div>
      )}
    </div>
  );
}

/* ---------- playground: strip the UI piece by piece ---------- */

type Part = "feed" | "trends" | "follow" | "suggested" | "explore";

const PARTS: { key: Part; label: string; emoji: string }[] = [
  { key: "feed", label: "Home feed", emoji: "🏠" },
  { key: "explore", label: "Explore", emoji: "🧭" },
  { key: "trends", label: "Trends", emoji: "📈" },
  { key: "follow", label: "Who to follow", emoji: "👤" },
  { key: "suggested", label: "Suggested posts", emoji: "🔁" },
];

function Playground() {
  const [hidden, setHidden] = useState<Record<Part, boolean>>({
    feed: false,
    trends: false,
    follow: false,
    suggested: false,
    explore: false,
  });
  const toggle = (k: Part) => setHidden((h) => ({ ...h, [k]: !h[k] }));
  const allOff = Object.values(hidden).every(Boolean);

  return (
    <div className="playground">
      <div className="pg-toggles">
        {PARTS.map((p) => (
          <button
            key={p.key}
            className={`pg-chip ${hidden[p.key] ? "off" : ""}`}
            onClick={() => toggle(p.key)}
          >
            {p.emoji} {p.label}
          </button>
        ))}
      </div>

      <div className="x-mock">
        {/* left nav */}
        <div className="x-nav">
          {["🏠", "🔍", "🔔", "✉️", "🔖", "📋", "🪪"].map((n, i) => (
            <span key={i} className={`x-nav-item ${n === "🧭" ? "" : ""}`}>{n}</span>
          ))}
          <span className={`x-nav-item gone-able ${hidden.explore ? "gone" : ""}`}>🧭</span>
        </div>

        {/* feed column */}
        <div className="x-feed">
          <div className={`gone-able ${hidden.feed ? "gone" : ""}`}>
            <FakeTweet i={1} />
            <FakeTweet i={4} />
          </div>
          <div className={`x-module gone-able ${hidden.suggested ? "gone" : ""}`}>
            <span className="x-module-title">🔁 Suggested for you</span>
            <FakeTweet i={7} tag="Suggested" />
          </div>
          <div className={`gone-able ${hidden.feed ? "gone" : ""}`}>
            <FakeTweet i={2} />
            <FakeTweet i={8} />
          </div>
          {allOff && (
            <div className="pg-calm">
              <span>🧘</span> Nothing left to scroll. Go do the thing.
            </div>
          )}
        </div>

        {/* sidebar */}
        <div className="x-side">
          <div className={`x-module gone-able ${hidden.trends ? "gone" : ""}`}>
            <span className="x-module-title">📈 What’s happening</span>
            <span className="line" style={{ width: "78%" }} />
            <span className="line" style={{ width: "62%" }} />
            <span className="line" style={{ width: "70%" }} />
          </div>
          <div className={`x-module gone-able ${hidden.follow ? "gone" : ""}`}>
            <span className="x-module-title">👤 Who to follow</span>
            <span className="mini-user"><span className="avatar sm" /><span className="line" style={{ width: "55%" }} /></span>
            <span className="mini-user"><span className="avatar sm" /><span className="line" style={{ width: "45%" }} /></span>
          </div>
        </div>
      </div>

      <p className="pg-caption">Tap the chips. That’s the whole extension.</p>
    </div>
  );
}

/* ---------- page ---------- */

const kept = ["✍️ Post", "🔍 Search", "💬 DMs", "🔔 Notifications", "🔖 Bookmarks", "📋 Lists", "🪪 Profiles", "🔗 Tweet links"];

export default function Home() {
  return (
    <main>
      <nav className="nav">
        <div className="nav-inner">
          <span className="logo">⛔️ Anti-Timeline</span>
          <div className="nav-links">
            <a href="#play">Demo</a>
            <a href="#pricing">Free vs Pro</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener">GitHub</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <h1>
          Open X.
          <br />
          <span className="accent">Skip the feed.</span>
        </h1>
        <p className="lede">
          A free Chrome extension that removes the feed — and nothing else.
        </p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href={GITHUB_URL} target="_blank" rel="noopener">
            Get it free
          </a>
        </div>
        <p className="hero-note">Open source · No tracking · 1 permission</p>
        <HeroDemo />
      </header>

      {/* Playground */}
      <section className="section" id="play">
        <h2>You choose what disappears</h2>
        <Playground />
      </section>

      {/* Kept */}
      <section className="section">
        <h2>Everything useful stays</h2>
        <div className="kept-row">
          {kept.map((k) => (
            <span className="kept-chip" key={k}>{k}</span>
          ))}
        </div>
      </section>

      {/* How */}
      <section className="section">
        <h2>How it works</h2>
        <div className="steps-row">
          <div className="step-min"><span>1️⃣</span>Install</div>
          <div className="step-arrow">→</div>
          <div className="step-min"><span>2️⃣</span>Open X, see calm</div>
          <div className="step-arrow">→</div>
          <div className="step-min"><span>3️⃣</span>Do the thing. Leave.</div>
        </div>
        <p className="tech-line">
          Watches X’s page with a <code>MutationObserver</code> · settings in <code>chrome.storage.local</code> · zero network requests
        </p>
      </section>

      {/* Free vs Pro */}
      <section className="section" id="pricing">
        <h2>Free does everything above</h2>
        <div className="plans">
          <div className="plan plan-free">
            <div className="plan-badge">Free · Forever</div>
            <h3>Anti-Timeline</h3>
            <ul>
              <li>✓ Block Home & For You</li>
              <li>✓ Hide Trends, Explore & suggestions</li>
              <li>✓ Instant toggles for everything</li>
              <li>✓ No tracking. No server. Ever.</li>
            </ul>
            <a className="btn btn-primary btn-block" href={GITHUB_URL} target="_blank" rel="noopener">
              Get it free
            </a>
          </div>
          <div className="plan plan-pro">
            <div className="plan-badge pro">Pro · Optional</div>
            <h3>+ habit tools</h3>
            <ul>
              <li>⏰ Scheduled blocking</li>
              <li>⏳ Daily feed budget</li>
              <li>🧘 Breathing-room countdown</li>
              <li>📊 On-device focus stats</li>
            </ul>
            <span className="btn btn-ghost btn-block disabled">Coming soon</span>
          </div>
        </div>

        {/* Donation — right under the two versions */}
        <div className="donate">
          <h3>☕️ Free forever. Coffee optional.</h3>
          <a className="btn btn-donate" href={DONATE_URL} target="_blank" rel="noopener">
            ☕️ Support the project
          </a>
        </div>
      </section>

      {/* Final */}
      <section className="section final">
        <h2>Use X. Don’t let X use you.</h2>
        <a className="btn btn-primary btn-lg" href={GITHUB_URL} target="_blank" rel="noopener">
          Get Anti-Timeline
        </a>
      </section>

      <footer className="footer">
        <span>⛔️ Anti-Timeline</span>
        <div>
          <a href={GITHUB_URL} target="_blank" rel="noopener">GitHub</a>
          <a href={`${GITHUB_URL}/blob/main/store/privacy.md`} target="_blank" rel="noopener">Privacy</a>
          <a href={DONATE_URL} target="_blank" rel="noopener">Donate</a>
        </div>
        <span className="footer-note">Not affiliated with X Corp. MIT licensed.</span>
      </footer>
    </main>
  );
}
