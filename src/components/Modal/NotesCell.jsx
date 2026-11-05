
import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import "./NotesCell.css"

function NotesCell({ notes, onView }) {
    const textRef = useRef(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        const element = textRef.current;
        if (!element) return;

        const checkOverflow = () => {
            setIsOverflowing(
                element.scrollWidth > element.clientWidth
            );
        };

        checkOverflow();

        const observer = new ResizeObserver(checkOverflow);
        observer.observe(element);

        return () => observer.disconnect();
    }, [notes]);

    if (!notes) return <>—</>;

    return (
        <div className="notes-content">
            <span ref={textRef} className="notes-text">
                {notes}
            </span>

            {isOverflowing && (
                <button
                    type="button"
                    className="notes-info-button"
                    title="View full notes"
                    aria-label="View full notes"
                    onClick={() => onView(notes)}
                >
                    <Info size={15} />
                </button>
            )}
        </div>
    );
}

export default NotesCell;
