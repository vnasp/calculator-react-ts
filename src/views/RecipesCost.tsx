import { useContext, useState } from 'react';
import { DataContext } from './../context/DataContext';
import { Ingredient } from '../types/interfaces';
import TableCalculator from './../components/TableCalculator';
import ResumeRecipe from '../components/ResumeRecipes';

const RecipesCost = () => {
  const dataContext = useContext(DataContext);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [ingredientPrices, setIngredientPrices] = useState<{ [key: string]: { size: number; price: number } }>({});
  const [editable, setEditable] = useState<{ [key: string]: boolean }>({});
  const { recipes, products } = dataContext;

  // Manejar el cambio en el selector de receta
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRecipe(e.target.value);
    setIngredientPrices({});
    setEditable({});
  };

  // Manejar el cambio de los inputs de tamaño y precio para un ingrediente específico
  const handleInputChange = (ingredientName: string, field: 'size' | 'price', value: number) => {
    setIngredientPrices((prev) => ({
      ...prev,
      [ingredientName]: {
        ...prev[ingredientName],
        [field]: value,
      },
    }));
  };


  // Obtener valores de Products.json o de los inputs del usuario
  const getIngredientDefaults = (ingredientName: string) => {
    const product = products.find((p) => p.name === ingredientName);
    return product ? { size: product.quantity, price: product.price } : { size: 0, price: 0 };
  };

  // Cambiar el modo editable al hacer clic en el lápiz
  const toggleEditable = (ingredientName: string) => {
    setEditable((prev) => ({
      ...prev,
      [ingredientName]: !prev[ingredientName]
    }));
  }

    // Calcular el costo por ingrediente
    const calculateCost = (ingredient: Ingredient) => {
      const size = ingredientPrices[ingredient.name]?.size || getIngredientDefaults(ingredient.name).size;
      const price = ingredientPrices[ingredient.name]?.price || getIngredientDefaults(ingredient.name).price;
      if (size && price) {
        const cost = Math.round((ingredient.quantity / size) * price);
        const leftover = Math.round(size - ingredient.quantity);
        return { cost, leftover };
      }
      return null;
    };

    const selectedRecipeObj = recipes.find((recipe) => recipe.name === selectedRecipe);

    const calculateTotalCost = () => {
      if (!selectedRecipeObj) return 0;

      let totalCost = 0;

      selectedRecipeObj.subpreparations.forEach((subprep) => {
        subprep.ingredients.forEach((ingredient) => {
          const result = calculateCost(ingredient);
          if (result) {
            totalCost += result.cost;
          }
        });
      });

      return totalCost;
    };
    const totalCost = calculateTotalCost();
    const costPerPortion = selectedRecipeObj ? totalCost / selectedRecipeObj.portions : 0;

    return (
      <main>
        <h1 className="text-center py-5">Calculadora de Costos de Recetas</h1>
        <div className="card shadow p-4">
          <div className="card-title">
            <div className="text-center fs-4 d-flex justify-content-start align-items-center gap-3">
              <span className="step-circle">1</span>
              <label htmlFor="recipe-select" className="me-2">Elige una receta:</label>
              <select id="recipe-select" value={selectedRecipe} onChange={handleSelectChange} className="form-select form-select-lg w-auto">
                <option value="">--Selecciona una receta--</option>
                {recipes.map((recipe) => (
                  <option key={recipe.name} value={recipe.name}>
                    {recipe.name} ({recipe.portions} porciones)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedRecipeObj && (
          <div className="row my-5">
            <div className="col-md-8">
              <TableCalculator
                subpreparations={selectedRecipeObj.subpreparations || []}
                ingredientPrices={ingredientPrices}
                editable={editable}
                toggleEditable={toggleEditable}
                handleInputChange={handleInputChange}
                calculateCost={calculateCost}
                getIngredientDefaults={getIngredientDefaults}
                portions={selectedRecipeObj.portions}
              />
            </div>
            <div className="col-md-4">
              <ResumeRecipe
                recipeName={selectedRecipeObj.name}
                portions={selectedRecipeObj.portions}
                totalCost={totalCost}
                costPerPortion={costPerPortion}
              />
            </div>
          </div>
        )}
      </main>
    );
  };

  export default RecipesCost;
