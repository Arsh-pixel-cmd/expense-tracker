# SmartSpend 💰

**SmartSpend** is a modern, AI-powered expense tracking application built to help you manage your finances effortlessly. With features like automatic transaction categorization, budget tracking, and detailed analytics, staying on top of your money has never been easier.

![SmartSpend Dashboard](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=2000)

## ✨ Features

- **🤖 AI Auto-Categorization**: Automatically categorizes your expenses using Gemini AI, saving you time and ensuring accuracy.
- **📊 Comprehensive Dashboard**: Get a bird's-eye view of your financial health with interactive charts and summaries.
- **💸 Transaction Management**: Easily add income and expenses with support for various payment methods (Cash, Card, UPI, etc.).
- **📉 Budget Tracking**: Set monthly budgets for different categories and get notified when you're close to overspending.
- **👥 Group Expenses**: Manage shared expenses with friends or family (Split bills, track balances).
- **📂 Category Management**: Custom categories with color-coding to organize your spending your way.
- **🌓 Dark Mode**: Sleek dark mode support for comfortable viewing at night.
- **📤 Data Export**: Export your financial data to CSV or PDF for external analysis.
- **🔐 Secure Authentication**: Powered by Supabase Auth for secure email/password and social logins.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **AI Integration**: [Google Gemini API](https://ai.google.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- A Google Cloud project with Gemini API access

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/expense-builder.git
    cd expense-builder
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory and add the following keys:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Setup (Supabase)

You will need to run the SQL scripts located in the `supabase/` folder to set up your database schema, tables, and functions.

1.  Go to your Supabase Dashboard -> SQL Editor.
2.  Run the scripts in the following order (recommended):
    - `fix_group_schema.sql` (Core tables)
    - `add_auto_categ.sql` (AI features)
    - `add_payment_method.sql`
    - `add_dark_mode.sql`
    - Any other RPC functions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.