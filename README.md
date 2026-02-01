# TrackWise 💰

**A Smart, Cross-Platform Expense Tracker for Modern Teams**

TrackWise is a comprehensive finance management application built to seamlessly bridge the gap between web and mobile. Powered by **Next.js 16** and **Capacitor 8**, it offers a unified experience whether you're at your desk or on the go.

With **AI-powered categorization**, **voice expense entry**, and **native payment integration** (UPI, Google Pay), taking control of your financial health has never been this intuitive.

![Dashboard Preview](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=2000)

## ✨ Key Features

- **📱 Cross-Platform Experience**:
    - **Desktop**: Full-featured dashboard with detailed analytics and reports.
    - **Mobile (Android/iOS)**: Native app experience with biometric login, system notifications, and intent-based app launching.
- **🤖 AI & Voice Intelligence**:
    - **Auto-Categorization**: Gemini AI analyzes your transaction notes to automatically assign categories.
    - **Voice Entry**: Just say "Spent 50 dollars on lunch" and watch it be recorded instantly.
- **💸 Smart Payments**:
    - **Native App Launcher**: Directly launch Google Pay, PhonePe, or Paytm from the app to settle debts.
    - **Group Bill Splitting**: Manage shared expenses with friends and track who owes what.
- **📊 Deep Analytics**: Interactive charts powered by Recharts to visualize spending trends month-over-month.
- **🛡️ Secure & Private**: Enterprise-grade security with Supabase Auth (Row Level Security) ensuring your data is yours alone.

## 🛠️ Tech Stack

**Frontend & Mobile**
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Mobile Runtime**: [Capacitor 8](https://capacitorjs.com/) (Android & iOS)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)

**Backend & Services**
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/)
- **Authentication**: Supabase Auth

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase Project & API Keys
- Android Studio / Xcode (for mobile builds)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/trackwise.git
    cd trackwise
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    GEMINI_API_KEY=your_ai_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

### Mobile Setup
 To run the app on a simulator or device:
 ```bash
 # Sync web assets to native projects
 npx cap sync

 # Open Android Studio
 npx cap open android

 # Open Xcode (macOS only)
 npx cap open ios
 ```

## 🐛 Troubleshooting

### Common Errors

> **"Application error: a client-side exception has occurred"**

If you encounter a white screen with this error message (often related to Vercel deployment quirks or hydration mismatches):

1.  **Refresh the page**: In 90% of cases, a simple refresh clears the temporary state issue.
2.  **Clear Cache**: Try clearing your browser cache or opening in Incognito mode.
3.  **Fix it!**: This is an open-source project. If you identify the root cause (check the browser console), please **open a Pull Request**! We appreciate your contributions.

## 🤝 Contributing

We welcome contributions! Whether it's fixing bugs, improving documentation, or suggesting new features.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.