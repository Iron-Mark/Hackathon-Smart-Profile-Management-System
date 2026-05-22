# CCIS Smart Faculty Profile Management System (FPMS)

A comprehensive profile management system designed for academic faculty, featuring AI-powered document extraction and streamlined administrative approvals.

## 🚀 Features

- **Smart Profile Management**: Manage educational background, work experience, and professional development.
- **AI-Powered OCR**: Automatically extract text and information from uploaded documents (Certificates, Licenses, etc.) using Tesseract.js and OpenAI.
- **Admin Dashboard**: Centralized hub for administrators to review, approve, or return faculty submissions.
- **Automated Reporting**: Track compliance and document status in real-time.
- **Role-Based Access**: Specialized interfaces for Faculty and Administrators.

## 🛠️ Tech Stack

- **Frontend**: React (TypeScript), Vite, TailwindCSS, Lucide React, Sonner (Toasts).
- **Backend/Database**: Supabase (Auth, PostgreSQL, Storage).
- **AI/ML**: Tesseract.js (OCR), OpenAI GPT-3.5 (Information Analysis).
- **Charts**: Recharts for administrative analytics.

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- NPM or PNPM
- A Supabase account and project.
- An OpenAI API Key (optional, for AI summary features).

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd CCIS-Smart-FPMS
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_COHERE_KEY=your_cohere_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The system relies on the following Supabase tables:

- **`account_details`**: Stores core user identity (Name, Email, Role).
- **`profile_details`**: Stores faculty-specific metadata (Profession, Bio/Description).
- **`submissions`**: Tracks uploaded documents, their categories, and approval status.
- **`educational_background`**: Stores degree information and institutions.
- **`work_experiences`**: Stores professional history.
- **`professional_development`**: Stores certifications, seminars, and workshops.

## 📂 Storage Buckets

- **`pictures-and-documents`**: Stores profile pictures, banners, and all uploaded verification documents. Structure: `{userId}/{category}/{filename}`.

## 🧪 Testing

The project uses Vitest for unit testing. To run tests:
```bash
npm test
```

## 📄 License

This project is licensed under the MIT License.
