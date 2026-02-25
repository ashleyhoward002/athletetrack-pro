import themes from "daisyui/src/theming/themes";
import { ConfigProps } from "./types/config";

const config = {
  // REQUIRED
  appName: "AthleteTrack Pro",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "The Strategic Command Center for Your Athlete's Future.",
  // REQUIRED (no https://, not trailing slash at the end, just the naked domain)
  domainName: "athletetrackpro.com",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  // Brand colors
  brandColors: {
    darkNavy: "#0F1B2D",
    electricOrange: "#FF6B35",
    teal: "#00B4D8",
    mint: "#10B981",
  },
  stripe: {
    plans: [
      {
        tier: "parent_view",
        priceId: null, // Free tier - no Stripe price
        name: "Parent View",
        description: "Read-only access when child's team uses AthleteTrack Pro",
        price: 0,
        yearlyPrice: 0,
        yearlyPriceId: null,
        isFree: true,
        features: [
          { name: "View stats & game summaries" },
          { name: "View shared highlights" },
          { name: "Read-only team access" },
        ],
        limitations: {
          athletes: 0,
          isReadOnly: true,
        },
      },
      {
        tier: "starter",
        priceId: "price_starter_monthly",
        yearlyPriceId: "price_starter_yearly",
        name: "Starter",
        description: "Perfect for tracking a single athlete",
        price: 9.99,
        yearlyPrice: 89,
        trialDays: 14,
        features: [
          { name: "1 athlete profile" },
          { name: "All sports stat tracking" },
          { name: "AI Coach tips" },
          { name: "Recruiter Snapshot PDF" },
          { name: "Phone video upload" },
        ],
        limitations: {
          athletes: 1,
        },
      },
      {
        tier: "pro",
        priceId: "price_pro_monthly",
        yearlyPriceId: "price_pro_yearly",
        additionalAthletePriceId: "price_pro_additional_athlete",
        isFeatured: true,
        name: "Pro",
        description: "For serious multi-sport families",
        price: 14.99,
        yearlyPrice: 139,
        additionalAthletePrice: 2.99,
        trialDays: 14,
        features: [
          { name: "Up to 4 athletes included" },
          { name: "+$2.99/mo per additional athlete" },
          { name: "Everything in Starter PLUS:" },
          { name: "Veo/video import" },
          { name: "AI shot form analysis (MediaPipe)" },
          { name: "AI highlight detection" },
          { name: "Recruiting profile builder" },
          { name: "Priority support" },
        ],
        limitations: {
          athletes: 4,
          additionalAthletePrice: 2.99,
        },
      },
      {
        tier: "team",
        priceId: "price_team_monthly",
        yearlyPriceId: "price_team_yearly",
        name: "Team",
        description: "Perfect for coaches and teams",
        price: 29.99,
        yearlyPrice: 249,
        features: [
          { name: "Up to 50 players" },
          { name: "Full roster management" },
          { name: "Bulk stat entry" },
          { name: "Game-day scoring" },
          { name: "Parent sharing portal" },
          { name: "Performance reports" },
        ],
        limitations: {
          athletes: 50,
        },
      },
      {
        tier: "school_org",
        priceId: null, // Custom pricing - contact sales
        name: "School/Org",
        description: "For schools and organizations",
        price: null, // Custom pricing
        yearlyPrice: null,
        isCustomPricing: true,
        features: [
          { name: "Unlimited teams" },
          { name: "Admin dashboard" },
          { name: "Custom branding" },
          { name: "Priority onboarding" },
          { name: "Dedicated support" },
        ],
        limitations: {
          athletes: -1, // Unlimited
          teams: -1, // Unlimited
        },
      },
    ],
    // Feature flags for subscription gating
    featureAccess: {
      parent_view: {
        viewStats: true,
        viewHighlights: true,
        editStats: false,
        aiCoach: false,
        videoUpload: false,
        veoImport: false,
        formAnalysis: false,
        highlightDetection: false,
        recruitingProfile: false,
        teamManagement: false,
        bulkEntry: false,
        parentPortal: false,
      },
      starter: {
        viewStats: true,
        viewHighlights: true,
        editStats: true,
        aiCoach: true,
        videoUpload: true,
        recruiterSnapshot: true,
        veoImport: false,
        formAnalysis: false,
        highlightDetection: false,
        recruitingProfile: false,
        teamManagement: false,
        bulkEntry: false,
        parentPortal: false,
      },
      pro: {
        viewStats: true,
        viewHighlights: true,
        editStats: true,
        aiCoach: true,
        videoUpload: true,
        recruiterSnapshot: true,
        veoImport: true,
        formAnalysis: true,
        highlightDetection: true,
        recruitingProfile: true,
        teamManagement: false,
        bulkEntry: false,
        parentPortal: false,
        prioritySupport: true,
      },
      team: {
        viewStats: true,
        viewHighlights: true,
        editStats: true,
        aiCoach: true,
        videoUpload: true,
        recruiterSnapshot: true,
        veoImport: true,
        formAnalysis: true,
        highlightDetection: true,
        recruitingProfile: true,
        teamManagement: true,
        bulkEntry: true,
        parentPortal: true,
        performanceReports: true,
      },
      school_org: {
        viewStats: true,
        viewHighlights: true,
        editStats: true,
        aiCoach: true,
        videoUpload: true,
        recruiterSnapshot: true,
        veoImport: true,
        formAnalysis: true,
        highlightDetection: true,
        recruitingProfile: true,
        teamManagement: true,
        bulkEntry: true,
        parentPortal: true,
        performanceReports: true,
        customBranding: true,
        adminDashboard: true,
        unlimitedTeams: true,
      },
    },
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `AthleteTrack Pro <noreply@athletetrackpro.com>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Admin at AthleteTrack Pro <admin@athletetrackpro.com>`,
    // Email shown to customer if they need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@athletetrackpro.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you use any theme other than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["light"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/login",
    // REQUIRED — the path you want to redirect users to after a successful login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
