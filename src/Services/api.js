const API_KEY = "5819a7bfbf8d09e441f3737063f14934";
const BASE_URL = "https://api.themoviedb.org/3";

export const getPopularMovies = async () => {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    const data = await response.json();
    console.log("البيانات الكاملة من الأفلام الشائعة:", data);
    return data.results;
};

export const searchMovies = async (query) => {
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await response.json();
    console.log("البيانات الكاملة من البحث:", data);
    return data.results;
};