"use client";

import { useState, useEffect, useRef } from "react";
import {
  Shield,
  FileText,
  RefreshCw,
  Cookie,
  UserCheck,
  Brain,
  Database,
  ArrowLeft,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  Award,
  Lock,
  Eye,
  Sparkles,
  QrCode,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "@/components/LandingPage/NavBar";
import Link from "next/link";

type PolicySection = {
  id: string;
  title: string;
  icon: any;
  lastUpdated: string;
  category: "privacy" | "terms" | "compliance";
  badges?: string[];
  content: React.ReactNode;
};

export default function PrivacyPolicesPage() {
  const [activeTab, setActiveTab] = useState<string>("privacy");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const policies: PolicySection[] = [
    {
      id: "privacy",
      title: "Privacy Policy",
      icon: Shield,
      category: "privacy",
      lastUpdated: "July 22, 2026",
      badges: ["DPDP Act 2023", "GDPR Compliant"],
      content: (
        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="rounded-xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30 p-4 border border-indigo-100/50 dark:border-indigo-800/50">
            <p className="font-medium text-slate-800 dark:text-slate-200">
              <Shield className="inline h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
              Your privacy is our priority. This policy explains how we collect,
              use, and protect your data.
            </p>
          </div>

          <p>
            Welcome to QReview AI (&quot;QReview AI&quot;, &quot;we&quot;,
            &quot;our&quot;, or &quot;us&quot;). Your privacy is important to
            us. This Privacy Policy explains how we collect, use, store,
            process, disclose, and protect your personal data when you use our
            website, mobile web application, QR code feedback system, merchant
            dashboard, or any related services (collectively, the
            &quot;Services&quot;).
          </p>
          <p>
            This Privacy Policy is intended to comply with the Digital Personal
            Data Protection Act, 2023 (&quot;DPDP Act&quot;), the Information
            Technology Act, 2000, and other applicable laws of India. By using
            our Services, you acknowledge that you have read and understood this
            Privacy Policy.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Your Rights
              </h4>
              <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <li>• Right to access your data</li>
                <li>• Right to correction</li>
                <li>• Right to deletion</li>
                <li>• Right to grievance redressal</li>
              </ul>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Lock className="h-4 w-4 text-indigo-500" />
                Data Protection
              </h4>
              <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <li>• End-to-end encryption</li>
                <li>• Regular security audits</li>
                <li>• Access controls</li>
                <li>• Secure data storage</li>
              </ul>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            1. Who We Are
          </h3>
          <p>
            QReview AI is a software platform that helps businesses collect
            customer feedback, generate AI-assisted review drafts based on
            users&apos; own input, manage customer feedback, and improve
            customer experience. QReview AI does not publish reviews on behalf
            of users. Users remain in full control of whether they choose to
            submit any review to third-party platforms such as Google.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            2. Scope
          </h3>
          <p>This Privacy Policy applies to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Visitors to our website</li>
            <li>Business owners and merchants</li>
            <li>Merchant employees</li>
            <li>Customers who scan QR codes</li>
            <li>Individuals contacting our support team</li>
            <li>Any other users of our Services</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            3. Personal Data We Collect
          </h3>
          <p>
            Depending on how you use our Services, we may collect the following
            categories of information:
          </p>

          <div className="space-y-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
            {[
              {
                title: "Information You Provide",
                items:
                  "Name, Email address, Mobile number, Business name, Business address, Business website, Login credentials, Customer feedback, Review text, Private feedback, and Support requests.",
              },
              {
                title: "Information Collected Automatically",
                items:
                  "IP address, Browser type, Device information, Operating system, Pages visited, Date and time, QR code scanned, Session information, Cookies, and Analytics information.",
              },
              {
                title: "Merchant Information",
                items:
                  "Business profile, Locations, Google Business Profile review link, QR codes generated, Subscription information, Billing information, and Dashboard usage statistics.",
              },
              {
                title: "Customer Feedback",
                items:
                  "Ratings, Feedback, Review text, AI-edited review drafts, optional private feedback, and Contact information (only if voluntarily provided).",
              },
            ].map((item, idx) => (
              <div key={idx}>
                <strong className="text-slate-800 dark:text-slate-200">
                  {item.title}:
                </strong>
                <p className="text-slate-600 dark:text-slate-400">
                  {item.items}
                </p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            4. AI-Assisted Review Drafts
          </h3>
          <p>
            QReview AI uses artificial intelligence solely to improve the
            readability, grammar, organization, and clarity of text submitted by
            users. Our AI reorganizes the user&apos;s own words; does not
            intentionally invent facts, opinions, or experiences; does not
            automatically publish reviews; and does not submit reviews to Google
            or any other platform.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            5. How Reviews Are Submitted
          </h3>
          <p>QReview AI does not post reviews on behalf of users. Instead:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Users write their own feedback.</li>
            <li>AI prepares an editable draft.</li>
            <li>Users may modify the draft.</li>
            <li>
              The approved draft is copied to the user&apos;s device clipboard.
            </li>
            <li>
              The user is redirected to the relevant Google Business Profile
              review page.
            </li>
            <li>
              The user independently decides whether to paste and publish the
              review.
            </li>
          </ul>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            6. Equal Treatment of Users
          </h3>
          <p>
            All users are provided the same opportunity to submit public reviews
            regardless of the rating or sentiment they provide. The availability
            of the public review option is not restricted based on whether a
            user provides positive, neutral, or negative feedback. Where users
            indicate a less satisfactory experience, they may additionally
            choose to submit optional private feedback intended to help the
            merchant improve customer service.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            7. Purpose of Processing
          </h3>
          <p>
            We process personal data to provide our Services, generate
            AI-assisted review drafts, operate merchant dashboards, improve
            customer support, process subscriptions, authenticate users,
            maintain security, detect fraud, and comply with legal obligations.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            8. Sharing Your Information
          </h3>
          <p>
            We do not sell personal data. We may share information with trusted
            service providers including cloud hosting providers (e.g. Vercel),
            authentication providers (e.g. Supabase), payment processors (e.g.
            Razorpay), and AI service providers, solely to the extent necessary
            to deliver our Services.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            9. Grievance Officer
          </h3>
          <p>
            In accordance with the DPDP Act 2023, you may contact our Grievance
            Officer regarding privacy concerns:
          </p>
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-900/60 dark:to-indigo-950/30 p-4 border border-slate-100 dark:border-slate-800 space-y-1">
            <p>
              <strong className="text-slate-900 dark:text-white">Name:</strong>{" "}
              Ramandeep Singh
            </p>
            <p>
              <strong className="text-slate-900 dark:text-white">Email:</strong>{" "}
              <a
                href="mailto:privacy@qreview.ai"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                privacy@qreview.ai
              </a>
            </p>
            <p>
              <strong className="text-slate-900 dark:text-white">
                Address:
              </strong>{" "}
              QReview AI Headquarters, India
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "terms",
      title: "Terms of Use",
      icon: FileText,
      category: "terms",
      lastUpdated: "July 22, 2026",
      badges: ["Legal", "Binding"],
      content: (
        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 border border-blue-100/50 dark:border-blue-800/50">
            <p className="font-medium text-slate-800 dark:text-slate-200">
              <FileText className="inline h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
              By using QReview AI, you agree to these Terms of Use. Please read
              them carefully.
            </p>
          </div>

          <p>
            Welcome to QReview AI. These Terms of Use (&quot;Terms&quot;) govern
            your access to and use of our website, merchant dashboard, QR-based
            customer feedback platform, AI-assisted review drafting service,
            mobile web application, and all related products and services
            (collectively, the &quot;Services&quot;). By accessing or using the
            Services, you agree to be legally bound by these Terms.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            1. Eligibility
          </h3>
          <p>
            You must be at least 18 years of age and legally capable of entering
            into a binding contract under applicable law to use this platform.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            2. Customer Review Process &amp; Equal Opportunity
          </h3>
          <p>
            QReview AI is a technology platform only. We do not own, control,
            verify, edit, endorse, or publish customer reviews. Every customer
            is presented with the same opportunity to submit a public review,
            regardless of the rating or sentiment expressed. Providing private
            feedback is voluntary and does not restrict or replace the
            customer&apos;s ability to post a public review.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            3. AI-Assisted Drafts
          </h3>
          <p>
            Our AI is intended solely to improve readability, grammar,
            organization, and clarity. The AI does not intentionally invent
            facts or create fictional experiences. Users must review every draft
            before using it, and remain solely responsible for the content they
            choose to publish.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            4. Annual Subscription &amp; Billing
          </h3>
          <p>
            QReview AI is offered on an annual prepaid subscription basis.
            Subscription fees are payable in advance and may renew
            automatically. Applicable taxes, including GST where required, will
            be charged separately.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            5. Limitation of Liability
          </h3>
          <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50 p-4">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Strengthened Liability Cap:</strong> To the maximum extent
              permitted by applicable law, the aggregate liability of QReview AI
              arising out of or relating to the Services shall not exceed the
              greater of (a) the total subscription fees actually paid by the
              customer during the twelve (12) months immediately preceding the
              claim, or (b) INR 10,000 where no subscription fees have been
              paid.
            </p>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            6. Dispute Resolution
          </h3>
          <p>
            These Terms shall be governed by and interpreted in accordance with
            the laws of India. Any dispute not resolved through negotiations
            within 30 days shall be referred to a sole arbitrator in India under
            the Arbitration and Conciliation Act, 1996.
          </p>
        </div>
      ),
    },
    {
      id: "refund",
      title: "Refund & Cancellation",
      icon: RefreshCw,
      category: "terms",
      lastUpdated: "July 22, 2026",
      badges: ["Policy", "Transparent"],
      content: (
        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="rounded-xl bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 p-4 border border-green-100/50 dark:border-green-800/50">
            <p className="font-medium text-slate-800 dark:text-slate-200">
              <RefreshCw className="inline h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
              Clear and fair refund policies for all our subscribers.
            </p>
          </div>

          <p>
            This Refund &amp; Cancellation Policy (&quot;Policy&quot;) applies
            to all subscriptions and services offered by QReview AI. By
            purchasing a subscription, you agree to this Policy.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            1. Subscription Model &amp; Activation
          </h3>
          <p>
            QReview AI is offered on an annual prepaid subscription basis. All
            subscriptions are billed for a period of twelve (12) months in
            advance and become active once payment is processed and dashboard
            access is provided.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            2. Cancellation by Customer
          </h3>
          <p>
            You may cancel your subscription renewal at any time. Cancellation
            prevents future renewals but does not immediately terminate your
            access; you will retain dashboard access until the end of your
            current annual paid subscription period.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            3. Refund Policy
          </h3>
          <div className="rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/50 p-4">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Except as required by applicable law or expressly stated in this
              Policy, subscription fees are non-refundable.
            </p>
          </div>
          <p>
            We do not provide partial refunds for early cancellation or unused
            subscription periods, nor do we issue refunds based on a
            merchant&apos;s lack of platform usage.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            4. Exceptional Refunds
          </h3>
          <p>
            Refunds may be granted at our sole discretion in exceptional
            circumstances, including duplicate payments, incorrect billing due
            to system error, or persistent technical issues that permanently
            prevent access to the services and cannot be resolved within a
            reasonable time.
          </p>
        </div>
      ),
    },
    {
      id: "cookie",
      title: "Cookie Policy",
      icon: Cookie,
      category: "privacy",
      lastUpdated: "July 22, 2026",
      badges: ["Transparent", "User Choice"],
      content: (
        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="rounded-xl bg-gradient-to-r from-yellow-50/80 to-amber-50/80 dark:from-yellow-950/30 dark:to-amber-950/30 p-4 border border-yellow-100/50 dark:border-yellow-800/50">
            <p className="font-medium text-slate-800 dark:text-slate-200">
              <Cookie className="inline h-4 w-4 mr-2 text-yellow-600 dark:text-yellow-400" />
              We use cookies to enhance your experience. You control your cookie
              preferences.
            </p>
          </div>

          <p>
            This Cookie Policy explains how QReview AI uses cookies and similar
            technologies when you visit our website, merchant dashboard, or use
            our Services. This policy should be read together with our Privacy
            Policy.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            1. What Are Cookies?
          </h3>
          <p>
            Cookies are small text files stored on your device by your web
            browser when you visit a website. They help us remember login
            sessions, secure accounts, and optimize general system speed and
            reliability.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            2. Cookies We Use
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-slate-800 dark:text-slate-200">
                Essential Cookies:
              </strong>{" "}
              Used for secure auth, session management, and login persistence
              (e.g. Supabase tokens).
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">
                Functional Cookies:
              </strong>{" "}
              Retain dark/light mode choices, selected language, or dashboard
              configuration state.
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">
                Analytics/Performance:
              </strong>{" "}
              Monitor dashboard loading speed, errors, and feature interaction
              (e.g. basic site usage parameters).
            </li>
          </ul>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            3. Cookies We Do Not Use
          </h3>
          <p>
            QReview AI does not use cookies to sell personal data or target you
            with external third-party advertisements.
          </p>
        </div>
      ),
    },
    {
      id: "acceptable",
      title: "Acceptable Use Policy",
      icon: UserCheck,
      category: "compliance",
      lastUpdated: "July 22, 2026",
      badges: ["Fair Use", "Integrity"],
      content: (
        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="rounded-xl bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-950/30 dark:to-pink-950/30 p-4 border border-purple-100/50 dark:border-purple-800/50">
            <p className="font-medium text-slate-800 dark:text-slate-200">
              <UserCheck className="inline h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
              Maintain integrity and fairness when using our platform.
            </p>
          </div>

          <p>
            This Acceptable Use Policy (&quot;Policy&quot;) forms part of the
            QReview AI Terms of Use. It defines the standards for honest and
            lawful platform utilization.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            1. Prohibited Review Practices
          </h3>
          <p>
            To preserve review integrity, merchants using QReview AI must not:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Filter or block customers based on rating (no review gating).
            </li>
            <li>
              Submit reviews on behalf of customers or post them directly using
              merchant accounts.
            </li>
            <li>
              Manipulate reviews using bots, fake profiles, or coercive
              incentives.
            </li>
            <li>
              Misuse customer personal data collected via the feedback page.
            </li>
          </ul>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            2. Security and System Fair Use
          </h3>
          <p>
            Users are prohibited from attempting to bypass authentication,
            scanning for vulnerabilities, overloading servers, scraping platform
            data, or distributing malware through the QReview AI environment.
          </p>
        </div>
      ),
    },
    {
      id: "ai-transparency",
      title: "Responsible AI",
      icon: Brain,
      category: "compliance",
      lastUpdated: "July 22, 2026",
      badges: ["Ethical AI", "Transparent"],
      content: (
        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="rounded-xl bg-gradient-to-r from-violet-50/80 to-indigo-50/80 dark:from-violet-950/30 dark:to-indigo-950/30 p-4 border border-violet-100/50 dark:border-violet-800/50">
            <p className="font-medium text-slate-800 dark:text-slate-200">
              <Brain className="inline h-4 w-4 mr-2 text-violet-600 dark:text-violet-400" />
              AI that empowers and assists, not replaces, human judgment.
            </p>
          </div>

          <p>
            At QReview AI, we believe artificial intelligence should assist
            people—not replace them. This AI Transparency &amp; Responsible AI
            Policy explains our guidelines.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            1. Assistive Focus
          </h3>
          <p>
            Our AI tool exists exclusively to refine grammar, formatting, and
            structural clarity of user-submitted notes. It does not invent
            facts, fabricate opinions, or automatically post content online.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            2. Human Review Mandate
          </h3>
          <p>
            The user is presented with a draft review based on their own words.
            The user must review, verify, and approve this draft. The user must
            copy and publish it themselves; QReview AI has no automated
            interaction with review platforms like Google.
          </p>
        </div>
      ),
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: Database,
      category: "privacy",
      lastUpdated: "July 22, 2026",
      badges: ["Compliant", "Secure"],
      content: (
        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="rounded-xl bg-gradient-to-r from-cyan-50/80 to-blue-50/80 dark:from-cyan-950/30 dark:to-blue-950/30 p-4 border border-cyan-100/50 dark:border-cyan-800/50">
            <p className="font-medium text-slate-800 dark:text-slate-200">
              <Database className="inline h-4 w-4 mr-2 text-cyan-600 dark:text-cyan-400" />
              We retain your data responsibly and delete it when no longer
              needed.
            </p>
          </div>

          <p>
            This Policy explains how QReview AI retains and deletes personal
            information processed through our Services.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            1. Retention Periods
          </h3>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-slate-700 dark:text-slate-300">
                    Data Type
                  </th>
                  <th className="px-4 py-2 text-left font-bold text-slate-700 dark:text-slate-300">
                    Standard Retention Period
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="px-4 py-2 font-semibold text-slate-800 dark:text-slate-200">
                    Merchant Accounts
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                    Active duration plus legal/tax lock periods.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-slate-800 dark:text-slate-200">
                    Customer Feedback Log
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                    Until deleted by merchant or requested by customer.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-slate-800 dark:text-slate-200">
                    AI Draft Cache
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                    Deleted immediately post-session or cached{" "}
                    <span className="underline">&lt; 24 hours</span>.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-slate-800 dark:text-slate-200">
                    Billing Details
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                    Minimum 7 years as required by Indian taxation laws.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
            2. Deletion Requests
          </h3>
          <p>
            Merchants and customers can request data purge or deletion at any
            time by contacting our support team at{" "}
            <strong className="text-slate-900 dark:text-white">
              privacy@qreview.ai
            </strong>
            . We execute these requests within the legally mandated timelines.
          </p>
        </div>
      ),
    },
  ];

  // Filter policies based on search AND category
  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch = policy.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || policy.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentPolicy =
    filteredPolicies.find((p) => p.id === activeTab) || filteredPolicies[0];
  const ActiveIcon = currentPolicy?.icon || Shield;

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "privacy":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400";
      case "terms":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400";
      case "compliance":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  // Clear category filter
  const clearCategoryFilter = () => {
    setSelectedCategory("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col">
      {/* Background decoration */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950/70 backdrop-blur-2xl px-6 py-4 transition-all duration-300">
        <div className="container mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 text-zinc-100 group cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 text-emerald-400 shadow-lg group-hover:shadow-emerald-500/20 group-hover:border-emerald-500/30 transition-all duration-300">
                <QrCode className="h-5 w-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 group-hover:to-zinc-400 transition-colors">
                QReview
              </span>
            </div>
          </Link>
          <div className="hidden items-center gap-10 md:flex">
            <Link
              href="/auth"
              className="relative inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-bold text-zinc-950 shadow-lg hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden group"
            >
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-emerald-100 to-teal-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </header>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <main className="flex-1 relative pb-24 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl flex items-center gap-3">
                <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                Legal &amp; Compliance Center
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                Our core policies are fully aligned with the Digital Personal
                Data Protection Act (DPDP Act) 2023 and Indian consumer
                regulations.
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search policies..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // If user types in search, clear category filter
                  if (e.target.value) {
                    setSelectedCategory("all");
                  }
                }}
                className="pl-10 pr-4 py-2.5 w-full md:w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
              />
            </div>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === "all" && !searchQuery
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All Policies
            </button>
            {["privacy", "terms", "compliance"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchQuery(""); // Clear search when selecting category
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                  selectedCategory === cat && !searchQuery
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
            {/* Show active filters indicator */}
            {(selectedCategory !== "all" || searchQuery) && (
              <button
                onClick={clearCategoryFilter}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-950 transition-all"
              >
                Clear Filters ✕
              </button>
            )}
          </div>

          {/* Results count */}
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
            Showing {filteredPolicies.length} of {policies.length} policies
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </motion.div>

        {filteredPolicies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto text-center py-20"
          >
            <p className="text-slate-500 dark:text-slate-400">
              No policies found matching your search.
            </p>
            <button
              onClick={clearCategoryFilter}
              className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear filters and show all policies
            </button>
          </motion.div>
        ) : (
          <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-4 md:grid-cols-3 grid-cols-1">
            {/* Navigation Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="md:col-span-1 space-y-2"
            >
              {filteredPolicies.map((policy) => {
                const Icon = policy.icon;
                const isActive = activeTab === policy.id;
                return (
                  <motion.button
                    key={policy.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(policy.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all border text-left relative group
                    ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-700 dark:from-indigo-950/40 dark:to-purple-950/40 dark:border-indigo-800/60 dark:text-indigo-400 shadow-lg shadow-indigo-500/10"
                        : "bg-white/80 border-slate-200 hover:bg-slate-50 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/80 backdrop-blur-sm"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}
                    />
                    <span className="flex-1 text-left">{policy.title}</span>
                    {policy.badges && policy.badges.length > 0 && (
                      <span className="text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                        {policy.badges[0]}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    )}
                  </motion.button>
                );
              })}

              {/* Quick Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-900/50 dark:to-indigo-950/30 border border-slate-200/50 dark:border-slate-800/50 space-y-3 backdrop-blur-sm"
              >
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  Have Questions?
                </h4>
                <div className="space-y-2">
                  <a
                    href="mailto:support@qreview.ai"
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">support@qreview.ai</span>
                  </a>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>India</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Content Viewer */}
            <motion.div
              key={currentPolicy?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-2 lg:col-span-3 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-8 shadow-2xl shadow-slate-200/20 dark:shadow-slate-800/10"
            >
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <ActiveIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {currentPolicy?.title}
                    </h2>
                    {currentPolicy?.badges && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {currentPolicy.badges.map((badge, idx) => (
                          <span
                            key={idx}
                            className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${getCategoryColor(currentPolicy?.category || "terms")}`}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                  <Calendar className="h-3.5 w-3.5" />
                  Updated: {currentPolicy?.lastUpdated}
                </span>
              </div>

              <div
                ref={contentRef}
                className="prose prose-slate dark:prose-invert max-w-none"
              >
                {currentPolicy?.content}
              </div>

              {/* Footer actions */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Award className="h-4 w-4 text-indigo-400" />
                  <span>Compliant with Indian regulations</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob(
                        [currentPolicy?.content?.toString() || ""],
                        { type: "text/plain" },
                      );
                      element.href = URL.createObjectURL(file);
                      element.download = `${currentPolicy?.title.replace(/\s+/g, "_")}.txt`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="px-4 py-2 text-xs font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30"
                  >
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
