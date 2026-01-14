# AthleteTrack Pro (FeNAgO) - Architecture Diagram

## High-Level System Architecture

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser["Browser/Mobile"]
        subgraph Pages["Next.js Pages"]
            Landing["Landing Page<br/>(/)"]
            Dashboard["Dashboard<br/>(/dashboard)"]
            Blog["Blog<br/>(/blog/*)"]
            Legal["Legal Pages<br/>(/tos, /privacy)"]
        end
    end

    subgraph Providers["Client Providers (LayoutClient)"]
        SessionProvider["SessionProvider<br/>(NextAuth)"]
        Toaster["React Hot Toast"]
        Tooltip["React Tooltip"]
        Crisp["Crisp Chat Widget"]
    end

    subgraph Components["UI Components"]
        ButtonSignin["ButtonSignin"]
        ButtonCheckout["ButtonCheckout"]
        ButtonLead["ButtonLead"]
        ButtonAccount["ButtonAccount"]
        Hero["Hero"]
        Pricing["Pricing"]
        Features["Features"]
        Testimonials["Testimonials"]
    end

    subgraph API["Next.js API Routes"]
        AuthAPI["/api/auth/[...nextauth]"]
        LeadAPI["/api/lead"]
        StripeCheckout["/api/stripe/create-checkout"]
        StripePortal["/api/stripe/create-portal"]
        StripeWebhook["/api/webhook/stripe"]
    end

    subgraph Libs["Service Libraries"]
        NextAuthLib["libs/next-auth.ts"]
        StripeLib["libs/stripe.ts"]
        MongooseLib["libs/mongoose.ts"]
        ResendLib["libs/resend.ts"]
        GPTLib["libs/gpt.ts"]
        APIClient["libs/api.ts<br/>(Axios)"]
    end

    subgraph Models["Mongoose Models"]
        UserModel["User Model"]
        LeadModel["Lead Model"]
    end

    subgraph External["External Services"]
        MongoDB[(MongoDB Atlas)]
        Stripe["Stripe API"]
        Google["Google OAuth"]
        Resend["Resend Email"]
        OpenAI["OpenAI GPT-4"]
        CrispService["Crisp Support"]
    end

    %% Client Flow
    Browser --> Pages
    Pages --> Providers
    Providers --> Components

    %% Component to API connections
    ButtonSignin --> AuthAPI
    ButtonCheckout --> StripeCheckout
    ButtonLead --> LeadAPI
    ButtonAccount --> StripePortal

    %% API to Libs
    AuthAPI --> NextAuthLib
    StripeCheckout --> StripeLib
    StripePortal --> StripeLib
    StripeWebhook --> StripeLib
    LeadAPI --> MongooseLib

    %% Libs to Models
    NextAuthLib --> UserModel
    MongooseLib --> UserModel
    MongooseLib --> LeadModel

    %% Models to Database
    UserModel --> MongoDB
    LeadModel --> MongoDB

    %% Libs to External Services
    NextAuthLib --> Google
    NextAuthLib --> Resend
    StripeLib --> Stripe
    ResendLib --> Resend
    GPTLib --> OpenAI
    Crisp --> CrispService

    %% Webhook flow
    Stripe -.->|Webhook Events| StripeWebhook
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant NA as NextAuth API
    participant G as Google OAuth
    participant R as Resend (Email)
    participant DB as MongoDB

    U->>B: Click "Sign In"
    B->>NA: GET /api/auth/signin

    alt Google OAuth
        NA->>G: Redirect to Google
        G->>U: Show consent screen
        U->>G: Grant permission
        G->>NA: Return auth code
        NA->>G: Exchange for tokens
        G->>NA: Return user profile
    else Magic Link
        U->>NA: Enter email
        NA->>R: Send magic link email
        R->>U: Email with login link
        U->>NA: Click magic link
    end

    NA->>DB: Create/Update User
    DB->>NA: User saved
    NA->>B: Set JWT session cookie
    B->>U: Redirect to /dashboard
```

## Payment Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant API as Stripe API Route
    participant S as Stripe
    participant WH as Webhook Handler
    participant DB as MongoDB

    U->>B: Click "Subscribe"
    B->>API: POST /api/stripe/create-checkout
    API->>S: Create checkout session
    S->>API: Return session URL
    API->>B: Redirect URL
    B->>S: Redirect to Stripe Checkout
    U->>S: Enter payment details
    S->>U: Payment processed
    S->>B: Redirect to success URL

    Note over S,WH: Async webhook
    S->>WH: POST /api/webhook/stripe
    WH->>WH: Verify signature
    WH->>DB: Update User (hasAccess=true)
    DB->>WH: Confirmed
```

## Data Model

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string name
        string email UK
        string image
        string customerId "Stripe Customer ID"
        string priceId "Stripe Price ID"
        boolean hasAccess "Subscription active"
        datetime createdAt
        datetime updatedAt
    }

    LEAD {
        ObjectId _id PK
        string email UK
        datetime createdAt
        datetime updatedAt
    }

    STRIPE_PLAN {
        string priceId PK
        string name
        number price
        boolean isFeatured
        array features
    }

    USER ||--o| STRIPE_PLAN : "subscribes to"
```

## Directory Structure

```mermaid
flowchart LR
    subgraph Root["fenago21/"]
        subgraph App["app/"]
            API2["api/"]
            Blog2["blog/"]
            Dashboard2["dashboard/"]
            Layout["layout.tsx"]
            Page["page.tsx"]
        end

        subgraph Comp["components/"]
            Buttons["Button*.tsx"]
            Layout2["LayoutClient.tsx"]
            UI["UI Components"]
        end

        subgraph Lib["libs/"]
            Auth["next-auth.ts"]
            Stripe2["stripe.ts"]
            Mongo["mongoose.ts"]
            Email["resend.ts"]
        end

        subgraph Mod["models/"]
            User["User.ts"]
            Lead["Lead.ts"]
        end

        Config["config.ts"]
    end

    App --> Comp
    App --> Lib
    Lib --> Mod
```

## Component Hierarchy

```mermaid
flowchart TB
    subgraph RootLayout["Root Layout (app/layout.tsx)"]
        subgraph ClientLayout["LayoutClient"]
            SessionProvider2["SessionProvider"]
            TopLoader["NextTopLoader"]
            ToastProvider["Toaster"]
            TooltipProvider["Tooltip"]
            CrispWidget["CrispChat"]
        end
        Children["Page Content"]
    end

    subgraph LandingPage["Landing Page (/)"]
        Header["Header"]
        HeroComp["Hero"]
        Problem["Problem"]
        FeaturesComp["FeaturesAccordion"]
        PricingComp["Pricing"]
        TestimonialsComp["Testimonials3"]
        FAQComp["FAQ"]
        CTAComp["CTA"]
        Footer["Footer"]
    end

    subgraph DashboardPage["Dashboard (/dashboard)"]
        DashLayout["Dashboard Layout<br/>(Auth Guard)"]
        DashContent["Dashboard Content"]
    end

    Children --> LandingPage
    Children --> DashboardPage
```

## External Services Integration

```mermaid
flowchart LR
    subgraph App["AthleteTrack Pro"]
        Core["Next.js Core"]
    end

    subgraph Auth["Authentication"]
        Google2["Google OAuth"]
        MagicLink["Magic Links"]
    end

    subgraph Payments["Payments"]
        StripeAPI["Stripe API"]
        Webhooks["Webhooks"]
    end

    subgraph Data["Data Storage"]
        MongoAtlas["MongoDB Atlas"]
    end

    subgraph Communications["Communications"]
        ResendEmail["Resend<br/>(Transactional Email)"]
        CrispChat["Crisp<br/>(Live Chat)"]
    end

    subgraph AI["AI Services"]
        GPT4["OpenAI GPT-4"]
    end

    Core <--> Auth
    Core <--> Payments
    Core <--> Data
    Core <--> Communications
    Core <--> AI
```

## Request/Response Flow

```mermaid
flowchart TB
    subgraph Request["Incoming Request"]
        Browser2["Browser"]
    end

    subgraph NextJS["Next.js Server"]
        Middleware["Middleware<br/>(if configured)"]
        Router["App Router"]

        subgraph ServerComp["Server Components"]
            Layout3["Layout"]
            Page2["Page"]
        end

        subgraph ClientComp["Client Components"]
            Interactive["Interactive UI"]
        end

        subgraph APIRoutes["API Routes"]
            Handlers["Route Handlers"]
        end
    end

    subgraph Services["Backend Services"]
        DB2["MongoDB"]
        External2["External APIs"]
    end

    Browser2 --> Middleware
    Middleware --> Router
    Router --> ServerComp
    Router --> APIRoutes
    ServerComp --> ClientComp
    APIRoutes --> Services
    Services --> APIRoutes
    ClientComp --> Browser2
```

---

## Technology Stack Summary

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14.1.4 (App Router) |
| **Frontend** | React 18.2.0, TypeScript |
| **Styling** | Tailwind CSS 3.4.3, DaisyUI 4.10.1 |
| **Database** | MongoDB Atlas + Mongoose 7.6.10 |
| **Auth** | NextAuth.js 4.24.7 |
| **Payments** | Stripe 13.11.0 |
| **Email** | Resend 4.0.1 |
| **AI** | OpenAI GPT-4 |
| **Support** | Crisp Chat |

---

*Generated: January 2026*
