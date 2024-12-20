import { useState } from 'react';
import { TableCalculatorProps, Ingredient } from './../interfaces/interfaces';
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
  calculateAdditionalRowCost,
  getIngredientDefaults,
}) => {

  // Estado para gestionar las filas adicionales
  const [additionalRows, setAdditionalRows] = useState<
    { name: string; quantity: number; size: number; price: number; unit: string }[]
  >([]);

  // Función para añadir una nueva fila
  const addRow = () => {
    setAdditionalRows([...additionalRows, { name: '', quantity: 0, size: 0, price: 0, unit: 'g' }]);
  };

  // Función para eliminar una fila
  const removeRow = (index: number) => {
    setAdditionalRows(additionalRows.filter((_, i) => i !== index));
  };

  // Función para manejar los cambios en las filas adicionales
  const handleAdditionalRowChange = (
    index: number,
    field: 'name' | 'quantity' | 'size' | 'price' | 'unit', // Ahora incluye "unit"
    value: string | number
  ) => {
    setAdditionalRows((prevRows) =>
      prevRows.map((row, i) => {
        if (i === index) {
          const updatedRow = { ...row, [field]: value };

          // Validar y convertir unidades si se cambia la unidad
          if (field === 'unit' && typeof value === 'string') {
            if (row.unit === 'g' && value === 'kg') {
              updatedRow.size = (updatedRow.size || 0) / 1000; // Convertir g a kg
            } else if (row.unit === 'kg' && value === 'g') {
              updatedRow.size = (updatedRow.size || 0) * 1000; // Convertir kg a g
            } else if (row.unit === 'mL' && value === 'L') {
              updatedRow.size = (updatedRow.size || 0) / 1000; // Convertir mL a L
            } else if (row.unit === 'L' && value === 'mL') {
              updatedRow.size = (updatedRow.size || 0) * 1000; // Convertir L a mL
            } else if (row.unit === 'un' && value !== 'un') {
              alert('Solo se permite "un" como unidad');
            }
          }

          return updatedRow;
        }
        return row;
      })
    );
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

                        {/* Nombre ingrediente */}
                        <td>{ingredient.name}</td>

                        {/* Cantidad según receta */}
                        <td>{ingredient.quantity} {ingredient.unit}</td>

                        {/* Tamaño comprado */}
                        <td>
                          {isEditable[ingredient.name] ? (
                            <div className="d-flex">
                              <input
                                type="number"
                                className="form-control d-inline"
                                value={ingredientPrices[ingredient.name]?.size || ''}
                                onChange={(e) => handleInputChange(ingredient.name, 'size', parseFloat(e.target.value))}
                              />
                              <select
                                className="form-select d-inline w-auto ms-2"
                                value={ingredientPrices[ingredient.name]?.unit || ingredient.unit}
                                onChange={(e) => handleInputChange(ingredient.name, 'unit', e.target.value)}
                              >
                                <option value="un">un</option>
                                <option value="g">g</option>
                                <option value="kg">kg</option>
                                <option value="mL">mL</option>
                                <option value="L">L</option>
                              </select>
                            </div>
                          ) : (
                            <span>
                              {ingredientPrices[ingredient.name]?.size || ingredient.quantity} {ingredientPrices[ingredient.name]?.unit || ingredient.unit}
                            </span>
                          )}
                        </td>

                        {/* Precio de Compra */}
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

                        {/* Costo */}
                        <td>{result ? formatPrice(result.cost) : 'N/A'}</td>

                        {/* Acción: editar */}
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
                    <div className="d-flex">
                      <input
                        type="number"
                        className="form-control d-inline"
                        value={row.size || ''}
                        onChange={(e) => handleAdditionalRowChange(index, 'size', parseFloat(e.target.value))}
                        placeholder="Tamaño Comprado"
                      />
                      <select
                        className="form-select d-inline w-auto ms-2"
                        value={row.unit || 'g'}
                        onChange={(e) => handleAdditionalRowChange(index, 'unit', e.target.value)}
                      >
                        <option value="un">un</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="mL">mL</option>
                        <option value="L">L</option>
                      </select>
                    </div>
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
                  <td>
                    {calculateAdditionalRowCost(row)?.cost ? formatPrice(calculateAdditionalRowCost(row)!.cost) : 'N/A'}
                  </td>
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
