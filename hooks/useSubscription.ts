"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  getTierFromPriceId,
  getFeatureAccess,
  hasFeatureAccess,
  canAddAthlete,
  getRecommendedUpgrade,
  getPlanByTier,
} from "@/libs/subscription";
import { SubscriptionTier, FeatureAccess, StripePlan } from "@/types/config";

interface SubscriptionState {
  tier: SubscriptionTier;
  plan: StripePlan | undefined;
  features: FeatureAccess;
  hasAccess: boolean;
  isLoading: boolean;
  priceId: string | null;
  customerId: string | null;
}

interface UseSubscriptionReturn extends SubscriptionState {
  checkFeature: (feature: keyof FeatureAccess) => boolean;
  canAddMoreAthletes: (currentCount: number) => ReturnType<typeof canAddAthlete>;
  getUpgradeTier: (feature?: keyof FeatureAccess) => SubscriptionTier | null;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [state, setState] = useState<SubscriptionState>({
    tier: "parent_view",
    plan: undefined,
    features: getFeatureAccess("parent_view"),
    hasAccess: false,
    isLoading: true,
    priceId: null,
    customerId: null,
  });

  const fetchSubscription = async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
      return;
    }

    const { data: userData } = await supabase
      .from("users")
      .select("priceId, customerId, hasAccess")
      .eq("id", user.id)
      .single();

    const tier = getTierFromPriceId(userData?.priceId);
    const plan = getPlanByTier(tier);
    const features = getFeatureAccess(tier);

    setState({
      tier,
      plan,
      features,
      hasAccess: userData?.hasAccess ?? false,
      isLoading: false,
      priceId: userData?.priceId ?? null,
      customerId: userData?.customerId ?? null,
    });
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const checkFeature = (feature: keyof FeatureAccess): boolean => {
    return hasFeatureAccess(state.tier, feature);
  };

  const canAddMoreAthletes = (currentCount: number) => {
    return canAddAthlete(state.tier, currentCount);
  };

  const getUpgradeTier = (feature?: keyof FeatureAccess) => {
    return getRecommendedUpgrade(state.tier, feature);
  };

  return {
    ...state,
    checkFeature,
    canAddMoreAthletes,
    getUpgradeTier,
    refresh: fetchSubscription,
  };
}

/**
 * Hook to check a single feature with loading state
 */
export function useFeatureAccess(feature: keyof FeatureAccess) {
  const { checkFeature, isLoading, tier, getUpgradeTier } = useSubscription();

  return {
    hasAccess: checkFeature(feature),
    isLoading,
    currentTier: tier,
    upgradeTier: getUpgradeTier(feature),
  };
}
