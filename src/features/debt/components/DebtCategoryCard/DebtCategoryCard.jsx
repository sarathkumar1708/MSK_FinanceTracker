import { ChevronRight } from "lucide-react";
import "./DebtCategoryCard.css";

export default function DebtCategoryCard({
    title,
    count = 0,
    icon: Icon,
    onClick,
}) {
    return (
        <button
            type="button"
            className="debt-category-card"
            onClick={onClick}
        >
            <div className="debt-category-card-top">
                <div className="debt-category-icon">
                    {Icon && <Icon size={22} />}
                </div>

                <span className="debt-category-count">
                    {count}
                </span>
            </div>

            <div className="debt-category-card-bottom">
                <h3>{title}</h3>

                <span className="debt-category-view">
                    View Debts
                    <ChevronRight size={16} />
                </span>
            </div>
        </button>
    );
}