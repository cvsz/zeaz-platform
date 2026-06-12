import type { Metadata } from "next";

const sections = [
  {
    title: "Overview",
    content:
      "These Terms of Service govern your use of the ZEAZ Platform website, software services, AI automation tools, API integrations, cloud-based development tools, DevOps automation services, educational content, and consulting services (collectively, 'the Services'). By accessing or using the Services, you agree to be bound by these Terms. If you do not agree, do not use the Services.",
  },
  {
    title: "Eligibility",
    content:
      "You must be at least 18 years of age to use the Services. By accepting these Terms, you represent that you have the legal capacity to enter into a binding agreement. If you are using the Services on behalf of an organization, you represent that you have the authority to bind that organization.",
  },
  {
    title: "Services Provided",
    content:
      "ZEAZ Platform provides Software-as-a-Service (SaaS) offerings including but not limited to: AI automation tools and AI agents, cloud-based development environments, DevOps automation workflows, API integration services, educational and technical documentation, consulting and technical support services. All Services are delivered digitally through the ZEAZ Platform website, dashboard, cloud infrastructure, API endpoints, or support channels. No physical goods are shipped as part of any service.",
  },
  {
    title: "Account Registration",
    content:
      "You may need to create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate, current, and complete information during registration and keep your account information updated.",
  },
  {
    title: "Subscriptions and Billing",
    content:
      "Certain Services are offered on a subscription basis. Subscription fees are billed in advance on a monthly or annual basis as selected at the time of purchase. Payments are processed through third-party payment processors. ZEAZ Platform does not store full credit card numbers on its own servers. By subscribing, you authorize us to charge the applicable fees to your designated payment method. Fees are non-refundable except as expressly stated in our Refund Policy.",
  },
  {
    title: "Digital Delivery",
    content:
      "Upon successful payment, customers receive digital access to the subscribed Services. Delivery occurs electronically through account provisioning, API credentials, dashboard access, or digital content distribution. No physical items are shipped. Access credentials and instructions are provided through the registered email or account dashboard.",
  },
  {
    title: "Acceptable Use",
    content:
      "You agree to use the Services in compliance with all applicable laws and regulations. You may not use the Services for any unlawful purpose or in violation of these Terms. You agree not to interfere with the security, integrity, or availability of the Services.",
  },
  {
    title: "Prohibited Use",
    content:
      "You may not use the Services for: illegal activities or fraud, gambling or betting operations, financial services requiring regulatory licensing, adult content or pornography, sale of regulated goods or substances, any activity that violates applicable export control laws, any activity that infringes on the intellectual property rights of others. ZEAZ Platform does not provide financial services, gambling services, adult content, regulated products, or physical goods.",
  },
  {
    title: "Intellectual Property",
    content:
      "The ZEAZ Platform name, logo, website design, software code, documentation, and related materials are proprietary. Subject to these Terms, we grant you a limited, non-exclusive, non-transferable license to access and use the Services for your internal business purposes. You may not copy, modify, distribute, sell, or reverse-engineer any part of the Services unless expressly permitted.",
  },
  {
    title: "Service Availability",
    content:
      "We strive to maintain high availability of the Services but do not guarantee uninterrupted or error-free operation. Planned maintenance may result in temporary downtime. We will make reasonable efforts to notify subscribers of scheduled maintenance. Service availability commitments, if any, are specified in individual service agreements.",
  },
  {
    title: "Cancellation",
    content:
      "You may cancel your subscription at any time through your account settings or by contacting support. Upon cancellation, your access to paid features continues through the end of the current billing period. After that period, your account may be downgraded to a free tier or deactivated according to our data retention practices.",
  },
  {
    title: "Refunds",
    content:
      "Refund eligibility is determined on a case-by-case basis. Please refer to our Refund Policy for detailed information. Generally, refunds may be considered for duplicate charges, billing errors, or inability to access the Services. Consulting services and custom development work, once delivered, are generally non-refundable.",
  },
  {
    title: "Limitation of Liability",
    content:
      "To the maximum extent permitted by law, ZEAZ Platform shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Services. Our total liability for any claim arising from these Terms or the Services shall not exceed the amount you have paid to us in the twelve months preceding the claim.",
  },
  {
    title: "Changes to Terms",
    content:
      "We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated effective date. Your continued use of the Services after changes constitutes acceptance of the revised Terms. We will make reasonable efforts to notify subscribers of material changes.",
  },
  {
    title: "Contact",
    content:
      "If you have questions about these Terms, please contact us through our Contact page or at support@zeaz.dev.",
  },
];

export const metadata: Metadata = {
  title: "Terms of Service — ZEAZ Platform",
  description:
    "ZEAZ Platform Terms of Service governing use of our AI automation, cloud development tools, and SaaS services.",
};

export default function TermsPage() {
  return (
    <div className="bg-[#05070d] min-h-screen">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-16 md:py-24">
        <div className="space-y-2 mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Terms of Service
          </h1>
          <p className="text-slate-400">Last updated: June 2026</p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-xl font-bold text-white">{section.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
