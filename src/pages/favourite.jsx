import "../css/Favorites.css";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../Components/MovieCard";
import { MdFavorite, MdDelete } from 'react-icons/md';
import { BiCameraMovie } from 'react-icons/bi';
import { Link } from 'react-router-dom';

function Favourite() {
    const { favorites, clearAllFavorites } = useMovieContext();

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to remove all favorites?')) {
            clearAllFavorites();
        }
    };

    return (
        <div className="favorites">
            {favorites && favorites.length > 0 ? (
                <>
                    <div className="favorites-header">
                        <h2>
                            <MdFavorite size={32} />
                            My Favorites
                        </h2>
                        <span className="favorites-count">
                            {favorites.length} {favorites.length === 1 ? 'Movie' : 'Movies'}
                        </span>
                    </div>
                    
                    {favorites.length > 1 && (
                        <div className="favorites-actions">
                            <button 
                                className="clear-all-btn"
                                onClick={handleClearAll}
                            >
                                <MdDelete size={18} />
                                Clear All
                            </button>
                        </div>
                    )}

                    <div className="movie-grid favorites-grid">
                        {favorites.map((movie) => (
                            <MovieCard movie={movie} key={movie.id} />
                        ))}
                    </div>
                </>
            ) : (
                <div className="favorites-empty">
                    <div className="favorites-empty-icon">
                        <MdFavorite />
                    </div>
                    <h2>No Favorites Yet!</h2>
                    <p>
                        Start building your collection by adding movies to your favorites.
                        <br />
                        Discover amazing films and save your favorites here!
                    </p>
                    <Link to="/" className="favorites-empty-button">
                        <BiCameraMovie size={20} />
                        Explore Movies
                    </Link>
                </div>
            )}
        </div>
    );
}

export default Favourite;