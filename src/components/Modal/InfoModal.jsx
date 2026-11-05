
import { useEffect } from "react";
import { X } from "lucide-react";
import "./InfoModal.css";

function InfoModal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = "500px",
}) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
        >
            <div
                className="modal-container"
                style={{ maxWidth }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 id="modal-title" className="modal-title">{title}</h3>

                    <button
                        type="button"
                        className="modal-close-button"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <X size={19} />
                    </button>
                </div>

                <div className="modal-content">
                    {children}
                </div>

                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

export default InfoModal;
