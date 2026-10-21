# Expensio — Travel Expense Management & HR Back-Office

> **AI-Powered Business Travel Expense & HR Approval Platform**  
> Built with React 19, TypeScript, Tailwind CSS, Express, and Google Gemini AI OCR.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-3.8--flash-orange.svg)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-cyan.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache--2.0-lightgrey.svg)](LICENSE)

---

## 🌟 Overview

**Expensio** is a corporate travel and expense management application featuring a dual-persona interface:
1. **Android Mobile App (Collaborator)**: Photograph paper receipts on the go. The integrated Gemini AI OCR extracts the merchant name, date, total amount, currency, tax/VAT, and recommends the expense category.
2. **Web HR Back-Office Portal (Management / Accounting)**: Review submitted expense claims, inspect high-resolution digital receipts side-by-side, request modifications with comments, approve, or reject claims with complete audit history and print/PDF export.

---

## 🚀 Key Functional Modules

### 1. Trip Mission Creation (`Création du déplacement`)
- Mandatory definition of travel mission: **Trip Purpose**, **Destination City**, **Start Date**, and **End Date**.
- Optional project or client cost-center code (`PRJ-LONDON-2026`).
- Corporate date boundary is locked upon creation to enforce expense compliance.

### 2. AI Receipt Capture & OCR (`Ajout des justificatifs`)
- Live device camera capture (webcam or smartphone back camera) or file upload (PNG, JPEG, WebP).
- Built-in instant sample receipts for frictionless testing without physical receipts.
- Automatic extraction using **Google Gemini 3.8 Flash**:
  - Merchant / Establishment name
  - Transaction date (YYYY-MM-DD)
  - Total amount paid & Currency (EUR, USD, GBP, CHF, CAD, JPY)
  - Categorization proposal (`Meals & Dining`, `Lodging`, `Transport`, `Fuel & Mileage`, `Other`)
  - Itemized VAT / Sales tax amount
  - Receipt / Voucher invoice reference number
- Interactive review screen allowing the employee to verify and adjust information before saving.

### 3. Strict Date & Duplicate Policy Enforcement (`Contrôle des dates et doublons`)
- **Rule 1: Date Range Check**: Every receipt must satisfy:  
  $$\text{Trip Start Date} \le \text{Receipt Date} \le \text{Trip End Date}$$  
  - If a receipt date is outside this period, addition is flagged and **blocked**.
  - If the date is blurred or unreadable, the app explicitly mandates manual date entry.
- **Rule 2: Retroactive Trip Date Modification**: If the employee updates trip start/end dates later, all existing attached receipts are automatically re-checked. Any tickets outside the new range trigger visual warnings.
- **Rule 3: Duplicate Detection**: Identifies whether a ticket with identical merchant, date, and amount has already been submitted in the report.

### 4. Expense Report Generation & Multi-Currency (`Génération et envoi`)
- Standardized corporate document featuring:
  - Employee identity (Name, Matricule, Department, Masked Reimbursement IBAN)
  - Trip metadata (Purpose, Destination, Dates, Status)
  - Detailed itemized table with receipt thumbnails and category tags
  - **Multi-currency breakdown**: Consolidated totals converted to base currency (EUR) alongside separated itemized totals per original currency (EUR, GBP, USD, CHF).
  - High-resolution audit annex archiving all original vouchers for tax compliance.
- Formatted PDF export and native browser printing (`@media print` clean layout).

### 5. HR Back-Office (`Back-office RH`)
- Real-time KPI dashboards:
  - Total expense reports awaiting review
  - Total reimbursement amount in queue
  - Approved claims this month
  - Reports returned for correction
- Status workflow lifecycle:
  $$\text{Draft} \longrightarrow \text{Submitted} \longrightarrow \begin{cases} \text{Approved} \\ \text{Changes Requested (with mandatory HR comments)} \\ \text{Rejected} \end{cases}$$
- When changes are requested, the employee receives immediate in-app notifications with HR instructions to fix and resubmit.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons, Canvas Confetti.
- **Mobile Experience**: Google Pixel Material You frame simulator with fullscreen toggle.
- **Backend API**: Express server running on Node.js / `tsx`.
- **AI Engine**: `@google/genai` TypeScript SDK utilizing `gemini-3.8-flash`.
- **Styling & Print**: Tailwind CSS `@import "tailwindcss";` with dedicated `@media print` stylesheets.

---

## 📂 Project Structure

```text
├── server.ts                    # Express server + Gemini AI receipt OCR endpoint
├── index.html                   # HTML entry point with metadata
├── package.json                 # Dependencies and scripts
├── src/
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Main router with dual-view persona switcher
│   ├── types.ts                 # TypeScript interfaces (Trip, Receipt, ExpenseStatus)
│   ├── index.css                # Tailwind CSS v4 and print stylesheets
│   ├── utils/
│   │   └── currencies.ts        # Currency exchange rates, formatters, and date validation
│   ├── data/
│   │   └── mockData.ts          # Realistic sample trips and SVG base64 receipts
│   └── components/
│       ├── AndroidFrame.tsx     # Google Pixel smartphone shell with status bar
│       ├── AndroidMobileApp.tsx # Collaborator mobile dashboard & mission cards
│       ├── CameraReceiptScanner.tsx # Live camera & Gemini AI OCR scanner
│       ├── ReceiptEditModal.tsx # OCR verification modal with strict date validation
│       ├── TripFormModal.tsx    # Create/edit business trip with date impact checks
│       ├── ExpenseReportView.tsx# Formal printable expense report & multi-currency totals
│       └── HRBackOffice.tsx     # Executive HR desktop back-office & approval workflow
└── README.md                    # Project documentation
```

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18.0.0 or later)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/expensio.git
cd expensio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Add your Gemini API Key in `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```
*(Note: If no API key is provided, the application runs on its intelligent heuristic OCR fallback so you can test all flows offline!)*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Testing Scenarios (Ready-to-Test)

1. **Date Outside Travel Window**: In the camera scanner, select the sample `⚠️ OUT-OF-RANGE DATE`. The app flags the ticket in red and blocks saving until the date is corrected.
2. **Unreadable Date**: Select `❓ UNREADABLE DATE`. The scanner highlights the date field and requests manual input.
3. **Multi-Currency Calculation**: View the London trip to inspect automatic conversion of British Pounds (GBP) to Euros (EUR) with itemized currency totals.
4. **Retroactive Date Modification**: Edit the London trip and shorten the end date. The app warns you that existing attached tickets fall outside the new window.
5. **HR Approval Workflow**: Switch to the **HR Back-Office** tab, review the submitted Paris VivaTech report, inspect receipts with the zoom tool, and click **Approve** or **Request Changes**.

---

## 📄 License
Distributed under the Apache-2.0 License.
