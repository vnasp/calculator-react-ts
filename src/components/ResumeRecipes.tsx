import { useContext } from "react";
import { DataContext } from "../context/DataContext";
import { ResumeRecipeProps } from "../types/interfaces";


const ResumeRecipe: React.FC<ResumeRecipeProps> = ({ recipeName, portions, totalCost, costPerPortion }) => {
  const dataContext = useContext(DataContext);
  const { formatPrice } = dataContext;
  
  return (
    <>
      <div className="card shadow p-4">
        <div className="card-title fs-4 d-flex justify-content-start align-items-center gap-3">
          <span className="step-circle">3</span>
          <label htmlFor="recipe-select" className="me-2">Costos calculados:</label>
        </div>
        <div className="card-body">
          <p><strong>Receta:</strong> {recipeName}</p>
          <p><strong>Porciones:</strong> {portions}</p>
          <p><strong>Costo total:</strong> {formatPrice(totalCost)}</p>
          <p><strong>Costo por porción:</strong> {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(costPerPortion)}</p>
        </div>
      </div>
    </>
  );
};

export default ResumeRecipe;
