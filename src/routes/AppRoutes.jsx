
import { Navigate, Route, Routes, } from "react-router-dom";
import { useSelector } from "react-redux";
import MainLayout from "../components/layout/MainLayout";
import TrackerPage from "../pages/TrackerPage";
import DailySpendingPage from "../pages/Finance/DailySpending/DailySpendingPage";
import Dashboard from "../pages/Finance/Dashboard/Dashboard";
import RoleManagement from "../pages/roleManagement/RoleManagement";
import UsersManagement from "../pages/roleManagement/UsersManagement";
import { navigationItems } from "../config/navigation";
import { selectHasPermission, selectIsAdmin, selectPermissionLoading } from "../features/permissions/permissionSlice";
import Login from "../pages/Login/Login";
import MonthlySpendingPage from "../pages/Finance/MonthlySpending/MonthlySpendingPage";
import YearlySpendingPage from "../pages/Finance/YearlySpending/YearlySpendingPage";
import DebtOverview from "../features/debt/pages/DebtOverview/DebtOverview";
// import MonthlyDebtSummary from "../features/debt/pages/MonthlyDebtSummary/MonthlyDebtSummary";
// import YearlyDebtSummary from "../features/debt/pages/YearlyDebtSummary/YearlyDebtSummary";
// import DebtPaymentHistory from "../features/debt/pages/DebtPaymentHistory/DebtPaymentHistory";
import DebtActivityHistory from "../features/debt/pages/DebtActivityHistory/DebtActivityHistory";
import AllDebtsContainer from "../features/debt/pages/AllDebtsContainer";
import MonthlyDebtUpdateContainer from "../features/debt/pages/MonthlyDebtUpdate/MonthlyDebtUpdateContainer/MonthlyDebtUpdateContainer";

function ProtectedPage({ componentKey, adminOnly, children }) {
    const isAdmin = useSelector(selectIsAdmin);
    const permissionLoading = useSelector(selectPermissionLoading);
    const hasPermission = useSelector(
        selectHasPermission(componentKey)
    );

    if (permissionLoading) {
        return <div>Checking permissions...</div>;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/finance/dashboard" replace />;
    }

    if (!hasPermission) {
        return <Navigate to="/finance/dashboard" replace />;
    }

    return children;
}


const customPages = {
    "/login": Login,

    // Finance
    "/finance/dashboard": Dashboard,
    "/finance/daily-spending": DailySpendingPage,
    "/finance/monthly-spending": MonthlySpendingPage,
    "/finance/yearly-spending": YearlySpendingPage,

    // Debt Management
    "/debt/debt-overview": DebtOverview,
    "/debt/outstanding": AllDebtsContainer,
    "/debt/monthly-update": MonthlyDebtUpdateContainer,
    // "/debt/monthly-summary": MonthlyDebtSummary,
    // "/debt/yearly-summary": YearlyDebtSummary,
    // "/debt/payment-history": DebtPaymentHistory,
    "/debt/activity-history": DebtActivityHistory,
    // User Management
    "/user-management/roles": RoleManagement,
    "/user-management/users": UsersManagement,
};


function AppRoutes() {
    const routes = navigationItems.flatMap((item) => {
        if (item.children) {
            return item.children.map((child) => ({
                ...child,
                icon: item.icon,
            }));
        }

        return [item];
    });

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route
                    path="/"
                    element={
                        <Navigate to="/finance/dashboard" replace />
                    }
                />

                {routes.map((page) => {
                    const CustomPage = customPages[page.path];

                    const PageComponent = CustomPage
                        ? <CustomPage />
                        : (
                            <TrackerPage
                                title={page.title}
                                description={page.description}
                                icon={page.icon}
                            />
                        );

                    return (
                        <Route
                            key={page.path}
                            path={page.path}
                            element={
                                <ProtectedPage
                                    componentKey={page.componentKey}
                                    adminOnly={page.adminOnly}
                                >
                                    {PageComponent}
                                </ProtectedPage>
                            }
                        />
                    );
                })}

                <Route
                    path="*"
                    element={
                        <Navigate to="/finance/dashboard" replace />
                    }
                />
            </Route>
        </Routes>
    );
}

export default AppRoutes;
