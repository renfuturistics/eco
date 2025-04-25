import { create } from "zustand";
import { TrackWithPlaylist, Artist, Playlist } from "../helpers/types";
import { unknownTrackImageUri } from "../constants/images/images";
import { Track } from "react-native-track-player";

interface LibraryState {
  tracks: TrackWithPlaylist[];
  addTrack: (track: TrackWithPlaylist) => void;
  toggleTrackFavorite: (track: Track) => void;
  addToPlaylist: (track: Track, playlistName: string) => void;
}

export const useLibraryStore = create<LibraryState>()((set) => ({
  tracks: [],
  addTrack: (newTrack: TrackWithPlaylist) =>
    set((state) => {
      const exists = state.tracks.some((track) => track.url === newTrack.url);
      if (exists) return state;
      return { tracks: [...state.tracks, newTrack] };
    }),
  toggleTrackFavorite: (track) =>
    set((state) => ({
      tracks: state.tracks.map((currentTrack) => {
        if (currentTrack.url === track.url) {
          return {
            ...currentTrack,
            rating: currentTrack.rating === 1 ? 0 : 1,
          };
        }
        return currentTrack;
      }),
    })),
  addToPlaylist: (track, playlistName) =>
    set((state) => ({
      tracks: state.tracks.map((currentTrack) => {
        if (currentTrack.url === track.url) {
          return {
            ...currentTrack,
            playlist: [...(currentTrack.playlist ?? []), playlistName],
          };
        }
        return currentTrack;
      }),
    })),
}));

// Export addTrack directly
export const useAddTrack = () => useLibraryStore((state) => state.addTrack);

// Export other selectors as needed
export const useTracks = () => useLibraryStore((state) => state.tracks);
export const useFavorites = () => {
  const favorites = useLibraryStore((state) =>
    state.tracks.filter((track) => track.rating === 1)
  );
  const toggleTrackFavorite = useLibraryStore(
    (state) => state.toggleTrackFavorite
  );
  return { favorites, toggleTrackFavorite };
};
