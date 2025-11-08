import './css/App.css';
import Home from "./pages/Home";
import Favourite from "./pages/favourite";
import {Routes, Route} from 'react-router-dom';
import NavBar from './Components/NavBar';
import {MovieProvider} from "./contexts/MovieContext";
function App() {

  return (
    <MovieProvider>
    <div>
      <NavBar />
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/favourite" element={<Favourite />} />
      </Routes>
    </main>
    </div>
    </MovieProvider>
  );
}


export default App;