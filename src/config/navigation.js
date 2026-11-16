
export const navigationItems = [
    {
        id: "finance",
        title: "Finance",
        icon: "Wallet",
        children: [
            {
                title: "Dashboard",
                path: "/finance/dashboard",
                componentKey: "finance.dashboard",
                description: "Your complete financial overview.",
            },
            {
                title: "Daily Spending",
                path: "/finance/daily-spending",
                componentKey: "finance.daily",
                description: "Manage your daily expenses and transactions.",
            },
            {
                title: "Monthly Spending",
                path: "/finance/monthly-spending",
                componentKey: "finance.monthly",
                description: "Review your monthly expense summary.",
            },
            {
                title: "Yearly Spending",
                path: "/finance/yearly-spending",
                componentKey: "finance.yearly",
                description: "Analyze your yearly financial activities.",
            },

        ],
    },
    {
        id: "my-tracker",
        title: "My Tracker",
        icon: "UserRound",
        children: [
            {
                title: "Official Profile",
                path: "/my-tracker/official-profile",
                componentKey: "tracker.official-profile",
                description: "Manage your professional profile and career details.",
            },
            {
                title: "Personal",
                path: "/my-tracker/personal",
                componentKey: "tracker.personal",
                description: "Manage your personal information.",
            },
            {
                title: "My Events",
                path: "/my-tracker/my-events",
                componentKey: "tracker.my-events",
                description: "Manage celebrations, gifts, and event contributions.",
            },
            {
                title: "Seervarisai",
                path: "/my-tracker/seervarisai",
                componentKey: "tracker.seervarisai",
                description: "Track family Seervarisai contributions and expenses.",
            },
        ],
    },
    // {
    //     id: "home-essentials",
    //     title: "Home Essentials",
    //     icon: "House",
    //     children: [
    //         {
    //             title: "Bills",
    //             path: "/home-essentials/bills",
    //             componentKey: "home.bills",
    //             description: "Manage household bills and payment dates.",
    //         },
    //         {
    //             title: "Monthly Needs",
    //             path: "/home-essentials/monthly-needs",
    //             componentKey: "home.monthly-needs",
    //             description: "Track your monthly household requirements.",
    //         },
    //         {
    //             title: "Weekly Planning",
    //             path: "/home-essentials/weekly-planning",
    //             componentKey: "home.weekly-planning",
    //             description: "Organize your weekly household activities.",
    //         },
    //     ],
    // },
    {
        id: "debt-management",
        title: "DEBT Management",
        icon: "CreditCard",
        children: [
            {
                title: "Debt Overview",
                path: "/debt/debt-overview",
                componentKey: "debt.debt-overview",
                description: "View total outstanding, repayments and debt analytics",
            },
            {
                title: "All Debts",
                path: "/debt/outstanding",
                componentKey: "debt.outstanding",
                description: "Create, edit, update and manage all your debts",
            },
            {
                title: "Monthly Debt Update",
                path: "/debt/monthly-update",
                componentKey: "debt.monthly-update",
                description: "Update monthly outstanding balances and interest rates",
            },
            {
                title: "Activity History",
                path: "/debt/activity-history",
                componentKey: "debt.activity-history",
                description: "View, edit and track all debt repayment transactions",
            },
        ],
    },
    {
        id: "investments",
        title: "Investment Management",
        icon: "PiggyBank",
        children: [
            {
                title: "Investment Dashboard",
                path: "/investments/dashboard",
                componentKey: "investments.dashboard",
                description: "View total investments, contributions, withdrawals and investment analytics",
            },
            {
                title: "All Investments",
                path: "/investments/all-investments",
                componentKey: "investments.all",
                description: "Create, edit, delete and manage all your investments",
            },
            {
                title: "Monthly Investment",
                path: "/investments/monthly-update",
                componentKey: "investments.monthly-update",
                description: "Record monthly contributions, withdrawals and investment balances",
            },
            {
                title: "Yearly Investment",
                path: "/investments/yearly",
                componentKey: "investments.yearly",
                description: "View yearly and monthly investment reports with filters",
            },
        ],
    },
    {
        id: "goals",
        title: "Goals",
        icon: "CalendarDays",
        path: "/goals",
        componentKey: "goals",
        description: "Organize your future goals and important milestones.",
    },
    {
        id: "planner",
        title: "Planner",
        icon: "PiggyBank",
        children: [
            {
                title: "Budget Planner",
                path: "/planner/budget",
                componentKey: "planner.budget",
                description: "Plan and track monthly income and expenses",
            },
        ],
    },
    // {
    //     id: "my-bookmarks",
    //     title: "My Bookmarks",
    //     icon: "Bookmark",
    //     path: "/my-bookmarks",
    //     componentKey: "bookmarks",
    //     description: "Save and organize your important links.",
    // },
    {
        id: "user-management",
        title: "User Management",
        icon: "UserRound",
        adminOnly: true,
        children: [
            {
                title: "Roles",
                path: "/user-management/roles",
                componentKey: "admin.roles",
                adminOnly: true,
                description: "Create roles and enable modules.",
            },
            {
                title: "Users",
                path: "/user-management/users",
                componentKey: "admin.users",
                adminOnly: true,
                description: "Map roles with users.",
            },
        ],
    },
];
