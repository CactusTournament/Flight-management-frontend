import React from "react";


const CascadeDeleteModal = ({
  show,
  preview,
  onConfirm,
  onCancel,
  loading,
  error,
  entityName = "item",
  success,
  onClose
}) => {
  if (!show) return null;
  return (
    <div className="modal" style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000
    }}>
      <div className="modal-content" style={{
        background: '#232c4a', padding: 32, borderRadius: 12,
        minWidth: 320, maxWidth: 480, boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)',
        position: 'relative'
      }}>
        {/* X Close Button */}
        <button onClick={onClose || onCancel} aria-label="Close" style={{
          position: 'absolute', top: 12, right: 16, background: 'transparent', border: 'none', color: '#ff7220', fontSize: 24, cursor: 'pointer', fontWeight: 700
        }}>×</button>

        {success ? (
          <>
            <h3 style={{ marginTop: 0, color: '#2ecc40' }}>{entityName.charAt(0).toUpperCase() + entityName.slice(1)} was successfully deleted.</h3>
          </>
        ) : (
          <>
            <h3 style={{ marginTop: 0 }}>
              Are you sure you want to delete this {entityName}?
            </h3>
            {loading && <div>Loading preview...</div>}
            {!success && error && <div style={{ color: 'red' }}>{error}</div>}
            {preview && (
              <div style={{ marginBottom: 16 }}>
                <p>The following resources will also be deleted:</p>
                <ul>
                  {Object.entries(preview).map(([type, items]) =>
                    items.length > 0 ? (
                      <li key={type} style={{ marginBottom: 4 }}>
                        <strong>{type}:</strong> {items.map(i => i.name || i.id).join(", ")}
                      </li>
                    ) : null
                  )}
                </ul>
              </div>
            )}
            <button onClick={onConfirm}
              style={{
                marginRight: 12, background: '#ff7220', color: '#181c24',
                padding: '8px 18px', border: 'none', borderRadius: 6, fontWeight: 600
              }}>
              Yes, Delete
            </button>
            <button onClick={onCancel}
              style={{
                background: '#232c4a', color: '#ff7220', padding: '8px 18px',
                border: '1.5px solid #ff7220', borderRadius: 6, fontWeight: 600
              }}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CascadeDeleteModal;
