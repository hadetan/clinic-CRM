# Doc CRM - Medical Practice Management System

A modern, web-based Customer Relationship Management (CRM) system specifically designed for medical practices and clinics. Built with Next.js, TypeScript, and Prisma, this system streamlines patient management, prescription handling, and medical inventory tracking.

## 🏥 Project Overview

Doc CRM is a comprehensive solution for healthcare practitioners to manage their daily operations efficiently. The system provides a seamless workflow from patient registration to prescription management and inventory control, with built-in printing capabilities for professional prescription documents.

## ✨ Key Features

### 📋 Patient Management

- **Patient Registration**: Quick patient onboarding with phone number lookup
- **Patient Database**: Store patient information including name, phone, and age
- **Auto-populate**: Automatic form filling for returning patients
- **Patient History**: Track all prescriptions for each patient

### 💊 Prescription Management

- **Digital Prescriptions**: Create and manage digital prescriptions
- **Auto-numbering**: Sequential prescription numbering system
- **Symptom Tracking**: Record patient symptoms and conditions
- **Multi-medication Support**: Add multiple medications per prescription
- **Flexible Dosing**: Support for various dosage formats and units
- **Print-ready Format**: Professional prescription layouts for printing

### 📦 Inventory & Stock Management

- **Real-time Stock Tracking**: Monitor medication inventory levels
- **Low Stock Alerts**: Visual indicators for medications running low
- **Flexible Units**: Support for divisible and indivisible medications
- **Automatic Deduction**: Stock automatically updates when prescriptions are dispensed
- **Multiple Dispensing Units**: Tablets, capsules, bottles, vials, ML, MG, sachets, tubes, injections
- **Pack Management**: Handle medications with multiple units per pack

### 🖨️ Professional Printing

- **Print-optimized Layouts**: Clean, professional prescription formats
- **Responsive Design**: Optimized for both screen and print media
- **Prescription History**: View and reprint past prescriptions
- **Doctor Signature Space**: Professional format with signature lines

## 🛠️ Technology Stack

### Frontend

- **Next.js 15.5.3** - React framework with App Router
- **React 19.1.0** - Modern React with latest features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Responsive Design** - Mobile and desktop optimized

### Backend

- **Next.js API Routes** - Server-side API endpoints
- **Prisma 6.16.2** - Type-safe database ORM
- **PostgreSQL** - Robust relational database

### Development Tools

- **ESLint 9** - Code linting and quality
- **TypeScript Configuration** - Strict type checking
- **Turbopack** - Ultra-fast bundler for development

## 📊 Database Structure

### Entity Relationship Model

```text
Patient (1) ←──→ (M) Prescription (1) ←──→ (M) PrescriptionItem (M) ←──→ (1) Stock
```

### Core Models

#### Patient

- `id`: Unique identifier (BigInt, auto-increment)
- `name`: Patient full name
- `phone`: Unique phone number (used as natural key)
- `age`: Optional patient age
- `createdAt/updatedAt`: Timestamp tracking

#### Prescription

- `id`: Unique identifier (BigInt, auto-increment)
- `number`: Sequential prescription number (auto-increment, unique)
- `patientId`: Foreign key to Patient
- `symptoms`: Optional symptom description
- `createdAt/updatedAt`: Timestamp tracking

#### Stock

- `id`: Unique identifier (BigInt, auto-increment)
- `name`: Medication name (unique)
- `quantity`: Current stock level (in packs)
- `lowStockThreshold`: Alert threshold level
- `isDivisible`: Whether medication can be dispensed in units
- `dispensingUnit`: Unit type (TABLET, CAPSULE, BOTTLE, etc.)
- `unitsPerPack`: Number of units in each pack
- `createdAt/updatedAt`: Timestamp tracking

#### PrescriptionItem

- `id`: Unique identifier (BigInt, auto-increment)
- `prescriptionId`: Foreign key to Prescription
- `stockId`: Optional foreign key to Stock
- `medName`: Medication name (for custom entries)
- `dosage`: Optional dosage instructions
- `quantity`: Prescribed amount
- `prescribedAs`: PACKS or UNITS
- `unitsPerPack`: Units per pack for calculations

### Enums

- **DispensingUnit**: TABLET, CAPSULE, BOTTLE, VIAL, ML, MG, SACHET, TUBE, INJECTION, OTHER
- **PrescriptionType**: PACKS, UNITS

## 🌐 API Endpoints

### Patients API (`/api/patients`)
- **GET** `?phone={phone}` - Find patient by phone number
- **POST** - Create or update patient
  ```json
  {
    "phone": "string",
    "name": "string",
    "age": "number (optional)"
  }
  ```

### Prescriptions API (`/api/prescriptions`)
- **GET** - Retrieve recent prescriptions (last 50)
- **POST** - Create new prescription with automatic stock deduction
  ```json
  {
    "phone": "string",
    "name": "string",
    "age": "number (optional)",
    "symptoms": "string (optional)",
    "items": [
      {
        "medName": "string",
        "dosage": "string (optional)",
        "quantity": "number",
        "stockId": "number (optional)",
        "prescribedAs": "PACKS|UNITS",
        "unitsPerPack": "number (optional)"
      }
    ]
  }
  ```

### Stocks API (`/api/stocks`)
- **GET** `?q={searchQuery}` - Search medications by name
- **POST** - Add or update stock
  ```json
  {
    "name": "string",
    "amount": "number",
    "lowStockThreshold": "number (optional)",
    "isDivisible": "boolean (optional)",
    "dispensingUnit": "string (optional)",
    "unitsPerPack": "number (optional)"
  }
  ```

## 📱 Application Pages

### 1. Home/Prescription Creation (`/`)
- **Primary Interface**: Main prescription creation workflow
- **Features**: 
  - Patient lookup and registration
  - Medication selection with stock integration
  - Symptom recording
  - Real-time stock search and selection
  - Flexible quantity input (packs vs units)
  - Save and print functionality

### 2. Prescription History (`/prescriptions`)
- **Purpose**: View and manage all prescriptions
- **Features**:
  - Searchable prescription list
  - Detailed prescription view
  - Reprint functionality
  - Patient information display

### 3. Stock Management (`/stocks`)
- **Purpose**: Inventory management interface
- **Features**:
  - Stock level monitoring
  - Low stock and out-of-stock alerts
  - Add new medications
  - Update stock levels
  - Configure dispensing units and pack sizes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd doc_crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=supabaseUrl
   NEXT_PUBLIC_SUPABASE_ANON_KEY=SupabaseAnonKey
   SUPABASE_SERVICE_ROLE_KEY=SupabaseServiceRoleKey
   DATABASE_URL="postgresql://postgres.[projectId]:[password]@[region].pooler.supabase.com:5432/postgres?sslmode=require"
   DATABASE_DIRECT_URL="postgresql://postgres.[projectId]:[password]@[region].pooler.supabase.com:5432/postgres?sslmode=require"
   ```

4. **Set up the database**
   ```bash
   npm run prisma:migrate:dev
   npm run prisma:generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000)

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy database migrations**
   ```bash
   npm run prisma:migrate:deploy
   ```

3. **Start production server**
   ```bash
   npm start
   ```

## 📋 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate:dev` - Run database migrations (development)
- `npm run prisma:migrate:deploy` - Deploy migrations (production)

## 🎯 Workflow

### Typical Daily Workflow

1. **Patient Arrives**: Enter patient phone number
2. **Patient Lookup**: System auto-populates known patient data
3. **New Patient**: If new, enter patient name and age
4. **Record Symptoms**: Document patient's symptoms/conditions
5. **Add Medications**: 
   - Search and select from stock
   - Enter custom medications if not in stock
   - Specify dosage and quantity
6. **Save Prescription**: System assigns prescription number
7. **Stock Management**: Inventory automatically updated
8. **Print**: Generate professional prescription document

### Stock Management Workflow

1. **Monitor Levels**: Check stock status dashboard
2. **Low Stock Alerts**: Identify medications needing reorder
3. **Add Stock**: Update inventory when new supplies arrive
4. **Configure Items**: Set up new medications with proper units

## 🔧 Technical Implementation Details

### State Management
- Client-side state with React hooks
- Real-time updates with fetch API
- Optimistic UI updates for better UX

### Data Serialization
- Custom BigInt serialization for database compatibility
- JSON-safe data transfer between client and server

### Print Optimization
- CSS media queries for print layouts
- Professional typography and spacing
- Hidden elements for clean print output

### Database Transactions
- Atomic prescription creation with stock updates
- Consistent data state across related operations
- Error handling and rollback capabilities

## 🧪 Future Enhancements

- **User Authentication**: Multi-doctor support with role-based access
- **Reporting**: Analytics and insights dashboard
- **Backup & Export**: Data export and backup capabilities
- **Mobile App**: Native mobile application
- **Integration**: Connect with pharmacy systems
- **Appointment Scheduling**: Patient appointment management

## 📝 License

This project is proprietary software designed for medical practice management.

---

*Built with ❤️ for healthcare professionals*