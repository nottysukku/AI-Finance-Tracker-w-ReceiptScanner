


# 🚀 Money💲 — AI-Powered Full Stack Finance Platform

Money💲 is a next-generation AI-powered personal finance management platform designed for modern users. With a focus on automation, security, and sleek UI/UX, Money💲 helps users track expenses, scan receipts, manage budgets, and get intelligent financial insights.

---

## 🔧 Tech Stack

| Category           | Tools / Frameworks                                     |
| ------------------ | ------------------------------------------------------ |
| Frontend           | Next.js 15, React, Tailwind CSS, Shadcn UI             |
| Backend            | Node.js, Supabase, Prisma, PostgreSQL                  |
| Authentication     | Clerk                                                  |
| Forms & Validation | React Hook Form, Zod                                   |
| AI Integrations    | Gemini API, Custom AI for Receipt Scanning and Reports |
| Email Service      | Resend                                                 |
| Background Jobs    | Inngest, Cron Jobs                                     |
| Data Visualization | Chart.js                                               |
| Security           | Arcjet (Rate Limiting, Bot Protection)                 |
| Deployment         | Vercel                                                 |

---
---

## ✨ Features

### 🏦 Multi-Account Finance Tracker

Track income and expenses across multiple accounts with blazing-fast performance powered by **Supabase** and type-safe access using **Prisma**.

### 📸 AI-Powered Receipt Scanner

Upload receipts and let the built-in **AI** automatically extract transaction details—no manual entry needed.

### 🔁 Recurring Transactions (Inngest + Cron Jobs)

Automatically handle recurring payments like subscriptions, bills, and salary deposits with **Inngest**-powered background tasks.

### 📊 Smart Budgeting with Real-Time Alerts

Set monthly budgets and receive **email notifications** via **Resend** when you're nearing or exceeding your limits.

### 📈 Interactive Dashboards

Visualize your spending habits using **Chart.js**—filter by category, account, and time ranges.

### 🧠 Monthly AI Financial Reports

Receive a monthly AI-generated financial report with insights, savings tips, and a breakdown of your finances.

### 💡 Responsive & Modern UI

Crafted with **Shadcn UI** and **Tailwind CSS**, the interface is sleek, intuitive, and fully responsive.

### 🔐 Secure User Authentication

Integrated **Clerk Authentication** ensures secure and seamless login and session management across devices.

### ⚙️ Serverless & Scalable Backend

Powered by **Supabase** for real-time updates, instant APIs, and robust PostgreSQL database support.

### ✅ End-to-End Form Validation

Forms are fully validated with **React Hook Form** and **Zod**, both on the client and server side.

### 🛡️ Advanced Security with Arcjet

Rate limiting and bot protection are enforced using **Arcjet**, securing your API and user data.

### 📩 Transactional Emails

Automated emails via **Resend** keep users informed about budgets and monthly summaries.

### 📃 Paginated Transactions with Filters

Easily browse through transactions with **pagination** and **smart filters** (recurring, income/expenses, etc.).



## 📂 Project Structure

```bash
/
├── actions/               # Next.js 15 Actions Directory
├── app/                   # Next.js 15 App Directory
├── components/            # Reusable React components
├── data/                  # Data Folder
├── emails/                # Emails Folder
├── hooks/                 # Hooks Folder
├── lib/                   # Utility functions (e.g., API wrappers, helpers)
├── prisma/                # Prisma schema and DB setup
├── public/                # Static files
├── ...                    # Other Relevant files
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nottysukku/AI-Finance-Tracker-w-ReceiptScanner.git
cd AI-Finance-Tracker-w-ReceiptScanner
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
# or
yarn install
```

### 3. Setup environment variables

Create a `.env.local` file based on `.env.example` and configure your API keys and credentials:

```env
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

GEMINI_API_KEY=

RESEND_API_KEY=

ARCJET_KEY=
...
```

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
```

---

## 📈 Roadmap

* [ ] Add mobile-first budgeting experience
* [ ] Integrate Open Banking APIs
* [ ] Export to CSV/PDF
* [ ] Shared account access (e.g., family or business accounts)
* [ ] AI chatbot for finance Q\&A

---

## 🛡️ Security

* Protected with **Arcjet** to defend against bot abuse and rate-limit API usage
* Fully validated input with **Zod**
* Authentication and session management by **Clerk**

---

## 📬 Contact

**Want to chat about the architecture or AI implementation?**
Feel free to reach out or open a discussion!

---

## ⭐️ Show Your Support

If you found this project helpful or interesting, please give it a ⭐️ on GitHub and share it with others!

---

## 📜 License

[MIT License](LICENSE)

---

