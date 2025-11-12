"use client";

import { useAuth } from "@/providers/AuthProvider";
import { 
  BookOpen, 
  Video, 
  MessageCircle, 
  FileText, 
  Users, 
  Building2,
  DollarSign,
  TrendingUp,
  BarChart3,
  Settings,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { HelpArticleCard } from "@/components/help/HelpArticleCard";

interface HelpSection {
  title: string;
  description: string;
  articles: HelpArticle[];
  roles?: string[];
}

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  videoUrl?: string;
  docUrl?: string;
}

export default function HelpPage() {
  const { profile } = useAuth();

  const helpSections: HelpSection[] = [
    {
      title: "Getting Started",
      description: "Learn the basics of Acrely and get up and running quickly",
      articles: [
        {
          id: "intro-dashboard",
          title: "Dashboard Overview",
          description: "Navigate your dashboard and understand key metrics",
          icon: <BarChart3 className="w-6 h-6" />,
          videoUrl: "https://www.loom.com/share/your-video-id-1",
          docUrl: "/help/dashboard-overview",
        },
        {
          id: "first-login",
          title: "First Login Guide",
          description: "Complete your profile and configure initial settings",
          icon: <Settings className="w-6 h-6" />,
          docUrl: "/help/first-login",
        },
      ],
    },
    {
      title: "Managing Clients",
      description: "Add, edit, and track customer information",
      articles: [
        {
          id: "add-customer",
          title: "Adding a New Client",
          description: "Step-by-step guide to register new customers",
          icon: <Users className="w-6 h-6" />,
          videoUrl: "https://www.loom.com/share/your-video-id-2",
          docUrl: "/help/add-customer",
        },
        {
          id: "customer-details",
          title: "Managing Client Details",
          description: "Edit customer information and view history",
          icon: <FileText className="w-6 h-6" />,
          docUrl: "/help/customer-details",
        },
      ],
    },
    {
      title: "Allocations & Payments",
      description: "Handle plot allocations and process payments",
      articles: [
        {
          id: "create-allocation",
          title: "Creating Plot Allocations",
          description: "Allocate plots to customers and set payment plans",
          icon: <Building2 className="w-6 h-6" />,
          videoUrl: "https://www.loom.com/share/your-video-id-3",
          docUrl: "/help/create-allocation",
        },
        {
          id: "record-payment",
          title: "Recording Payments",
          description: "Process payments and generate instant receipts",
          icon: <DollarSign className="w-6 h-6" />,
          videoUrl: "https://www.loom.com/share/your-video-id-4",
          docUrl: "/help/record-payment",
        },
      ],
    },
    {
      title: "Reports & Analytics",
      description: "Generate reports and view business insights",
      roles: ["CEO", "MD", "SysAdmin"],
      articles: [
        {
          id: "viewing-reports",
          title: "Viewing Reports",
          description: "Access and export business reports",
          icon: <BarChart3 className="w-6 h-6" />,
          videoUrl: "https://www.loom.com/share/your-video-id-5",
          docUrl: "/help/viewing-reports",
        },
        {
          id: "analytics-dashboard",
          title: "Analytics Dashboard",
          description: "Understand key performance indicators and trends",
          icon: <TrendingUp className="w-6 h-6" />,
          docUrl: "/help/analytics-dashboard",
        },
      ],
    },
    {
      title: "Mobile App",
      description: "Using Acrely on mobile devices",
      articles: [
        {
          id: "mobile-field-reports",
          title: "Submitting Field Reports",
          description: "Submit reports from the field using mobile app",
          icon: <FileText className="w-6 h-6" />,
          videoUrl: "https://www.loom.com/share/your-video-id-6",
          docUrl: "/help/mobile-field-reports",
        },
        {
          id: "mobile-payments",
          title: "Mobile Payment Recording",
          description: "Record payments and generate receipts on mobile",
          icon: <DollarSign className="w-6 h-6" />,
          docUrl: "/help/mobile-payments",
        },
      ],
    },
    {
      title: "Troubleshooting",
      description: "Common issues and solutions",
      articles: [
        {
          id: "login-issues",
          title: "Login Issues",
          description: "Reset password and resolve authentication problems",
          icon: <HelpCircle className="w-6 h-6" />,
          docUrl: "/help/login-issues",
        },
        {
          id: "receipt-generation",
          title: "Receipt Generation Issues",
          description: "Troubleshoot receipt generation and SMS delivery",
          icon: <FileText className="w-6 h-6" />,
          docUrl: "/help/receipt-issues",
        },
      ],
    },
  ];

  const filteredSections = helpSections.filter(
    (section) => !section.roles || section.roles.includes(profile?.role || "")
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-10 h-10" />
          <h1 className="text-3xl font-bold">Help Center</h1>
        </div>
        <p className="text-primary-100 text-lg">
          Find guides, tutorials, and answers to help you make the most of Acrely
        </p>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Video className="w-5 h-5" />
            <span className="font-medium">Video Tutorials</span>
          </Link>
          <button
            onClick={() => {
              const el = document.getElementById("feedback-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Submit Feedback</span>
          </button>
          <Link
            href="#faq"
            className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="font-medium">FAQs</span>
          </Link>
        </div>
      </div>

      {/* Help Sections */}
      {filteredSections.map((section) => (
        <div key={section.title} className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
            <p className="text-gray-600 mt-1">{section.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.articles.map((article) => (
              <HelpArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      ))}

      {/* FAQ Section */}
      <div id="faq" className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100">
              <span className="font-medium text-gray-900">
                How do I reset my password?
              </span>
              <span className="transition group-open:rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </summary>
            <p className="mt-4 px-4 text-gray-600">
              Contact your system administrator to reset your password. For security reasons, password resets must be approved by management.
            </p>
          </details>

          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100">
              <span className="font-medium text-gray-900">
                Can I access Acrely from my mobile device?
              </span>
              <span className="transition group-open:rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </summary>
            <p className="mt-4 px-4 text-gray-600">
              Yes! Download the Acrely mobile app from the Google Play Store (Android) or App Store (iOS) to access key features on the go.
            </p>
          </details>

          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100">
              <span className="font-medium text-gray-900">
                How are receipts delivered to customers?
              </span>
              <span className="transition group-open:rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </summary>
            <p className="mt-4 px-4 text-gray-600">
              Receipts are automatically generated as PDF files and sent via SMS to the customer's registered phone number. You can also download and print receipts from the payments section.
            </p>
          </details>

          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100">
              <span className="font-medium text-gray-900">
                Who can I contact for technical support?
              </span>
              <span className="transition group-open:rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </summary>
            <p className="mt-4 px-4 text-gray-600">
              Contact your SysAdmin or submit a help request through the feedback form below. For urgent issues, contact: support@pinnaclegroups.ng
            </p>
          </details>
        </div>
      </div>

      {/* Contact Support */}
      <div id="feedback-section" className="bg-primary-50 rounded-2xl border border-primary-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Still need help?
            </h3>
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for? Submit feedback or report an issue and our team will assist you.
            </p>
            <Link
              href="/dashboard/feedback"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <MessageCircle className="w-5 h-5" />
              Submit Feedback
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
