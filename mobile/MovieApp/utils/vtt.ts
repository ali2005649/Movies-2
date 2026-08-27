export type Cue = {
  startMs: number;
  endMs: number;
  text: string;
};

/** Parse a simple WebVTT string into timed cues. */
export function parseVtt(vtt: string): Cue[] {
  const blocks = vtt
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .split(/\n\n+/);

  const cues: Cue[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').filter(Boolean);
    if (!lines.length || lines[0].startsWith('WEBVTT')) continue;

    const timeLine = lines.find((l) => l.includes('-->'));
    if (!timeLine) continue;

    const [startRaw, endRaw] = timeLine.split('-->').map((s) => s.trim());
    const startMs = parseTimestamp(startRaw);
    const endMs = parseTimestamp(endRaw.split(/\s+/)[0]);
    if (startMs == null || endMs == null) continue;

    const textLines = lines.slice(lines.indexOf(timeLine) + 1);
    const text = textLines.join('\n').trim();
    if (!text) continue;

    cues.push({ startMs, endMs, text });
  }

  return cues;
}

function parseTimestamp(value: string): number | null {
  // Supports HH:MM:SS.mmm or MM:SS.mmm
  const parts = value.trim().split(':');
  if (parts.length < 2) return null;

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    hours = Number(parts[0]);
    minutes = Number(parts[1]);
    seconds = Number(parts[2]);
  } else {
    minutes = Number(parts[0]);
    seconds = Number(parts[1]);
  }

  if ([hours, minutes, seconds].some((n) => Number.isNaN(n))) return null;
  return Math.round((hours * 3600 + minutes * 60 + seconds) * 1000);
}

export function cueAt(cues: Cue[], positionMs: number): string | null {
  const hit = cues.find((c) => positionMs >= c.startMs && positionMs <= c.endMs);
  return hit?.text ?? null;
}
