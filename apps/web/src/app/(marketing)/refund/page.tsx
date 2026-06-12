import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — ZEAZ Platform",
  description:
    "ZEAZ Platform Refund Policy for digital SaaS subscriptions, including eligibility, non-refundable items, and how to request a refund.",
};

export default function RefundPage() {
  return (
    <div className="bg-[#05070d] min-h-screen">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-16 md:py-24 space-y-10">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Refund Policy
          </h1>
          <p className="text-slate-400">Last updated: June 2026</p>
        </div>

        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">Digital Service Delivery</h2>
            <p>
              ZEAZ Platform delivers all services digitally. After successful payment,
              customers receive immediate access to their subscribed software features,
              cloud-hosted tools, AI automation capabilities, API integrations, and any
              applicable digital resources. No physical goods are shipped as part of any
              transaction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">Subscription Billing</h2>
            <p>
              Subscriptions are billed in advance on a monthly or annual basis. By
              subscribing, you agree to the recurring billing cycle selected at checkout.
              Payment is processed through third-party payment processors. ZEAZ Platform
              does not store full credit card numbers on its own servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">Cancellation</h2>
            <p>
              You may cancel your subscription at any time through your account settings or
              by contacting our support team. Upon cancellation, your access to paid features
              continues through the end of the current billing period. No further charges
              will be made after cancellation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">Refund Eligibility</h2>
            <p>
              Refunds are reviewed on a case-by-case basis. The following situations may
              qualify for a refund:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Duplicate charges or billing errors</li>
              <li>
                Inability to access or use the subscribed Services due to a technical issue
                on our side that cannot be resolved within a reasonable timeframe
              </li>
              <li>
                 Incorrect subscription tier purchased (upgrade/downgrade adjustments)
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">Non-Refundable Items</h2>
            <p>
              The following are generally non-refundable:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Consulting services, custom development work, and professional services that
                have been delivered or performed
              </li>
              <li>
                Partial billing periods after cancellation (access continues through the end
                of the paid period)
              </li>
              <li>
                Third-party fees or charges not directly processed by ZEAZ Platform
              </li>
              <li>Subscription fees for billing periods that have already been used</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">How to Request a Refund</h2>
            <p>
              To request a refund, please contact our support team through the Contact page
              on our website or email support@zeaz.dev with the following information:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account email address</li>
              <li>Description of the issue</li>
              <li>Date of the charge in question</li>
              <li>Any relevant order or transaction identifiers</li>
            </ul>
            <p>
              We will review your request and respond within a reasonable timeframe.
              Approved refunds will be processed using the original payment method.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">Contact</h2>
            <p>
              If you have questions about this Refund Policy, please contact us through our
              Contact page or at support@zeaz.dev.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
