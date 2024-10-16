import { createContext, useState, useEffect, ReactNode } from 'react';

// Definir las interfaces para los datos
// Definir las interfaces para los datos
interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface SubPreparation {
  name: string;
  ingredients: Ingredient[];
}

interface Recipe {
  name: string;
  portions: number;
  subpreparations: SubPreparation[];
}

interface Product {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  currency: string;
}

interface DataContextType {
  recipes: Recipe[];
  products: Product[];
}

export const DataContext = createContext<DataContextType | null>(null);

interface DataContextProviderProps {
  children: ReactNode;
}

export const DataContextProvider: React.FC<DataContextProviderProps> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Cargar los datos de los JSON al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Consumir el JSON de recetas
        const recipesResponse = await fetch('/data/Recipes.json');
        const recipesData = await recipesResponse.json();
        setRecipes(recipesData.recipes);

        // Consumir el JSON de productos
        const productsResponse = await fetch('/data/Products.json');
        const productsData = await productsResponse.json();
        setProducts(productsData.products);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ recipes, products }}>
      {children}
    </DataContext.Provider>
  );
};