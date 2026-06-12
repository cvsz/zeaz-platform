import type { Metadata } from "next";

const sections = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide when creating an account, subscribing to services, contacting support, or using our platform. This may include your name, email address, company name, billing information, and account preferences. We also collect usage data such as page views, feature interactions, API requests, and system logs to improve our services.",
  },
  {
    title: "How We Use Information",
    content:
      "We use the information we collect to provide, maintain, and improve our Services, process transactions and send related information (such as confirmations and invoices), send technical notices, updates, security alerts, and support messages, respond to your comments, questions, and requests, monitor and analyze trends, usage, and activities, and detect, investigate, and prevent fraudulent transactions and abuse.",
  },
  {
    title: "Account and Billing Data",
    content:
      "When you subscribe to our Services, payment processing is handled by third-party payment processors. We do not store full credit card numbers or bank account details on our own servers. We may store limited billing information such as your billing address, subscription tier, and payment history for accounting and customer support purposes.",
  },
  {
    title: "Cookies and Analytics",
    content:
      "We may use cookies and similar tracking technologies to operate and improve our website and Services. Cookies help us remember your preferences, understand how you interact with our platform, and provide relevant content. You can control cookie preferences through your browser settings. We may also use analytics services to collect anonymous usage statistics.",
  },
  {
    title: "Third-Party Service Providers",
    content:
      "We may share information with trusted third-party service providers who assist us in operating our platform, processing payments, hosting infrastructure, providing analytics, and delivering customer support. These providers are contractually obligated to protect your information and may only use it for the purposes we specify.",
  },
  {
    title: "Data Security",
    content:
      "We implement reasonable technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, access controls, and secure infrastructure practices. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
  },
  {
    title: "Data Retention",
    content:
      "We retain your personal information for as long as your account is active or as needed to provide you with the Services. We may retain certain information after account closure for legal, accounting, or compliance purposes. Usage logs and analytics data may be retained in anonymized form.",
  },
  {
    title: "User Rights",
    content:
      "Depending on your jurisdiction, you may have rights regarding your personal information, including the right to access, correct, delete, or port your data, the right to restrict or object to processing, the right to withdraw consent where processing is based on consent, and the right to lodge a complaint with a data protection authority. To exercise these rights, please contact us through our Contact page.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically. Material changes will be communicated to registered users via email or platform notice.",
  },
  {
    title: "Contact",
    content:
      "If you have questions or concerns about this Privacy Policy or our data practices, please contact us through our Contact page or at support@zeaz.dev.",
  },
];

export const metadata: Metadata = {
  title: "Privacy Policy — ZEAZ Platform",
  description:
    "ZEAZ Platform Privacy Policy explains how we collect, use, and protect your personal information when you use our SaaS platform.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-[#05070d] min-h-screen">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-16 md:py-24">
        <div className="space-y-2 mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Privacy Policy
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
