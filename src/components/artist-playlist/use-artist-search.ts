"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import type { Artist } from "@/lib/artist-playlist/artist";
import {
  ArtistSearchError,
  searchArtists,
} from "@/lib/artist-playlist/search-client";
import { SessionDeadError } from "@/lib/auth/errors";

export function useArtistSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Artist[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const searchMutation = useMutation({
    mutationFn: searchArtists,
    onMutate: () => {
      setMatches([]);
      setFormError(null);
    },
    onSuccess: (artists) => {
      setMatches(artists);
    },
    onError: (error) => {
      if (error instanceof SessionDeadError) {
        router.push("/");
        return;
      }

      setFormError(searchErrorMessage(error));
    },
  });

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = query.trim();

    if (!name) {
      return false;
    }

    searchMutation.mutate(name);
    return true;
  }

  return {
    query,
    matches,
    isSearching: searchMutation.isPending,
    hasSearched: searchMutation.isSuccess,
    errorMessage: formError,
    setQuery,
    handleSearch,
  };
}

function searchErrorMessage(error: unknown): string {
  if (error instanceof ArtistSearchError) {
    return error.message;
  }

  return "Something went wrong. Try again.";
}
