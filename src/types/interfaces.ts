export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface SubPreparation {
  name: string;
  ingredients: Ingredient[];
}

export interface Recipe {
  name: string;
  portions: number;
  subpreparations: SubPreparation[];
}

export interface Product {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  currency: string;
}

export interface DataContextType {
  recipes: Recipe[];
  products: Product[];
  formatPrice: (value: number) => string;
}

export interface TableCalculatorProps {
  subpreparations: SubPreparation[];
  ingredientPrices: { [key: string]: { size: number; price: number } };
  editable: { [key: string]: boolean };
  toggleEditable: (ingredientName: string) => void;
  handleInputChange: (ingredientName: string, field: 'size' | 'price', value: number) => void; // Cambiar aquí
  calculateCost: (ingredient: Ingredient) => { cost: number; leftover: number } | null;
  getIngredientDefaults: (ingredientName: string) => { size: number; price: number };
  portions: number;
}

export interface ResumeRecipeProps {
  recipeName: string;
  portions: number;
  totalCost: number;
  costPerPortion: number;
}