const SAMPLE = 64;
const HUE_BINS = 12;
const paletteCache = new Map();
const inflight = new Map();

const NEUTRAL_PALETTE = {
  primary: "rgba(32, 36, 48, 0.42)",
  secondary: "rgba(18, 20, 28, 0.28)",
  tertiary: "rgba(8, 8, 12, 0.18)",
};

let scratch = null;

function getScratch() {
  if (!scratch) {
    const canvas = document.createElement("canvas");
    canvas.width = SAMPLE;
    canvas.height = SAMPLE;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    scratch = { canvas, ctx };
  }
  return scratch;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function rgbToHsl(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === red) h = ((green - blue) / d + (green < blue ? 6 : 0)) / 6;
  else if (max === green) h = ((blue - red) / d + 2) / 6;
  else h = ((red - green) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }

  const hue2rgb = (p, q, t) => {
    let hue = t;
    if (hue < 0) hue += 1;
    if (hue > 1) hue -= 1;
    if (hue < 1 / 6) return p + (q - p) * 6 * hue;
    if (hue < 1 / 2) return q;
    if (hue < 2 / 3) return p + (q - p) * (2 / 3 - hue) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function rgba(r, g, b, a) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

function glowFromHsl(h, s, l, a) {
  const sat = clamp(s * 1.12, 0.22, 0.78);
  const light = clamp(Math.max(l, 0.26) * 0.92, 0.24, 0.48);
  const [r, g, b] = hslToRgb(h, sat, light);
  return rgba(r, g, b, a);
}

function emptyBin() {
  return { count: 0, red: 0, green: 0, blue: 0 };
}

function binColor(bin) {
  if (bin.count <= 0) return null;
  const red = bin.red / bin.count;
  const green = bin.green / bin.count;
  const blue = bin.blue / bin.count;
  const [h, s, l] = rgbToHsl(red, green, blue);
  return { h, s, l, red, green, blue, count: bin.count };
}

function familyColor(bins, peak) {
  const merged = emptyBin();
  for (const offset of [-1, 0, 1]) {
    const bin = bins[(peak + offset + HUE_BINS) % HUE_BINS];
    merged.count += bin.count;
    merged.red += bin.red;
    merged.green += bin.green;
    merged.blue += bin.blue;
  }
  return binColor(merged);
}

export function fallbackPalette() {
  return { ...NEUTRAL_PALETTE };
}

export function originFromNode(node) {
  if (!node || typeof window === "undefined") return { x: 50, y: 38 };
  const rect = node.getBoundingClientRect();
  return {
    x: ((rect.left + rect.width / 2) / window.innerWidth) * 100,
    y: ((rect.top + rect.height / 2) / window.innerHeight) * 100,
  };
}

export function getCachedPalette(src) {
  return src ? paletteCache.get(src) || null : null;
}

export function samplePosterSrc(src) {
  if (!src) return Promise.resolve(NEUTRAL_PALETTE);
  const cached = paletteCache.get(src);
  if (cached) return Promise.resolve(cached);
  if (inflight.has(src)) return inflight.get(src);

  const request = new Promise((resolve) => {
    const probe = new Image();
    probe.crossOrigin = "anonymous";
    probe.referrerPolicy = "no-referrer";
    probe.decoding = "async";
    probe.onload = () => {
      const palette = extractPosterPalette(probe);
      if (palette) {
        paletteCache.set(src, palette);
        resolve(palette);
        return;
      }
      resolve(NEUTRAL_PALETTE);
    };
    probe.onerror = () => {
      resolve(NEUTRAL_PALETTE);
    };
    probe.src = src;
  }).finally(() => {
    inflight.delete(src);
  });

  inflight.set(src, request);
  return request;
}

export function extractPosterPalette(img) {
  if (!img?.naturalWidth) return null;

  try {
    const { ctx } = getScratch();
    ctx.clearRect(0, 0, SAMPLE, SAMPLE);
    ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
    const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);

    const bins = Array.from({ length: HUE_BINS }, emptyBin);
    let total = 0;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 200) continue;

      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];
      const [h, s, l] = rgbToHsl(red, green, blue);

      if (l < 0.05 || l > 0.92) continue;
      if (s < 0.04) continue;

      const pixelIndex = i / 4;
      const x = pixelIndex % SAMPLE;
      const y = Math.floor(pixelIndex / SAMPLE);
      const edgeX = Math.min(x, SAMPLE - 1 - x) / SAMPLE;
      const edgeY = Math.min(y, SAMPLE - 1 - y) / SAMPLE;
      const edge = Math.min(edgeX, edgeY);

      let weight = 1;
      if (edge < 0.14) weight *= 1.85;
      if (s > 0.72 && l > 0.52) weight *= 0.18;
      else if (s > 0.82) weight *= 0.35;

      const bin = bins[Math.round(h * HUE_BINS) % HUE_BINS];
      bin.count += weight;
      bin.red += red * weight;
      bin.green += green * weight;
      bin.blue += blue * weight;
      total += weight;
    }

    if (total < 1) return { ...NEUTRAL_PALETTE };

    const smoothed = bins.map((bin, index) => {
      const prev = bins[(index + HUE_BINS - 1) % HUE_BINS];
      const next = bins[(index + 1) % HUE_BINS];
      return bin.count + prev.count * 0.5 + next.count * 0.5;
    });

    let peak = 0;
    for (let i = 1; i < HUE_BINS; i += 1) {
      if (smoothed[i] > smoothed[peak]) peak = i;
    }

    const primary = familyColor(bins, peak);
    if (!primary) return { ...NEUTRAL_PALETTE };

    let secondPeak = (peak + 4) % HUE_BINS;
    for (let i = 0; i < HUE_BINS; i += 1) {
      const dist = Math.min(
        Math.abs(i - peak),
        HUE_BINS - Math.abs(i - peak)
      );
      if (dist < 2) continue;
      if (smoothed[i] > smoothed[secondPeak]) secondPeak = i;
    }

    const secondary = familyColor(bins, secondPeak) || primary;

    return {
      primary: glowFromHsl(primary.h, primary.s, primary.l, 0.78),
      secondary: glowFromHsl(secondary.h, secondary.s, secondary.l, 0.5),
      tertiary: glowFromHsl(
        primary.h,
        clamp(primary.s * 0.7, 0.18, 0.55),
        clamp(primary.l * 0.55, 0.14, 0.3),
        0.36
      ),
    };
  } catch {
    return null;
  }
}
