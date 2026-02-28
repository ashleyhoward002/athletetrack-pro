"use client";

import { ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { FeatureAccess } from "@/types/config";
import Link from "next/link";
import { featureDisplayNames, getRecommendedUpgrade } from "@/libs/subscription";

interface FeatureGateProps {
    feature: keyof FeatureAccess;
    children: ReactNode;
    fallback?: ReactNode;
    showUpgradePrompt?: boolean;
}

/**
 * FeatureGate - Wraps content that should only be visible to users with the required feature access
 *
 * Usage:
 * <FeatureGate feature="formAnalysis">
 *   <FormAnalysisContent />
 * </FeatureGate>
 */
export function FeatureGate({
    feature,
    children,
    fallback,
    showUpgradePrompt = true,
}: FeatureGateProps) {
    const { checkFeature, isLoading, tier } = useSubscription();

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    const hasAccess = checkFeature(feature);

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    if (showUpgradePrompt) {
        return <UpgradePrompt feature={feature} currentTier={tier} />;
    }

    return null;
}

interface UpgradePromptProps {
    feature: keyof FeatureAccess;
    currentTier?: string;
    compact?: boolean;
}

/**
 * UpgradePrompt - Shows a prompt to upgrade when a feature is locked
 */
export function UpgradePrompt({ feature, currentTier, compact = false }: UpgradePromptProps) {
    const displayName = featureDisplayNames[feature];
    const upgradeTier = getRecommendedUpgrade(
        (currentTier as any) || "parent_view",
        feature
    );

    if (compact) {
        return (
            <div className="inline-flex items-center gap-2 text-sm">
                <span className="badge badge-warning badge-sm">PRO</span>
                <Link href="/#pricing" className="link link-primary">
                    Upgrade to unlock
                </Link>
            </div>
        );
    }

    return (
        <div className="card bg-base-200 border border-warning/30">
            <div className="card-body items-center text-center py-8">
                <div className="text-4xl mb-2">
                    <svg
                        className="w-12 h-12 text-warning mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                </div>
                <h3 className="card-title">{displayName}</h3>
                <p className="text-base-content/70 max-w-md">
                    This feature is available on the{" "}
                    <span className="font-semibold text-primary capitalize">
                        {upgradeTier || "Pro"}
                    </span>{" "}
                    plan and above.
                </p>
                <div className="card-actions mt-4">
                    <Link href="/#pricing" className="btn btn-primary">
                        View Plans
                    </Link>
                </div>
            </div>
        </div>
    );
}

/**
 * FeatureBadge - Shows a small badge for locked features (e.g., on buttons)
 */
export function FeatureBadge({ feature }: { feature: keyof FeatureAccess }) {
    const { checkFeature, isLoading } = useSubscription();

    if (isLoading) return null;

    const hasAccess = checkFeature(feature);

    if (hasAccess) return null;

    return (
        <span className="badge badge-warning badge-xs ml-1">PRO</span>
    );
}

export default FeatureGate;
