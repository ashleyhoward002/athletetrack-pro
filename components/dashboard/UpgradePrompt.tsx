"use client";

import Link from "next/link";
import { FeatureAccess, SubscriptionTier } from "@/types/config";
import { getPlanByTier, featureDisplayNames } from "@/libs/subscription";
import config from "@/config";

interface UpgradePromptProps {
  feature: keyof FeatureAccess;
  currentTier: SubscriptionTier;
  upgradeTier: SubscriptionTier;
  variant?: "inline" | "modal" | "banner";
  onClose?: () => void;
}

export function UpgradePrompt({
  feature,
  currentTier,
  upgradeTier,
  variant = "inline",
  onClose,
}: UpgradePromptProps) {
  const colors = config.brandColors;
  const upgradePlan = getPlanByTier(upgradeTier);
  const featureName = featureDisplayNames[feature];

  if (!upgradePlan) return null;

  if (variant === "banner") {
    return (
      <div
        className="w-full px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: colors.electricOrange }}
      >
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="text-white font-medium text-sm">
            Upgrade to {upgradePlan.name} to unlock {featureName}
          </span>
        </div>
        <Link
          href="/dashboard/upgrade"
          className="px-4 py-1.5 bg-white rounded-lg text-sm font-semibold transition hover:bg-slate-100"
          style={{ color: colors.electricOrange }}
        >
          Upgrade Now
        </Link>
      </div>
    );
  }

  if (variant === "modal") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
          <div className="text-center mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${colors.electricOrange}20` }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: colors.electricOrange }}
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
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Unlock {featureName}
            </h3>
            <p className="text-slate-600 text-sm">
              This feature is available on the{" "}
              <span className="font-semibold">{upgradePlan.name}</span> plan and
              above.
            </p>
          </div>

          <div
            className="rounded-xl p-4 mb-6"
            style={{ backgroundColor: colors.darkNavy }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold">{upgradePlan.name}</span>
              <span className="text-white">
                ${upgradePlan.price}
                <span className="text-slate-400 text-sm">/mo</span>
              </span>
            </div>
            <ul className="space-y-2">
              {upgradePlan.features.slice(0, 4).map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <svg
                    className="w-4 h-4"
                    style={{ color: colors.mint }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {f.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                Maybe Later
              </button>
            )}
            <Link
              href="/dashboard/upgrade"
              className="flex-1 py-3 rounded-xl font-semibold text-white text-center transition"
              style={{ backgroundColor: colors.electricOrange }}
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div
      className="rounded-xl p-6 border"
      style={{
        backgroundColor: `${colors.darkNavy}08`,
        borderColor: `${colors.darkNavy}20`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${colors.electricOrange}15` }}
        >
          <svg
            className="w-6 h-6"
            style={{ color: colors.electricOrange }}
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
        <div className="flex-1">
          <h4 className="font-semibold text-slate-800 mb-1">
            {featureName} requires {upgradePlan.name}
          </h4>
          <p className="text-sm text-slate-600 mb-4">
            Upgrade to {upgradePlan.name} to unlock {featureName.toLowerCase()}{" "}
            and more powerful features.
          </p>
          <Link
            href="/dashboard/upgrade"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white transition hover:opacity-90"
            style={{ backgroundColor: colors.electricOrange }}
          >
            Upgrade to {upgradePlan.name}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Feature gate component that shows upgrade prompt when feature is locked
 */
interface FeatureGateProps {
  feature: keyof FeatureAccess;
  currentTier: SubscriptionTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({
  feature,
  currentTier,
  children,
  fallback,
}: FeatureGateProps) {
  const access = config.stripe.featureAccess[currentTier];
  const hasAccess = access[feature] ?? false;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Find the upgrade tier
  const tierOrder: SubscriptionTier[] = [
    "parent_view",
    "starter",
    "pro",
    "team",
    "school_org",
  ];
  const currentIndex = tierOrder.indexOf(currentTier);
  let upgradeTier: SubscriptionTier = "pro";

  for (let i = currentIndex + 1; i < tierOrder.length; i++) {
    const tierAccess = config.stripe.featureAccess[tierOrder[i]];
    if (tierAccess[feature]) {
      upgradeTier = tierOrder[i];
      break;
    }
  }

  return (
    <UpgradePrompt
      feature={feature}
      currentTier={currentTier}
      upgradeTier={upgradeTier}
    />
  );
}

/**
 * Locked feature overlay for UI elements
 */
interface LockedFeatureOverlayProps {
  feature: keyof FeatureAccess;
  children: React.ReactNode;
}

export function LockedFeatureOverlay({
  feature,
  children,
}: LockedFeatureOverlayProps) {
  const colors = config.brandColors;
  const featureName = featureDisplayNames[feature];

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none blur-[1px]">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
        <div className="text-center p-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: `${colors.electricOrange}15` }}
          >
            <svg
              className="w-6 h-6"
              style={{ color: colors.electricOrange }}
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
          <p className="font-semibold text-slate-800 mb-2">{featureName}</p>
          <Link
            href="/dashboard/upgrade"
            className="inline-block px-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: colors.electricOrange }}
          >
            Upgrade to Unlock
          </Link>
        </div>
      </div>
    </div>
  );
}
