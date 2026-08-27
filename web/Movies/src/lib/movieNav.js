export function movieLocationState(movie, location) {
  return {
    background: location.state?.background ?? location,
    preview: {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
    },
  };
}

export function posterLayoutId(id) {
  return `cinematic-poster-${String(id)}`;
}
