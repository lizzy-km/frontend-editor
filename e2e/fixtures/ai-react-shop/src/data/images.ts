const PHOTO_OPTIONS = "auto=format&fit=crop&w=800&q=80";

// Builds the https address of an Unsplash photo from its id.
export function unsplash(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?${PHOTO_OPTIONS}`;
}

export const CLOTHING_PHOTOS: readonly string[] = [
  "1521572163474-6864f9cf17ab",
  "1489987707025-afc232f7ea0f",
  "1515886657613-9f3515b0c78f",
  "1583743814966-8936f5b7be1a",
  "1512436991641-6745cdb1723f",
  "1556905055-8f358a7a47b2",
  "1503342217505-b0a15ec3261c",
  "1523381210434-271e8be1f52b",
];

export const HOME_PHOTOS: readonly string[] = [
  "1586363104862-3a5e2ab60d99",
  "1493663284031-b7e3aefcae8e",
  "1540518614846-7eded433c457",
  "1513694203232-719a280e022f",
  "1616486338812-3dadae4b4ace",
  "1441986300917-64674bd600d8",
];

export const STORE_PHOTO = "1441986300917-64674bd600d8";
