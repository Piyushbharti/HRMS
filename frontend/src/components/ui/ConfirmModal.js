import React, { useEffect } from 'react';

/**
 * Modal confirmation dialog.
 * Props:
 *   open: boolean
 *   title: string
 *   message: string
 *   confirmLabel: string (default 'Confirm')
 *   cancelLabel: string (default 'Cancel')
 *   variant: 'danger' | 'warning' | 'info' (default 'danger')
 *   onConfirm: fn
 *   onCancel: fn
 */
function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  const iconMap = {
    danger: '🗑️',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className={`modal-icon-wrap modal-icon-${variant}`}>
          <span>{iconMap[variant]}</span>
        </div>
        <div className="modal-content">
          <h3 className="modal-title">{title}</h3>
          {message && <p className="modal-message">{message}</p>}
        </div>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={variant === 'danger' ? 'btn-danger-solid' : 'btn-primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
