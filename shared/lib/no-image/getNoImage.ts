// shared/lib/no-image/getNoImage.ts

export function getNoImage(
  product: any
): string {

  const genres =
    product?.genres ?? [];

  const genreNames =
    genres.map(
      (g: any) =>
        typeof g === 'string'
          ? g
          : g.name
    );

  if (
    genreNames.includes('熟女')
  ) {
    return '/images/no-image/lounge.png';
  }

  if (
    genreNames.includes('人妻')
  ) {
    return '/images/no-image/lounge.png';
  }

  if (
    genreNames.includes('VR')
  ) {
    return '/images/no-image/cinema.png';
  }

  if (
    genreNames.includes('単体')
  ) {
    return '/images/no-image/silhouette.png';
  }

  if (
    genreNames.includes('素人')
  ) {
    return '/images/no-image/city.png';
  }

  return '/images/no-image/spotlight.png';
}