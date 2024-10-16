import { Route, Routes } from "react-router-dom";
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './views/Home';
import RecipesCost from './views/RecipesCost';
import MenHours from './views/MenHours';
import Error404 from './views/Error404';


const App = () => {

  return (
    <div>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/costo-recetas" element={<RecipesCost />} />
        <Route path="/horas-hombre" element={<MenHours />} />
        <Route path="*" element={<Error404 />} />
      </Routes>

      <Footer />
    </div>
  );
};

export default App;
