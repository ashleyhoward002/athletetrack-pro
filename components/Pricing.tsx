"use client";

import { useState } from "react";
import config from "@/config";
import ButtonCheckout from "./ButtonCheckout";
import Link from "next/link";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const plans = config.stripe.plans;
  const colors = config.brandColors;

  // Filter out parent_view for main pricing display
  const paidPlans = plans.filter((plan) => plan.tier !== "parent_view");

  return (
    <section
      className="overflow-hidden py-24 px-4"
      id="pricing"
      style={{ backgroundColor: colors.darkNavy }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col text-center w-full mb-12">
          <p
            className="font-semibold mb-4 text-sm uppercase tracking-wider"
            style={{ color: colors.teal }}
          >
            Simple, Transparent Pricing
          </p>
          <h2 className="font-bold text-3xl lg:text-5xl tracking-tight text-white mb-4">
            Less than a private lesson
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Invest in their future. Start free, upgrade when ready.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span
            className={`text-sm font-medium ${
              !isYearly ? "text-white" : "text-slate-400"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-14 h-7 rounded-full transition-colors"
            style={{ backgroundColor: isYearly ? colors.mint : "#475569" }}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                isYearly ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${
              isYearly ? "text-white" : "text-slate-400"
            }`}
          >
            Yearly
            <span
              className="ml-2 text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: colors.mint, color: colors.darkNavy }}
            >
              Save up to 25%
            </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {paidPlans.map((plan) => {
            const isFeatured = plan.isFeatured;
            const isCustom = plan.isCustomPricing;
            const price = isYearly ? plan.yearlyPrice : plan.price;
            const priceId = isYearly ? plan.yearlyPriceId : plan.priceId;
            const period = isYearly ? "/year" : "/mo";

            return (
              <div
                key={plan.tier}
                className={`relative rounded-2xl p-6 transition-all ${
                  isFeatured
                    ? "lg:scale-105 lg:-my-4 shadow-2xl"
                    : "hover:scale-[1.02]"
                }`}
                style={{
                  backgroundColor: isFeatured ? colors.electricOrange : "#1E293B",
                  border: isFeatured
                    ? "none"
                    : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {/* Most Popular Badge */}
                {isFeatured && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                    style={{
                      backgroundColor: colors.darkNavy,
                      color: colors.electricOrange,
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      isFeatured ? "text-white" : "text-white"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      isFeatured ? "text-white/80" : "text-slate-400"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {isCustom ? (
                    <div>
                      <span className="text-3xl font-bold text-white">
                        Custom
                      </span>
                      <p
                        className={`text-sm mt-1 ${
                          isFeatured ? "text-white/80" : "text-slate-400"
                        }`}
                      >
                        Contact for pricing
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold text-white">
                        ${price}
                      </span>
                      <span
                        className={`${
                          isFeatured ? "text-white/80" : "text-slate-400"
                        }`}
                      >
                        {period}
                      </span>
                      {plan.trialDays && (
                        <p
                          className={`text-sm mt-1 ${
                            isFeatured ? "text-white/80" : "text-slate-400"
                          }`}
                        >
                          {plan.trialDays}-day free trial
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2 text-sm ${
                        isFeatured ? "text-white" : "text-slate-300"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          isFeatured ? "text-white" : ""
                        }`}
                        style={{ color: isFeatured ? "white" : colors.mint }}
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
                {isCustom ? (
                  <Link
                    href="mailto:sales@athletetrackpro.com?subject=School/Org Pricing Inquiry"
                    className="block w-full py-3 text-center font-semibold rounded-xl transition bg-white/10 hover:bg-white/20 text-white"
                  >
                    Contact Sales
                  </Link>
                ) : priceId ? (
                  <ButtonCheckout
                    priceId={priceId}
                    mode="subscription"
                    className={`w-full py-3 font-semibold rounded-xl transition ${
                      isFeatured
                        ? "bg-white hover:bg-slate-100"
                        : "hover:opacity-90"
                    }`}
                    style={{
                      backgroundColor: isFeatured ? "white" : colors.teal,
                      color: isFeatured ? colors.electricOrange : "white",
                    }}
                  >
                    Start Free Trial
                  </ButtonCheckout>
                ) : (
                  <Link
                    href="/signup"
                    className={`block w-full py-3 text-center font-semibold rounded-xl transition ${
                      isFeatured
                        ? "bg-white hover:bg-slate-100"
                        : "hover:opacity-90"
                    }`}
                    style={{
                      backgroundColor: isFeatured ? "white" : colors.teal,
                      color: isFeatured ? colors.electricOrange : "white",
                    }}
                  >
                    Start Free Trial
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Parent View Free Tier */}
        <div
          className="max-w-2xl mx-auto rounded-2xl p-6 text-center mb-12"
          style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: colors.mint, color: colors.darkNavy }}
            >
              FREE
            </span>
            <h4 className="text-lg font-bold text-white">Parent View</h4>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Read-only access when your child's team uses AthleteTrack Pro. View
            stats, game summaries, and shared highlights at no cost.
          </p>
          <Link
            href="/signup?plan=parent"
            className="inline-block px-6 py-2 rounded-lg font-medium text-sm transition"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "white",
            }}
          >
            Join as Parent
          </Link>
        </div>

        {/* Growth Loop Tagline */}
        <div className="text-center">
          <p
            className="inline-block px-6 py-3 rounded-full text-sm font-medium"
            style={{
              backgroundColor: "rgba(0, 180, 216, 0.15)",
              color: colors.teal,
            }}
          >
            Coach subscribes → Parents get free access → Parents upgrade for AI
            & recruiting tools
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500 mt-10">
          <span className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
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
            No credit card for trial
          </span>
          <span className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
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
            Cancel anytime
          </span>
          <span className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
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
            Setup in 5 minutes
          </span>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
