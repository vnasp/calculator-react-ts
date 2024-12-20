import { createContext, useState, useEffect, ReactNode } from 'react';
import { DataContextType, Product, Recipe } from './../interfaces/interfaces';

// Valores por defecto
const defaultDataContext: DataContextType = {
  recipes: [],
  products: [],
  formatPrice: (value: number) => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(value),
};

export const DataContext = createContext<DataContextType>(defaultDataContext);


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
        const recipesResponse = await fetch('./data/Recipes.json');
        const recipesData = await recipesResponse.json();
        setRecipes(recipesData.recipes);

        // Consumir el JSON de productos
        const productsResponse = await fetch('./data/Products.json');
        const productsData = await productsResponse.json();
        setProducts(productsData.products);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Formateador para CLP
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(value);
  };

  return (
    <DataContext.Provider value={{ recipes, products, formatPrice }}>
      {children}
    </DataContext.Provider>
  );
};
