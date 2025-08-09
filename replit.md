# Sistema de Controle de Qualidade WAP

## Overview

This is a comprehensive Quality Control system designed for WAP Industrial that centralizes product inspection management and integrates with Quality Engineering workflows. The system is built as a responsive web application supporting desktop, tablets, and mobile devices with PWA capabilities.

The platform manages the complete inspection lifecycle from product catalog management to approval workflows, supporting multiple user roles including Quality Inspectors, Quality Engineering teams, Managers, and Block Control personnel. The system enforces role-based access control and provides real-time tracking of inspection processes across four business units: DIY, TECH, KITCHEN/BEAUTY, and MOTOR & COMFORT.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with React and TypeScript using Vite as the build tool. The UI framework leverages Radix UI components with shadcn/ui styling and Tailwind CSS for responsive design. State management is handled through TanStack Query for server state and React Context for authentication. The routing system uses Wouter for client-side navigation.

The component architecture follows a modular design with feature-based organization:
- Layout components (Header, Sidebar) provide consistent navigation
- Page components handle route-specific functionality
- UI components provide reusable interface elements
- Feature-specific components (inspection, products, approval) encapsulate business logic

### Backend Architecture
The server uses Express.js with TypeScript in ESM format. The API follows RESTful conventions with role-based middleware for authentication and authorization. File upload capabilities are implemented using Multer with local storage.

Authentication is implemented using JWT tokens with bcrypt for password hashing. The middleware system provides:
- Request logging and response tracking
- Authentication token validation
- Role-based access control
- File upload handling with type validation

### Database Design
The system uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema is organized around core entities:

**Users Table**: Stores user credentials and role assignments with enum-based role definitions (inspector, engineering, manager, block_control)

**Products Table**: Contains product catalog with unique codes, descriptions, categories, and business unit classifications. Technical parameters are stored as JSONB for flexibility.

**Inspection Plans Table**: Versioned inspection procedures with step-by-step instructions, checklists, and required parameters stored as JSONB structures.

**Acceptance Recipes Table**: Define parameter limits and acceptance criteria for each product with version control.

**Inspections Table**: Core inspection records linking inspectors, products, and results with status tracking through the approval workflow.

The database design supports versioning for both inspection plans and acceptance recipes, enabling audit trails and historical tracking.

### Authentication & Authorization
JWT-based authentication with 8-hour token expiration provides secure session management. Role-based access control restricts functionality based on user permissions:
- Inspectors can create and view their own inspections
- Engineering can manage plans, recipes, and approve inspections
- Managers access dashboards and reports
- Block Control manages product and material restrictions

### API Structure
RESTful API endpoints organized by feature:
- `/api/auth/*` - Authentication and user management
- `/api/products/*` - Product catalog management
- `/api/inspection-plans/*` - Inspection procedure management
- `/api/inspections/*` - Inspection CRUD operations
- `/api/approvals/*` - Approval workflow management
- `/api/upload/*` - File upload handling

The API implements consistent error handling, request validation, and response formatting across all endpoints.

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling via `@neondatabase/serverless`
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Database Migrations**: Managed through `drizzle-kit` with schema versioning

### Authentication & Security
- **JWT**: JSON Web Tokens for session management via `jsonwebtoken`
- **bcrypt**: Password hashing and verification for user security
- **Session Management**: PostgreSQL session storage using `connect-pg-simple`

### File Management
- **Multer**: File upload middleware supporting images and videos up to 5MB
- **Local Storage**: Files stored in local uploads directory with organized naming

### UI Framework & Styling
- **Radix UI**: Comprehensive component library for accessible UI elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: Pre-built component system with consistent theming
- **Lucide Icons**: Icon library integrated with Material Icons fallback

### Development Tools
- **Vite**: Build tool and development server with React plugin
- **TypeScript**: Type safety across frontend and backend
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with Zod validation
- **Wouter**: Lightweight client-side routing

### Quality Control Features
- **Date Handling**: `date-fns` for inspection date management
- **Validation**: `zod` schemas for runtime type checking
- **Form Management**: `react-hook-form` with resolver integration
- **State Management**: Context-based authentication with query caching