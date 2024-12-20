import { useContext, useState } from 'react';
import { DataContext } from './../context/DataContext';
import { Ingredient } from '../interfaces/interfaces';
import TableCalculator from './../components/TableCalculator';
import ResumeRecipe from '../components/ResumeRecipes';

const RecipesCost = () => {
  const dataContext = useContext(DataContext);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [ingredientPrices, setIngredientPrices] = useState<{ [key: string]: { size: number; price: number, unit: string } }>({});
  const [editable, setEditable] = useState<{ [key: string]: boolean }>({});
  const { recipes, products } = dataContext;

  // Manejar el cambio en el selector de receta
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRecipe(e.target.value);
    setIngredientPrices({});
    setEditable({});
  };

  // Manejar el cambio de los inputs de tamaño y precio para un ingrediente específico
  const handleInputChange = (ingredientName: string, field: 'size' | 'price' | 'unit', value: number | string) => {
    setIngredientPrices((prev) => {
      const updated = { ...prev[ingredientName], [field]: value };
  
      if (field === 'unit' && typeof value === 'string') {
        const recipeUnit = prev[ingredientName]?.unit || 'g';
        if (recipeUnit === 'g' && value === 'kg') {
          updated.size = (updated.size || 0) / 1000;
        } else if (recipeUnit === 'kg' && value === 'g') {
          updated.size = (updated.size || 0) * 1000;
        } else if (recipeUnit === 'mL' && value === 'L') {
          updated.size = (updated.size || 0) / 1000; 
        } else if (recipeUnit === 'L' && value === 'mL') {
          updated.size = (updated.size || 0) * 1000; 
        } else if (recipeUnit === 'un' && value !== 'un') {
          alert('Solo se permite "un" como unidad');
          return prev;
        }
      }
  
      return {
        ...prev,
        [ingredientName]: updated,
      };
    });
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
      const ingredientData = ingredientPrices[ingredient.name] || getIngredientDefaults(ingredient.name);
    
      // Unidad y tamaño del ingrediente comprado
      const { size, price, unit } = ingredientData;
    
      // Validar que haya un precio y tamaño definido
      if (!size || !price) return null;
    
      // Unidad de la receta
      const recipeUnit = ingredient.unit;
    
      // Convertir el tamaño comprado a la misma unidad que la receta
      let convertedSize = size;
    
      if (recipeUnit === 'g' && unit === 'kg') {
        convertedSize = size * 1000; // Convertir kg a g
      } else if (recipeUnit === 'kg' && unit === 'g') {
        convertedSize = size / 1000; // Convertir g a kg
      } else if (recipeUnit === 'mL' && unit === 'L') {
        convertedSize = size * 1000; // Convertir L a mL
      } else if (recipeUnit === 'L' && unit === 'mL') {
        convertedSize = size / 1000; // Convertir mL a L
      } else if (recipeUnit === 'un' && unit !== 'un') {
        // Si la unidad no es compatible, mostrar un error
        console.warn(`Unidad incompatible: ${unit} no puede usarse con ${recipeUnit}`);
        return null;
      }
    
      // Calcular el costo usando el tamaño convertido
      const cost = Math.round((ingredient.quantity / convertedSize) * price);
      const leftover = Math.round(convertedSize - ingredient.quantity);
    
      return { cost, leftover };
    };


    // Calcular el costo para filas adicionales
    const calculateAdditionalRowCost = (row: { quantity: number; size: number; price: number; unit: string }) => {
      const { quantity, size, price } = row;
    
      if (!quantity || !size || !price) return null;
    
      let convertedSize = size;
    
      // Calcular el costo usando el tamaño convertido
      const cost = Math.round((quantity / convertedSize) * price);
    
      return { cost };
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
                calculateAdditionalRowCost={calculateAdditionalRowCost}
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
