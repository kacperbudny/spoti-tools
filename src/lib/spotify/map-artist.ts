import type { Artist } from "@/lib/artist-playlist/artist";
import type { SpotifyArtist, SpotifyArtistSearch } from "@/lib/spotify/types";

export function mapSpotifyArtistSearch(page: SpotifyArtistSearch): Artist[] {
  return page.artists.items.map(mapSpotifyArtist);
}

function mapSpotifyArtist(artist: SpotifyArtist): Artist {
  const imageUrl = artist.images[0]?.url;

  if (!imageUrl) {
    return { id: artist.id, name: artist.name };
  }

  return { id: artist.id, name: artist.name, imageUrl };
}
