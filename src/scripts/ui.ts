// Client-side UI behaviors.

type Theme = "dark" | "light";

const STORAGE_THEME = "nexora-theme";

/* ---------- Theme ---------- */

function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_THEME);
    return v === "light" || v === "dark" ? v : null;
  } catch { return null; }
}

function getSystemTheme(): Theme {
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
  document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((el) => {
    el.setAttribute("aria-pressed", String(t === "light"));
    const labelDark = el.dataset.labelDark || "Dark";
    const labelLight = el.dataset.labelLight || "Light";
    const labelEl = el.querySelector<HTMLElement>("[data-theme-label]");
    if (labelEl) labelEl.textContent = t === "light" ? labelLight : labelDark;
  });
}

function initTheme() {
  const initial: Theme = getStoredTheme() ?? getSystemTheme();
  applyTheme(initial);

  document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
      const next: Theme = current === "light" ? "dark" : "light";
      try { localStorage.setItem(STORAGE_THEME, next); } catch {}
      applyTheme(next);
    });
  });

  // React to OS-level changes only if user hasn't picked one.
  window.matchMedia?.("(prefers-color-scheme: light)").addEventListener?.("change", (e) => {
    if (getStoredTheme()) return;
    applyTheme(e.matches ? "light" : "dark");
  });
}

/* ---------- Scroll reveal ---------- */

function initScrollReveal() {
  const targets = document.querySelectorAll<HTMLElement>(
    ".reveal, .reveal-hero, [data-reveal-children]"
  );
  if (!targets.length) return;

  if (
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
  );
  targets.forEach((el) => io.observe(el));
}

/* ---------- Header scroll state ---------- */

function initHeaderScrollState() {
  const header = document.querySelector<HTMLElement>(".site-header");
  if (!header) return;
  header.classList.add("is-ready");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Lazy videos ---------- */

function initLazyVideos() {
  const videos = document.querySelectorAll<HTMLVideoElement>("video[data-lazy-video]");
  if (!videos.length) return;

  const reveal = (v: HTMLVideoElement) => {
    const onReady = () => v.classList.add("is-ready");
    if (v.readyState >= 2) onReady();
    else {
      v.addEventListener("loadeddata", onReady, { once: true });
      v.addEventListener("canplay", onReady, { once: true });
    }
  };

  const hydrate = (v: HTMLVideoElement) => {
    const src = v.dataset.src;
    if (src && !v.src) v.src = src;
    try { v.load(); v.play().catch(() => {}); } catch {}
    reveal(v);
  };

  if (!("IntersectionObserver" in window)) {
    videos.forEach(hydrate);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        hydrate(e.target as HTMLVideoElement);
        io.unobserve(e.target);
      });
    },
    { rootMargin: "200px" },
  );
  videos.forEach((v) => io.observe(v));
}

/* ---------- Lazy backgrounds ---------- */

function initLazyImages() {
  const targets = document.querySelectorAll<HTMLElement>("[data-bg-src]");
  if (!targets.length) return;
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => {
      const src = el.dataset.bgSrc;
      if (src) el.style.backgroundImage = `url("${src}")`;
    });
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        const src = el.dataset.bgSrc;
        if (src) el.style.backgroundImage = `url("${src}")`;
        el.removeAttribute("data-bg-src");
        io.unobserve(el);
      });
    },
    { rootMargin: "300px" },
  );
  targets.forEach((el) => io.observe(el));
}

/* ---------- Boot ---------- */

/* ---------- Popups ---------- */

function initPopup() {
  const popups = Array.from(document.querySelectorAll<HTMLElement>("[data-popup]"));
  if (!popups.length) return;

  const findPopup = (name: string) => popups.find((p) => p.dataset.popup === name) || null;

  const open = (root: HTMLElement) => {
    root.classList.remove("hidden");
    root.classList.add("flex");
    document.body.style.overflow = "hidden";
  };
  const close = (root: HTMLElement) => {
    root.classList.add("hidden");
    root.classList.remove("flex");
    const stillOpen = popups.some((p) => !p.classList.contains("hidden"));
    if (!stillOpen) document.body.style.overflow = "";
  };

  // Open triggers.
  document.querySelectorAll<HTMLElement>("[data-popup-open]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const name = el.dataset.popupOpen || "";
      const target = findPopup(name);
      if (target) open(target);
    }),
  );

  // Close buttons + backdrop click.
  popups.forEach((root) => {
    root.querySelectorAll<HTMLElement>("[data-popup-close]").forEach((el) =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        close(root);
      }),
    );
    root.addEventListener("click", (e) => {
      if (e.target === root) close(root);
    });
  });

  // ESC closes the topmost open popup.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const openOnes = popups.filter((p) => !p.classList.contains("hidden"));
    const top = openOnes[openOnes.length - 1];
    if (top) close(top);
  });
}

/* ---------- Hero video rotator ---------- */
// Ported from Freshwater-Eel's initHeroVideoRotator. Cycles through
// the videos in [data-hero-rotator], cross-fading every `data-interval` ms.

function initHeroVideoRotator() {
  const rotator = document.querySelector<HTMLElement>("[data-hero-rotator]");
  if (!rotator) return;
  const videos = Array.from(rotator.querySelectorAll<HTMLVideoElement>("[data-hero-video]"));
  if (videos.length < 2) return;

  let current = 0;

  const ready = new Set<number>([0]);
  videos.forEach((v, i) => {
    const mark = () => ready.add(i);
    v.addEventListener("canplay", mark, { once: true });
    v.addEventListener("loadeddata", mark, { once: true });
  });

  const preloadVideo = (idx: number) => {
    const v = videos[idx];
    if (!v || v.preload === "auto") return;
    try { v.preload = "auto"; v.load(); } catch {}
  };

  // Warm up the next clip ~3s after the page is interactive so the first
  // cross-fade is seamless.
  const schedule = (cb: () => void, delay: number) => {
    const w = window as any;
    if (typeof w.requestIdleCallback === "function") w.requestIdleCallback(() => setTimeout(cb, delay));
    else setTimeout(cb, delay);
  };
  const start = () => schedule(() => preloadVideo(1), 3000);
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });

  const advance = () => {
    // Find the next ready clip — skip ones that haven't loaded yet.
    let next = current;
    for (let i = 1; i <= videos.length; i++) {
      const c = (current + i) % videos.length;
      if (ready.has(c) && videos[c].readyState >= 2) { next = c; break; }
    }
    if (next === current) {
      // Nothing else ready — just replay the current clip.
      try { videos[current].currentTime = 0; videos[current].play().catch(() => {}); } catch {}
      return;
    }

    const cur = videos[current];
    const nxt = videos[next];
    try { cur.pause(); } catch {}
    try { nxt.currentTime = 0; } catch {}
    nxt.play().catch(() => {});
    nxt.classList.remove("opacity-0");
    nxt.classList.add("opacity-100");
    cur.classList.remove("opacity-100");
    cur.classList.add("opacity-0");
    current = next;

    // Warm up the clip AFTER next so it's ready by the time we reach it.
    const peek = (next + 1) % videos.length;
    if (peek !== 0) preloadVideo(peek);
  };

  // Advance when the active clip finishes OR hits the 10-second cap —
  // whichever comes first. Lets long clips behave like short ones.
  const MAX_PLAY_SEC = 10;
  videos.forEach((v, i) => {
    v.addEventListener("ended", () => {
      if (i === current) advance();
    });
    v.addEventListener("timeupdate", () => {
      if (i === current && v.currentTime >= MAX_PLAY_SEC) advance();
    });
  });
}

/* ---------- Hero aperture open ---------- */
// Opens the video + text "aperture" once the intro loader has stepped aside.
// If the loader was skipped (already seen this session), open immediately.

function initHeroAperture() {
  const targets = document.querySelectorAll<HTMLElement>(".hero-aperture");
  if (!targets.length) return;

  const open = () => targets.forEach((el) => el.classList.add("is-open"));

  const loader = document.getElementById("intro-loader");
  // Loader skipped (subsequent navigation in this session) → reveal now.
  if (!loader || loader.classList.contains("is-removed")) {
    requestAnimationFrame(open);
    return;
  }

  // Otherwise wait until just after the loader begins its exit transition
  // (matches the IntroLoader.astro timing: counter runs 1500ms, then a
  // 150ms beat, then is-leaving is added).
  const waitFor = 1500 + 150 + 250; // ~1.9s — start opening as the loader slides up
  setTimeout(open, waitFor);
}

function boot() {
  initTheme();
  initScrollReveal();
  initHeaderScrollState();
  initLazyVideos();
  initLazyImages();
  initPopup();
  initHeroVideoRotator();
  initHeroAperture();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
