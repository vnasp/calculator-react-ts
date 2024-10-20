import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator } from '@fortawesome/free-solid-svg-icons';

const Header = () => {

  return (
    <header className="mb-4">
      <div className="header__top"></div>

      <div className="header__center">
        <img src="./assets/img/logo.png" alt="La Boquilla" width={350} />
      </div>

      <div className="header__bottom">
        <NavLink to="/costo-recetas">
          <FontAwesomeIcon icon={faCalculator} className="me-1" />  Calculadora Costo Recetas
        </NavLink>
        <NavLink to="/horas-hombre">
          <FontAwesomeIcon icon={faCalculator} className="me-1" />  Calculadora Horas Hombres
        </NavLink>
      </div>
    </header>
  );
};

export default Header;