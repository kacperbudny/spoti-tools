import type { Artist } from "@/lib/artist-playlist/artist";
import type { SpotifyArtistSearch } from "@/lib/spotify/types";

export function mapSpotifyArtistSearch(page: SpotifyArtistSearch): Artist[] {
  return page.artists.items.map((artist) => ({
    id: artist.id,
    name: artist.name,
    imageUrl: artist.images[0]?.url,
  }));
}
