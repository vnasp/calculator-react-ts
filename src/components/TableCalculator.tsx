import { useState } from 'react';
import { TableCalculatorProps, Ingredient } from './../types/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';

// Formateador para CLP
const formatPrice = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(value);
};

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

  // Función para eliminar una fila
  const removeRow = (index: number) => {
    setAdditionalRows(additionalRows.filter((_, i) => i !== index));
  };

  // Función para manejar los cambios en las filas adicionales
  const handleAdditionalRowChange = (
    index: number,
    field: keyof typeof additionalRows[0],
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


  return (
    <>
      <div className="card shadow p-4">
        <div className="card-title text-center fs-4 d-flex justify-content-start align-items-center gap-3">
          <span className="step-circle">2</span>
          <label htmlFor="recipe-select" className="me-2">Edita o agrega ingredientes:</label>
        </div>
        <div className="card-body">
          <table className="table table-striped table-bordered">
            <thead className="thead-dark">
              <tr>
                <th></th>
                <th>Ingredientes</th>
                <th>Cantidad</th>
                <th>Tamaño Comprado</th>
                <th>Precio de Compra</th>
                <th>Costo</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {subpreparations.map((subprep, subIndex) => (
                <>
                  <tr key={`subprep-${subIndex}`} className="table-active">
                    <td colSpan={7}><strong>{subprep.name}</strong></td>
                  </tr>
                  {subprep.ingredients.map((ingredient: Ingredient, idx: number) => {
                    const result = calculateCost(ingredient);
                    const defaults = getIngredientDefaults(ingredient.name);
                    const isEditable = editable;
                    const isNegativeLeftover = result && result.leftover < 0;

                    return (
                      <tr key={`${subprep.name}-${idx}`}>
                        <td className="text-center">{isNegativeLeftover && <span className="ms-2">⚠️</span>}
                        </td>
                        <td>{ingredient.name}</td>
                        <td>{ingredient.quantity} {ingredient.unit}</td>
                        <td>
                          {isEditable[ingredient.name] ? (
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
                          {isEditable[ingredient.name] ? (
                            <input
                              type="number"
                              className="form-control"
                              value={ingredientPrices[ingredient.name]?.price || ''}
                              onChange={(e) => handleInputChange(ingredient.name, 'price', parseFloat(e.target.value))}
                            />
                          ) : (
                            <span>{formatPrice(defaults.price)}</span>
                          )}
                        </td>

                        <td>{result ? formatPrice(result.cost) : 'N/A'}</td>
                        <td className="text-center">
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
                  <td>{formatPrice(row.price)}</td>
                  <td className="text-center">
                    <button className="btn btn-outline-primary" onClick={() => removeRow(index)}>
                      ✖️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Botón para agregar nueva fila */}
          <div className="text-end">
            <button className="btn btn-primary mt-4" onClick={addRow}>
              <FontAwesomeIcon icon={faCirclePlus} /> Agregar Adicional
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableCalculator;
