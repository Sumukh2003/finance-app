# WalletTrack - Personal Finance Tracker

A modern, full-featured personal finance management application built with Next.js, TypeScript, and MongoDB. Track your income, expenses, set budgets, and gain insights into your financial habits.

## 🚀 Features

- **User Authentication**: Secure login and registration system
- **Transaction Management**: Add, view, edit, and delete income/expense transactions
- **Budget Tracking**: Set monthly budgets for different categories and monitor spending
- **Financial Dashboard**: Comprehensive overview with charts and statistics
- **Data Visualization**: Interactive pie charts and line graphs for expense analysis
- **Export Functionality**: Export transaction data to CSV
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+
- MongoDB database (local or cloud)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd wallettrack
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
wallettrack/
├── src/
│   ├── app/
│   │   ├── api/                 # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── budgets/        # Budget management
│   │   │   ├── dashboard/      # Dashboard data
│   │   │   └── transactions/   # Transaction CRUD
│   │   ├── dashboard/          # Protected dashboard pages
│   │   │   ├── budgets/        # Budget management page
│   │   │   └── transactions/   # Transaction management page
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── AddTransactionModal.tsx
│   │   ├── Header.tsx
│   │   ├── StatCard.tsx
│   │   └── charts/             # Chart components
│   ├── lib/
│   │   ├── db.ts               # Database connection
│   │   ├── calcStats.ts        # Statistics calculations
│   │   └── exportTransactions.ts
│   └── models/                 # MongoDB schemas
│       ├── User.ts
│       ├── Transaction.ts
│       └── Budget.ts
├── public/                     # Static assets
└── package.json
```

## 🎯 Usage

### Getting Started

1. Visit the landing page and click "Get Started"
2. Create a new account or sign in if you already have one
3. Start adding your transactions and setting budgets

### Adding Transactions

- Click "Add Transaction" on the Transactions page
- Fill in the details: type (income/expense), category, amount, description, and date
- Transactions appear in your dashboard and affect budget calculations

### Managing Budgets

- Go to the Budgets page
- Click "Add Budget" to set spending limits for categories
- Monitor your progress with visual progress bars
- Get alerts when you exceed budget limits

### Viewing Analytics

- Dashboard shows comprehensive financial overview
- Pie chart displays expense breakdown by category
- Line chart shows income/expense trends over time
- Summary cards show key financial metrics

## 🔒 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Transactions

- `GET /api/transactions` - Get transactions (with pagination, search, filters)
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions` - Update transaction
- `DELETE /api/transactions` - Delete transaction

### Budgets

- `GET /api/budgets/summary` - Get budget summary for a month
- `POST /api/budgets` - Create new budget

### Dashboard

- `GET /api/dashboard` - Get dashboard data (income, expenses, charts)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform supporting Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- Self-hosted with Docker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you find this project helpful, please give it a ⭐️!

For questions or issues, please open an issue on GitHub.
