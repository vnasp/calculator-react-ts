import { useState } from 'react';

// Formateador para CLP
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value);
};

// Definir las propiedades que el componente recibirá
interface TableCalculatorProps {
  subpreparations: any[];
  ingredientPrices: { [key: string]: { size: number; price: number } };
  editable: { [key: string]: boolean };
  toggleEditable: (ingredientName: string) => void;
  handleInputChange: (ingredientName: string, field: string, value: number) => void;
  calculateCost: (ingredient: any) => { cost: number; leftover: number } | null;
  getIngredientDefaults: (ingredientName: string) => { size: number; price: number };
}

const TableCalculator: React.FC<TableCalculatorProps> = ({
  subpreparations,
  ingredientPrices,
  editable,
  toggleEditable,
  handleInputChange,
  calculateCost,
  getIngredientDefaults,
}) => {
  // Estado para gestionar las filas adicionales
  const [additionalRows, setAdditionalRows] = useState<
    { name: string; quantity: number; size: number; price: number }[]
  >([]);

  // Función para añadir una nueva fila
  const addRow = () => {
    setAdditionalRows([...additionalRows, { name: '', quantity: 0, size: 0, price: 0 }]);
  };

  // Función para manejar los cambios en las filas adicionales
  const handleAdditionalRowChange = (
    index: number,
    field: keyof { name: string; quantity: number; size: number; price: number },
    value: string | number
  ) => {
    const updatedRows = additionalRows.map((row, i) => {
      if (i === index) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setAdditionalRows(updatedRows);
  };

  // Calcular el costo total incluyendo las filas adicionales
  const calculateTotalCost = () => {
    let totalCost = 0;

    // Calcular el costo de los ingredientes predefinidos dentro de las subpreparaciones
    subpreparations.forEach((subprep) => {
      subprep.ingredients.forEach((ingredient: any) => {
        const result = calculateCost(ingredient);
        if (result) {
          totalCost += result.cost;
        }
      });
    });

    // Sumar el costo de los adicionales
    additionalRows.forEach((row) => {
      totalCost += row.price; // Suponemos que el campo "price" ya es el costo del adicional
    });

    return totalCost;
  };

  return (
    <>
      <table className="table table-striped table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Subpreparación</th>
            <th>Ingrediente</th>
            <th>Cantidad</th>
            <th>Tamaño Comprado</th>
            <th>Precio Comprado</th>
            <th>Costo</th>
            <th>Sobrante</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {subpreparations.map((subprep, subIndex) => (
            <>
              <tr key={`subprep-${subIndex}`} className="table-active">
                <td colSpan={8}><strong>{subprep.name}</strong></td>
              </tr>
              {subprep.ingredients.map((ingredient: any, idx: number) => {
                const result = calculateCost(ingredient);
                const defaults = getIngredientDefaults(ingredient.name);
                const isEditable = editable[ingredient.name];

                return (
                  <tr key={`${subprep.name}-${idx}`}>
                    <td></td>
                    <td>{ingredient.name}</td>
                    <td>{ingredient.quantity} {ingredient.unit}</td>
                    <td>
                      {isEditable ? (
                        <input
                          type="number"
                          className="form-control"
                          value={ingredientPrices[ingredient.name]?.size || ''}
                          onChange={(e) => handleInputChange(ingredient.name, 'size', parseFloat(e.target.value))}
                        />
                      ) : (
                        <span>{defaults.size} {ingredient.unit}</span>
                      )}
                    </td>
                    <td>
                      {isEditable ? (
                        <input
                          type="number"
                          className="form-control"
                          value={ingredientPrices[ingredient.name]?.price || ''}
                          onChange={(e) => handleInputChange(ingredient.name, 'price', parseFloat(e.target.value))}
                        />
                      ) : (
                        <span>{formatCurrency(defaults.price)}</span>
                      )}
                    </td>
                    <td>{result ? formatCurrency(result.cost) : 'N/A'}</td>
                    <td>{result ? `${result.leftover} ${ingredient.unit}` : 'N/A'}</td>
                    <td>
                      <button className="btn btn-outline-primary" onClick={() => toggleEditable(ingredient.name)}>
                        ✏️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </>
          ))}

          {/* Filas adicionales */}
          {additionalRows.map((row, index) => (
            <tr key={`additional-${index}`}>
              <td></td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={row.name}
                  onChange={(e) => handleAdditionalRowChange(index, 'name', e.target.value)}
                  placeholder="Nombre del adicional"
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={row.quantity}
                  onChange={(e) => handleAdditionalRowChange(index, 'quantity', parseFloat(e.target.value))}
                  placeholder="Cantidad"
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={row.size}
                  onChange={(e) => handleAdditionalRowChange(index, 'size', parseFloat(e.target.value))}
                  placeholder="Tamaño Comprado"
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={row.price}
                  onChange={(e) => handleAdditionalRowChange(index, 'price', parseFloat(e.target.value))}
                  placeholder="Precio Comprado"
                />
              </td>
              <td>{formatCurrency(row.price)}</td>
              <td></td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botón para agregar nueva fila */}
      <div className="text-end">
        <button className="btn btn-primary mt-4" onClick={addRow}>
          Agregar Adicional
        </button>
      </div>

      {/* Mostrar el costo total de la receta */}
      <div className="mt-4">
        <h2>Costo total de la receta: {formatCurrency(calculateTotalCost())}</h2>
      </div>
    </>
  );
};

export default TableCalculator;
