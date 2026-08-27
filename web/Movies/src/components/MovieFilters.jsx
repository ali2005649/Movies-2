import GlassSelect from "./GlassSelect";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [
  { value: "", label: "All years" },
  ...Array.from({ length: 50 }, (_, i) => {
    const y = String(CURRENT_YEAR - i);
    return { value: y, label: y };
  }),
];
const RATING_OPTIONS = [
  { value: "", label: "Any rating" },
  { value: "5", label: "5+" },
  { value: "6", label: "6+" },
  { value: "7", label: "7+" },
  { value: "8", label: "8+" },
  { value: "9", label: "9+" },
];

export default function MovieFilters({
  genres,
  genre,
  year,
  minRating,
  onChange,
}) {
  const genreOptions = [
    { value: "", label: "All genres" },
    ...genres.map((g) => ({ value: String(g.id), label: g.name })),
  ];

  return (
    <div className="relative z-20 flex flex-wrap items-center gap-3 overflow-visible rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:p-4">
      <GlassSelect
        aria-label="Filter by genre"
        value={genre}
        options={genreOptions}
        onChange={(value) => onChange({ genre: value })}
      />

      <GlassSelect
        aria-label="Filter by year"
        value={year}
        options={YEAR_OPTIONS}
        onChange={(value) => onChange({ year: value })}
      />

      <GlassSelect
        aria-label="Filter by rating"
        value={minRating}
        options={RATING_OPTIONS}
        onChange={(value) => onChange({ minRating: value })}
      />

      {(genre || year || minRating) && (
        <button
          type="button"
          onClick={() => onChange({ genre: "", year: "", minRating: "" })}
          className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
