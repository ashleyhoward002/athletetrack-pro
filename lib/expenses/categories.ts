// Expense categories with labels
export const EXPENSE_CATEGORIES = [
    { id: "registration", label: "Team Registration", icon: "📋" },
    { id: "equipment", label: "Equipment & Gear", icon: "🎒" },
    { id: "travel", label: "Travel", icon: "🚗" },
    { id: "lodging", label: "Lodging", icon: "🏨" },
    { id: "camps", label: "Camps & Clinics", icon: "⛺" },
    { id: "lessons", label: "Private Lessons", icon: "👨‍🏫" },
    { id: "uniforms", label: "Uniforms & Apparel", icon: "👕" },
    { id: "tournaments", label: "Tournament Fees", icon: "🏆" },
    { id: "membership", label: "Gym/Club Membership", icon: "🏢" },
    { id: "other", label: "Other", icon: "📦" },
];

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["id"];
