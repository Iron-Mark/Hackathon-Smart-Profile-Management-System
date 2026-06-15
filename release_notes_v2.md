# The Modernization Update 🚀 (v2.0.0)

We have revived the year-old **Smart Profile Management System** hackathon project into a reviewable public demo. This release keeps the original product idea alive with modern web tooling, browser-local demo data, an optional AI layer, and a clearer showcase flow.

## 🌟 The "Wow" Factor: What's New?

### 1. The Glassmorphic UI/UX Overhaul
The entire platform has been visually rebuilt from the ground up by Lead Frontend Developer **Mark Siazon**. The application now features a stunning, fluid Glassmorphic interface powered by Tailwind CSS and Radix UI primitives. 
* **Global Dark/Light Mode**: Seamlessly toggles deeply integrated theme tokens for maximum accessibility and visual flair.
* **Responsive Architecture**: Fully optimized for both desktop administrator analytics and mobile faculty uploads.

![Login Portal](docs/images/login.png)

### 2. Intelligent Progressive Web App (PWA)
We completely transformed the standard React Single Page Application into a true **Progressive Web App (PWA)**.
* **Offline Mode Mastery**: Built-in network listeners instantly detect Wi-Fi drops, triggering elegant `sonner` persistent toast notifications ("Offline Mode - Operating from Cache") to ensure the presentation never breaks, even under extreme network latency.
* **Installable**: Beautiful custom 192x192 and 512x512 manifest icons allow users to install the platform natively on their devices.

### 3. Masterclass Discoverability & SEO
The application is no longer just a locked dashboard; it is a highly discoverable entity optimized for both Google and the next generation of Search.
* **Open Graph (OG) Dominance**: Dynamic Twitter Cards and Theme Colors ensure any shared links unfurl into beautiful graphic previews.
* **AI Search Engine Guidance**: The repo includes `llms.txt`, `answers.md`, and crawler guidance so answer engines can summarize the public demo accurately.
* **Strict Canonical Directives**: W3C-compliant `sitemap.xml` mapping with duplicate-content protections tied directly to personal portfolios.

### 4. AI-Powered Autonomous Ecosystem
The core workflow is now a fully automated, hands-off pipeline.
* **OCR Text Extraction**: Raw faculty uploads are instantly parsed via `Tesseract.js`.
* **GPT-4 Classification**: Extracted text is fed to a custom OpenAI pipeline that autonomously classifies and categorizes the document type.
* **Generative Biographies**: With a single click, the platform evaluates a faculty member's *Approved* credentials and ghostwrites a stellar, professional biography using Generative AI.

![Faculty Profile](docs/images/profile.png)

### 5. Iron-Clad Security & RBAC
* **Strict Route Segregation**: Administrators and Faculty operate in separate demo areas, protected by the custom `<ProtectedRoute />` routing wrapper that validates browser-local demo sessions.
* **Automated E2E Verification**: The restored demo flow is covered by headless **Playwright** End-to-End tests for the main faculty/admin path.

### 6. Real-Time Admin Tooling
Administrators have access to a lightning-fast data layer.
* **Live Global Search**: The "Recent Submissions" dashboard now features a real-time, zero-latency search index for instantly filtering faculty files.
* **Native CSV Exporting**: Replaced buggy external libraries with a custom-engineered vanilla JS module for instantly downloading pristine CSV analytics reports.

![Admin Dashboard](docs/images/dashboard.png)

---

## 👥 Meet the Team (Team 2nd Choice)
This restored showcase represents a collaborative hackathon project by Team 2nd Choice:
* **Mark Siazon** – Lead Frontend Developer & UI/UX
* **Charles Nathaniel Togle** – Backend & Integration
* **Alexa San Jose** – Systems & Architecture

*Built with ❤️ for the UMak CCIS Hackathon*
