export default function FilmGrain() {
  return (
    <div className="film-grain" aria-hidden="true">
      <svg
        className="film-grain__svg"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <filter id="cinematic-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.72"
            numOctaves="4"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="saturate"
            values="0"
            result="mono"
          />
          <feComponentTransfer in="mono">
            <feFuncA type="linear" slope="0.55" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter="url(#cinematic-grain)" />
      </svg>
    </div>
  );
}
