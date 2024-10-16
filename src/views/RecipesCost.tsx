import { useContext, useState } from 'react';
import { DataContext } from './../context/DataContext';
import TableCalculator from './../components/TableCalculator';

const RecipesCost = () => {
  const dataContext = useContext(DataContext);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [ingredientPrices, setIngredientPrices] = useState<{ [key: string]: { size: number; price: number } }>({});
  const [editable, setEditable] = useState<{ [key: string]: boolean }>({});

  if (!dataContext) {
    return <div>Cargando...</div>;
  }

  const { recipes, products } = dataContext;

  // Manejar el cambio en el selector de receta
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRecipe(e.target.value);
    setIngredientPrices({});
    setEditable({});
  };

  // Manejar el cambio de los inputs de tamaño y precio
  const handleInputChange = (ingredientName: string, field: string, value: number) => {
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
  };

  // Calcular el costo por ingrediente
  const calculateCost = (ingredient: any) => {
    const size = ingredientPrices[ingredient.name]?.size || getIngredientDefaults(ingredient.name).size;
    const price = ingredientPrices[ingredient.name]?.price || getIngredientDefaults(ingredient.name).price;
    if (size && price) {
      const cost = Math.round((ingredient.quantity / size) * price);
      const leftover = Math.round(size - ingredient.quantity);
      return { cost, leftover };
    }
    return null;
  };

  return (
    <main>
      <h1 className="text-center">Calculadora de Costos de Recetas</h1>

      <div className="text-center my-5 fs-3">
        <label htmlFor="recipe-select"> 📋 Elige una receta:</label>
        <select id="recipe-select" value={selectedRecipe} onChange={handleSelectChange} className="form-select form-select-lg">
          <option value="">--Selecciona una receta--</option>
          {recipes.map((recipe, index) => (
            <option key={index} value={recipe.name}>
              {recipe.name}
            </option>
          ))}
        </select>
      </div>

      {selectedRecipe && (
        <TableCalculator
          subpreparations={recipes.find((recipe) => recipe.name === selectedRecipe)?.subpreparations || []}
          ingredientPrices={ingredientPrices}
          editable={editable}
          toggleEditable={toggleEditable}
          handleInputChange={handleInputChange}
          calculateCost={calculateCost}
          getIngredientDefaults={getIngredientDefaults}
        />
      )}
    </main>
  )
}

export default RecipesCost;
