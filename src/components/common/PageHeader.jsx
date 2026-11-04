
import {
    Wallet,
    UserRound,
    House,
    CreditCard,
    PiggyBank,
    Landmark,
    CalendarDays,
    Target,
    Bookmark
  } from "lucide-react";
  
  const icons = {
    Wallet,
    UserRound,
    House,
    CreditCard,
    PiggyBank,
    Landmark,
    CalendarDays,
    Target,
    Bookmark
  };
  
  function PageHeader({ title, description, icon }) {
    const Icon = icons[icon] || Wallet;
  
    return (
      <div className="page-header">
        <div className="page-title-icon">
          <Icon size={25} />
        </div>
  
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
    );
  }
  
  export default PageHeader;
  