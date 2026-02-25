import config from "@/config";
import { SubscriptionTier, FeatureAccess, StripePlan } from "@/types/config";

/**
 * Get a user's subscription tier from their priceId
 */
export function getTierFromPriceId(priceId: string | null | undefined): SubscriptionTier {
  if (!priceId) return "parent_view";

  const plan = config.stripe.plans.find(
    (p) => p.priceId === priceId || p.yearlyPriceId === priceId
  );

  return plan?.tier || "parent_view";
}

/**
 * Get the plan details for a given tier
 */
export function getPlanByTier(tier: SubscriptionTier): StripePlan | undefined {
  return config.stripe.plans.find((p) => p.tier === tier);
}

/**
 * Get the plan details for a given priceId
 */
export function getPlanByPriceId(priceId: string): StripePlan | undefined {
  return config.stripe.plans.find(
    (p) => p.priceId === priceId || p.yearlyPriceId === priceId
  );
}

/**
 * Get feature access for a given tier
 */
export function getFeatureAccess(tier: SubscriptionTier): FeatureAccess {
  return config.stripe.featureAccess[tier];
}

/**
 * Check if a user has access to a specific feature
 */
export function hasFeatureAccess(
  tier: SubscriptionTier,
  feature: keyof FeatureAccess
): boolean {
  const access = getFeatureAccess(tier);
  return access[feature] ?? false;
}

/**
 * Check if a user can add more athletes based on their tier
 */
export function canAddAthlete(
  tier: SubscriptionTier,
  currentAthleteCount: number
): { allowed: boolean; requiresUpgrade: boolean; additionalCost?: number } {
  const plan = getPlanByTier(tier);

  if (!plan?.limitations) {
    return { allowed: false, requiresUpgrade: true };
  }

  const maxAthletes = plan.limitations.athletes;

  // Unlimited athletes (-1)
  if (maxAthletes === -1) {
    return { allowed: true, requiresUpgrade: false };
  }

  // Read-only tier (parent_view)
  if (plan.limitations.isReadOnly) {
    return { allowed: false, requiresUpgrade: true };
  }

  // Within limits
  if (currentAthleteCount < maxAthletes) {
    return { allowed: true, requiresUpgrade: false };
  }

  // Pro tier - can add with additional cost
  if (tier === "pro" && plan.limitations.additionalAthletePrice) {
    return {
      allowed: true,
      requiresUpgrade: false,
      additionalCost: plan.limitations.additionalAthletePrice,
    };
  }

  // At limit - needs upgrade
  return { allowed: false, requiresUpgrade: true };
}

/**
 * Get the recommended upgrade tier for a user
 */
export function getRecommendedUpgrade(
  currentTier: SubscriptionTier,
  neededFeature?: keyof FeatureAccess
): SubscriptionTier | null {
  const tierOrder: SubscriptionTier[] = [
    "parent_view",
    "starter",
    "pro",
    "team",
    "school_org",
  ];

  const currentIndex = tierOrder.indexOf(currentTier);

  if (neededFeature) {
    // Find the lowest tier that has the needed feature
    for (let i = currentIndex + 1; i < tierOrder.length; i++) {
      if (hasFeatureAccess(tierOrder[i], neededFeature)) {
        return tierOrder[i];
      }
    }
  }

  // Just return the next tier up
  if (currentIndex < tierOrder.length - 1) {
    return tierOrder[currentIndex + 1];
  }

  return null;
}

/**
 * Compare two tiers to see which is higher
 */
export function compareTiers(
  tierA: SubscriptionTier,
  tierB: SubscriptionTier
): number {
  const tierOrder: SubscriptionTier[] = [
    "parent_view",
    "starter",
    "pro",
    "team",
    "school_org",
  ];

  return tierOrder.indexOf(tierA) - tierOrder.indexOf(tierB);
}

/**
 * Check if tier A is at least as high as tier B
 */
export function isAtLeastTier(
  currentTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  return compareTiers(currentTier, requiredTier) >= 0;
}

/**
 * Feature name to display name mapping
 */
export const featureDisplayNames: Record<keyof FeatureAccess, string> = {
  viewStats: "View Stats",
  viewHighlights: "View Highlights",
  editStats: "Edit Stats",
  aiCoach: "AI Coach Tips",
  videoUpload: "Video Upload",
  recruiterSnapshot: "Recruiter Snapshot PDF",
  veoImport: "Veo/Video Import",
  formAnalysis: "AI Form Analysis",
  highlightDetection: "AI Highlight Detection",
  recruitingProfile: "Recruiting Profile Builder",
  teamManagement: "Team Management",
  bulkEntry: "Bulk Stat Entry",
  parentPortal: "Parent Sharing Portal",
  performanceReports: "Performance Reports",
  customBranding: "Custom Branding",
  adminDashboard: "Admin Dashboard",
  unlimitedTeams: "Unlimited Teams",
  prioritySupport: "Priority Support",
};

/**
 * Get the upgrade message for a locked feature
 */
export function getUpgradeMessage(feature: keyof FeatureAccess): string {
  const displayName = featureDisplayNames[feature];
  return `Upgrade your plan to unlock ${displayName}`;
}
