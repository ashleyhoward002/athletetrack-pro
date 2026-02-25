"use client";

import { useState } from "react";
import Link from "next/link";
import config from "@/config";
import { useSubscription } from "@/hooks/useSubscription";
import ButtonCheckout from "@/components/ButtonCheckout";

export default function UpgradePage() {
  const [isYearly, setIsYearly] = useState(false);
  const { tier: currentTier, isLoading } = useSubscription();
  const colors = config.brandColors;
  const plans = config.stripe.plans.filter((p) => !p.isFree && !p.isCustomPricing);

  const tierOrder = ["parent_view", "starter", "pro", "team", "school_org"];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Upgrade Your Plan</h1>
          <p className="text-slate-600">
            Choose the plan that best fits your needs. Upgrade anytime.
          </p>
        </div>

        {/* Current Plan Banner */}
        <div
          className="rounded-xl p-4 mb-8 flex items-center justify-between"
          style={{ backgroundColor: `${colors.teal}15` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.teal }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-600">Current Plan</p>
              <p className="font-semibold text-slate-800 capitalize">
                {config.stripe.plans.find((p) => p.tier === currentTier)?.name || "Free"}
              </p>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-10">
          <span className={`text-sm font-medium ${!isYearly ? "text-slate-800" : "text-slate-400"}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-14 h-7 rounded-full transition-colors"
            style={{ backgroundColor: isYearly ? colors.mint : "#cbd5e1" }}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                isYearly ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isYearly ? "text-slate-800" : "text-slate-400"}`}>
            Yearly
            <span
              className="ml-2 text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: colors.mint }}
            >
              Save up to 25%
            </span>
          </span>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const isFeatured = plan.isFeatured;
            const isCurrentPlan = plan.tier === currentTier;
            const canUpgrade = tierOrder.indexOf(plan.tier) > tierOrder.indexOf(currentTier);
            const price = isYearly ? plan.yearlyPrice : plan.price;
            const priceId = isYearly ? plan.yearlyPriceId : plan.priceId;
            const period = isYearly ? "/year" : "/mo";

            return (
              <div
                key={plan.tier}
                className={`relative rounded-2xl p-6 transition-all ${
                  isFeatured ? "ring-2 shadow-lg" : "border border-slate-200"
                }`}
                style={{
                  backgroundColor: "white",
                  ringColor: isFeatured ? colors.electricOrange : undefined,
                }}
              >
                {/* Most Popular Badge */}
                {isFeatured && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-white"
                    style={{ backgroundColor: colors.electricOrange }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div
                    className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: colors.teal, color: "white" }}
                  >
                    Current
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-500">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-800">${price}</span>
                  <span className="text-slate-500">{period}</span>
                  {plan.trialDays && !isCurrentPlan && canUpgrade && (
                    <p className="text-sm mt-1" style={{ color: colors.mint }}>
                      {plan.trialDays}-day free trial
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <svg
                        className="w-5 h-5 shrink-0 mt-0.5"
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
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl font-semibold bg-slate-100 text-slate-400 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : canUpgrade && priceId ? (
                  <ButtonCheckout
                    priceId={priceId}
                    mode="subscription"
                    className={`w-full py-3 font-semibold rounded-xl transition text-white`}
                    style={{
                      backgroundColor: isFeatured ? colors.electricOrange : colors.teal,
                    }}
                  />
                ) : (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl font-semibold bg-slate-100 text-slate-400 cursor-not-allowed"
                  >
                    {tierOrder.indexOf(plan.tier) < tierOrder.indexOf(currentTier)
                      ? "Lower Tier"
                      : "Contact Sales"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* School/Org Card */}
        <div
          className="rounded-2xl p-8 text-center mb-12"
          style={{ backgroundColor: colors.darkNavy }}
        >
          <h3 className="text-2xl font-bold text-white mb-2">School / Organization</h3>
          <p className="text-slate-400 mb-6 max-w-xl mx-auto">
            Need unlimited teams, custom branding, and dedicated support? Contact our sales team
            for a custom quote.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm text-slate-300">
            {["Unlimited teams", "Admin dashboard", "Custom branding", "Priority onboarding"].map(
              (feature) => (
                <span key={feature} className="flex items-center gap-2">
                  <span style={{ color: colors.mint }}>✓</span> {feature}
                </span>
              )
            )}
          </div>
          <a
            href="mailto:sales@athletetrackpro.com?subject=School/Org Pricing Inquiry"
            className="inline-block px-8 py-3 rounded-xl font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: colors.electricOrange }}
          >
            Contact Sales
          </a>
        </div>

        {/* Growth Loop */}
        <div className="text-center">
          <p
            className="inline-block px-6 py-3 rounded-full text-sm font-medium"
            style={{ backgroundColor: `${colors.teal}15`, color: colors.teal }}
          >
            Coach subscribes → Parents get free access → Parents upgrade for AI & recruiting tools
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I change plans anytime?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "What happens to my data if I downgrade?",
                a: "Your data is never deleted. If you downgrade, you'll retain read access to all your data, but some features may become locked.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes! Starter and Pro plans come with a 14-day free trial. No credit card required to start.",
              },
              {
                q: "What's the Parent View tier?",
                a: "Parent View is a free read-only tier for parents whose children are on a team using AthleteTrack Pro. They can view stats and highlights shared by coaches.",
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-slate-200">
                <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-slate-800">
                  {faq.q}
                  <svg
                    className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-slate-600 text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
