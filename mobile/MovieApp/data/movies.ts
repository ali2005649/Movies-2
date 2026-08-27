import type { Movie } from '@/types/movie';

/**
 * Dummy TMDB-style catalog.
 * Poster URLs use the public TMDB image CDN (no API key required for static paths).
 */
export const MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Spider-Man: Across the Spider-Verse',
    rating: 8.6,
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    releaseDate: '2023-06-02',
    runtime: 140,
    genres: ['Animation', 'Action', 'Adventure'],
    overview:
      'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
  },
  {
    id: '2',
    title: 'Dune: Part Two',
    rating: 8.3,
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZt8WKgX.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/xOMo8BhjajBwYHsQgDaReh2i54X.jpg',
    releaseDate: '2024-03-01',
    runtime: 166,
    genres: ['Science Fiction', 'Adventure'],
    overview:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future.',
  },
  {
    id: '3',
    title: 'Oppenheimer',
    rating: 8.3,
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    releaseDate: '2023-07-21',
    runtime: 180,
    genres: ['Drama', 'History'],
    overview:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral weight of discovery and the dawn of the nuclear age.',
  },
  {
    id: '4',
    title: 'The Dark Knight',
    rating: 9.0,
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/hkBaDkMWbLaf8B1lsWsKX7ZN9bm.jpg',
    releaseDate: '2008-07-18',
    runtime: 152,
    genres: ['Action', 'Crime', 'Drama'],
    overview:
      'Batman raises the stakes in his war on crime with help from Lt. Gordon and District Attorney Harvey Dent. Their partnership proves effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known as the Joker.',
  },
  {
    id: '5',
    title: 'Inception',
    rating: 8.8,
    poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zBBfvQXBbusIf8xVh0V7.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/s3TBrUVV0k9G3qOQ1k7Gq0Q1k7G.jpg',
    releaseDate: '2010-07-16',
    runtime: 148,
    genres: ['Action', 'Science Fiction', 'Adventure'],
    overview:
      'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the mission and his team.',
  },
  {
    id: '6',
    title: 'Interstellar',
    rating: 8.7,
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MdlXJn4.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/xJHokMbljvjADYdit5fK5VQsBvp.jpg',
    releaseDate: '2014-11-07',
    runtime: 169,
    genres: ['Adventure', 'Drama', 'Science Fiction'],
    overview:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival as Earth faces environmental collapse. Love, time, and sacrifice collide across dimensions.",
  },
  {
    id: '7',
    title: 'Everything Everywhere All at Once',
    rating: 7.8,
    poster: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/uNmSxDSsH0i7V2k3sYk2G0Y0q.jpg',
    releaseDate: '2022-03-25',
    runtime: 139,
    genres: ['Action', 'Adventure', 'Science Fiction'],
    overview:
      'An aging Chinese immigrant is swept up in an insane adventure in which she alone can save the multiverse by connecting with versions of herself across parallel dimensions.',
  },
  {
    id: '8',
    title: 'Mad Max: Fury Road',
    rating: 7.6,
    poster: 'https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/tbhdm8UJAb4ViCTsulYFL3lxMCd.jpg',
    releaseDate: '2015-05-15',
    runtime: 120,
    genres: ['Action', 'Adventure', 'Science Fiction'],
    overview:
      'In a post-apocalyptic wasteland, Max teams up with a mysterious woman named Furiosa to escape from a tyrannical warlord and his army in a high-octane chase across the desert.',
  },
  {
    id: '9',
    title: 'Parasite',
    rating: 8.5,
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/TU9NIjwzQPQ3m7D0k5k0k.jpg',
    releaseDate: '2019-05-30',
    runtime: 132,
    genres: ['Comedy', 'Thriller', 'Drama'],
    overview:
      'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan as they infiltrate the Parks’ household.',
  },
  {
    id: '10',
    title: 'Blade Runner 2049',
    rating: 7.5,
    poster: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/sAtoMqDVhNDQBc3QJLUkaG7FYv7.jpg',
    releaseDate: '2017-10-06',
    runtime: 164,
    genres: ['Science Fiction', 'Drama', 'Mystery'],
    overview:
      'Young Blade Runner K’s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who has been missing for thirty years, in a neon-soaked future Los Angeles.',
  },
  {
    id: '11',
    title: 'Whiplash',
    rating: 8.5,
    poster: 'https://image.tmdb.org/t/p/w500/7fnvgSOQLPqS97jkE2WsZSrC0Jk.jpg',
    releaseDate: '2014-10-10',
    runtime: 107,
    genres: ['Drama'],
    overview:
      'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student’s potential.',
  },
  {
    id: '12',
    title: 'The Grand Budapest Hotel',
    rating: 8.1,
    poster: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXWrJBbMx2.jpg',
    releaseDate: '2014-03-28',
    runtime: 99,
    genres: ['Comedy', 'Drama'],
    overview:
      'A writer encounters the owner of an aging high-class hotel who tells him of his early years serving as a lobby boy in the hotel’s glorious years under an exceptional concierge.',
  },
  {
    id: '13',
    title: 'Arrival',
    rating: 7.9,
    poster: 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgrNUbhR0pR5QG75XD.jpg',
    releaseDate: '2016-11-11',
    runtime: 116,
    genres: ['Drama', 'Science Fiction', 'Mystery'],
    overview:
      'A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.',
  },
  {
    id: '14',
    title: 'Get Out',
    rating: 7.7,
    poster: 'https://image.tmdb.org/t/p/w500/tFXcEuwRmQ5nJVPRRkCguAAKnL.jpg',
    releaseDate: '2017-02-24',
    runtime: 104,
    genres: ['Mystery', 'Thriller'],
    overview:
      'A young African-American visits his white girlfriend’s parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.',
  },
  {
    id: '15',
    title: 'La La Land',
    rating: 8.0,
    poster: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
    releaseDate: '2016-12-09',
    runtime: 128,
    genres: ['Comedy', 'Drama'],
    overview:
      'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.',
  },
  {
    id: '16',
    title: 'Joker',
    rating: 8.2,
    poster: 'https://image.tmdb.org/t/p/w500/udDclJxH33jf9c3aoUf2GjzR0fH.jpg',
    releaseDate: '2019-10-04',
    runtime: 122,
    genres: ['Crime', 'Drama', 'Thriller'],
    overview:
      'During the 1980s, a failed stand-up comedian is driven insane and turns to a life of crime and chaos in Gotham City while society ignores the downtrodden.',
  },
  {
    id: '17',
    title: 'The Matrix',
    rating: 8.7,
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    releaseDate: '1999-03-31',
    runtime: 136,
    genres: ['Action', 'Science Fiction'],
    overview:
      'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
  },
  {
    id: '18',
    title: 'Spirited Away',
    rating: 8.6,
    poster: 'https://image.tmdb.org/t/p/w500/39wmItkWQfpqCgp8SjlfUdxd6cW.jpg',
    releaseDate: '2001-07-20',
    runtime: 125,
    genres: ['Animation', 'Fantasy', 'Adventure'],
    overview:
      'During her family’s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits — and where humans are changed into beasts.',
  },
];

/** Lookup helper used by the Details screen. */
export function getMovieById(id: string | string[] | undefined): Movie | undefined {
  const normalized = Array.isArray(id) ? id[0] : id;
  if (!normalized) return undefined;
  return MOVIES.find((movie) => movie.id === normalized);
}

/** Case-insensitive title / genre filter for real-time search. */
export function searchMovies(query: string): Movie[] {
  const q = query.trim().toLowerCase();
  if (!q) return MOVIES;
  return MOVIES.filter(
    (movie) =>
      movie.title.toLowerCase().includes(q) ||
      movie.genres.some((genre) => genre.toLowerCase().includes(q))
  );
}
