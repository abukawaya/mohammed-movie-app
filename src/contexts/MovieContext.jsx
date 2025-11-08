import { createContext, useState, useContext, useEffect } from "react";

// Create context
const MovieContext = createContext();

// Custom hook to use MovieContext
export const useMovieContext = () => useContext(MovieContext);

// Provider component
export const MovieProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Get favorites from localStorage when component mounts
  useEffect(() => {
    const storedFavs = localStorage.getItem("favorites");
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (error) {
        console.error("Error parsing favorites from localStorage:", error);
        setFavorites([]);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Add movie to favorites
  const addToFavorites = (movie) => {
    setFavorites((prev) => {
      // Check if movie already exists to avoid duplicates
      if (prev.some((fav) => fav.id === movie.id)) {
        return prev;
      }
      return [...prev, movie];
    });
  };

  // Remove movie from favorites
  const removeFromFavorites = (movieId) => {
    setFavorites((prev) => prev.filter((movie) => movie.id !== movieId));
  };

  // Check if a movie is favorite
  const isFavorite = (movieId) => {
    return favorites.some((movie) => movie.id === movieId);
  };

  // Toggle favorite (add if not exists, remove if exists)
  const toggleFavorite = (movie) => {
    if (isFavorite(movie.id)) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }
  };

  // Clear all favorites
  const clearAllFavorites = () => {
    setFavorites([]);
    localStorage.setItem("favorites", JSON.stringify([]));
  };

  // Get favorites count
  const favoritesCount = favorites.length;

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    clearAllFavorites,
    favoritesCount,
  };

  // Pass value to the Provider
  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};