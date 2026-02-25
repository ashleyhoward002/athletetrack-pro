export type Theme =
  | "light"
  | "dark"
  | "cupcake"
  | "bumblebee"
  | "emerald"
  | "corporate"
  | "synthwave"
  | "retro"
  | "cyberpunk"
  | "valentine"
  | "halloween"
  | "garden"
  | "forest"
  | "aqua"
  | "lofi"
  | "pastel"
  | "fantasy"
  | "wireframe"
  | "black"
  | "luxury"
  | "dracula"
  | "";

export type SubscriptionTier = "parent_view" | "starter" | "pro" | "team" | "school_org";

export interface PlanFeature {
  name: string;
}

export interface PlanLimitations {
  athletes: number;
  teams?: number;
  additionalAthletePrice?: number;
  isReadOnly?: boolean;
}

export interface FeatureAccess {
  viewStats: boolean;
  viewHighlights: boolean;
  editStats: boolean;
  aiCoach: boolean;
  videoUpload: boolean;
  recruiterSnapshot?: boolean;
  veoImport: boolean;
  formAnalysis: boolean;
  highlightDetection: boolean;
  recruitingProfile: boolean;
  teamManagement: boolean;
  bulkEntry: boolean;
  parentPortal: boolean;
  performanceReports?: boolean;
  customBranding?: boolean;
  adminDashboard?: boolean;
  unlimitedTeams?: boolean;
  prioritySupport?: boolean;
}

export interface StripePlan {
  tier: SubscriptionTier;
  priceId: string | null;
  yearlyPriceId?: string | null;
  additionalAthletePriceId?: string;
  isFeatured?: boolean;
  isFree?: boolean;
  isCustomPricing?: boolean;
  name: string;
  description?: string;
  price: number | null;
  yearlyPrice?: number | null;
  additionalAthletePrice?: number;
  priceAnchor?: number;
  trialDays?: number;
  features: PlanFeature[];
  limitations?: PlanLimitations;
}

export interface BrandColors {
  darkNavy: string;
  electricOrange: string;
  teal: string;
  mint: string;
}

export interface ConfigProps {
  appName: string;
  appDescription: string;
  domainName: string;
  crisp: {
    id?: string;
    onlyShowOnRoutes?: string[];
  };
  brandColors: BrandColors;
  stripe: {
    plans: StripePlan[];
    featureAccess: Record<SubscriptionTier, FeatureAccess>;
  };
  aws?: {
    bucket?: string;
    bucketUrl?: string;
    cdn?: string;
  };
  resend: {
    fromNoReply: string;
    fromAdmin: string;
    supportEmail?: string;
  };
  colors: {
    theme: Theme;
    main: string;
  };
  auth: {
    loginUrl: string;
    callbackUrl: string;
  };
}
