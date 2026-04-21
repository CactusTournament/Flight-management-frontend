import React, { useRef, useState } from "react";
import "./FlightsTableResizable.css";

/**
 * Generic resizable table component.
 * @param {Array} columns - [{ key, label, render?: (row, idx) => ReactNode }]
 * @param {Array} data - Array of row objects
 * @param {boolean} isAdmin - Show actions column
 * @param {function} onEdit - (row) => void
 * @param {function} onDelete - (row) => void
 * @param {string|number|null} editId - Row id being edited
 * @param {object} editValues - Values for editing (optional)
 * @param {function} onEditSave - (id) => void
 * @param {function} onEditCancel - () => void
 */
export default function ResizableTable({
  columns,
  data,
  isAdmin = false,
  onEdit,
  onDelete,
  editId,
  editValues = {},
  onEditSave,
  onEditCancel,
  renderActions
}) {
  const defaultPx = 140;
  const [colWidths, setColWidths] = useState(Array(columns.length).fill(defaultPx));
  const tableRef = useRef();
  const startX = useRef();
  const startWidths = useRef();
  const resizingCol = useRef();

  const handleMouseDown = (e, colIdx) => {
    e.preventDefault();
    startX.current = e.clientX;
    startWidths.current = [...colWidths];
    resizingCol.current = colIdx;

    const onMouseMove = (ev) => {
      const dx = ev.clientX - startX.current;
      const idx = resizingCol.current;
      const newWidths = [...startWidths.current];
      const minWidth = 40;
      let newWidthPx = startWidths.current[idx] + dx;
      if (newWidthPx < minWidth) newWidthPx = minWidth;
      newWidths[idx] = newWidthPx;
      setColWidths(newWidths);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Wrap table in a horizontally scrollable container with maxWidth 65vw
    // Responsive: wrap table in scrollable container
    // On mobile, allow horizontal scroll and max out at 98vw
    return (
      <div style={{ width: "100%", maxWidth: "98vw", overflowX: "auto", margin: "0 auto" }}>
        <table
          className="resizable-table"
          ref={tableRef}
          style={{ minWidth: "100%" }}
        >
          <colgroup>
            {columns.map((col, idx) => (
              <col key={col.key} style={{ width: colWidths[idx] + 'px' }} />
            ))}
            {isAdmin && <col key="actions" style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }} />}
          </colgroup>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key}
                  style={{ minWidth: 40, position: "relative", pointerEvents: "auto" }}
                >
                  {col.label}
                  <div
                    className="resizer"
                    onMouseDown={e => handleMouseDown(e, idx)}
                    role="separator"
                    aria-orientation="vertical"
                    tabIndex={0}
                    style={{ pointerEvents: "auto" }}
                  />
                </th>
              ))}
              {isAdmin && (
                <th style={{ minWidth: 150, maxWidth: 150, width: 150, position: "relative", pointerEvents: "auto" }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={row.id || rowIdx}>
                {columns.map((col, idx) => (
                  <td key={col.key} style={{ minWidth: 40 }}>
                    {col.render ? col.render(row, rowIdx) : row[col.key]}
                  </td>
                ))}
                {isAdmin && renderActions && (
                  <td style={{ minWidth: 150, maxWidth: 150, width: 150 }}>{renderActions(row)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  return (
    <div style={{ maxWidth: "65vw", overflowX: "auto", margin: "0 auto"}}>
      <table className="resizable-table" ref={tableRef} style={{ width: "max-content", minWidth: "100%" }}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key}
                style={{ width: colWidths[idx] + 'px', minWidth: 40, position: "relative", pointerEvents: "auto" }}
              >
                {col.label}
                {idx < columns.length - 1 && (
                  <div
                    className="resizer"
                    onMouseDown={e => handleMouseDown(e, idx)}
                    role="separator"
                    aria-orientation="vertical"
                    tabIndex={0}
                    style={{ pointerEvents: "auto" }}
                  />
                )}
              </th>
            ))}
            {isAdmin && <th style={{ minWidth: 40 }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={row.id || rowIdx}>
              {columns.map((col, colIdx) => (
                <td key={col.key} style={{ width: colWidths[colIdx] + 'px', minWidth: 40 }}>
                  {col.render
                    ? col.render(row, rowIdx, editId === row.id ? editValues : undefined)
                    : row[col.key]}
                </td>
              ))}
              {isAdmin && (
                <td style={{ minWidth: 40 }}>
                  {renderActions
                    ? renderActions(row)
                    : (
                      editId === row.id ? (
                        <>
                          <button onClick={() => onEditSave(row.id)}>Save</button>
                          <button onClick={onEditCancel}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => onEdit(row)}>Edit</button>
                          <button onClick={() => onDelete(row)}>Delete</button>
                        </>
                      )
                    )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
