"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@acrely/services";
import { MessageCircle, AlertTriangle, Lightbulb, HelpCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type FeedbackType = "feedback" | "bug_report" | "feature_request" | "help_request";
type FeedbackCategory = "dashboard" | "customers" | "allocations" | "payments" | "reports" | "mobile" | "general";
type FeedbackPriority = "low" | "medium" | "high" | "urgent";

export default function FeedbackPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    type: "feedback" as FeedbackType,
    category: "general" as FeedbackCategory,
    title: "",
    description: "",
    priority: "medium" as FeedbackPriority,
  });

  const feedbackTypes = [
    {
      value: "feedback",
      label: "General Feedback",
      icon: <MessageCircle className="w-5 h-5" />,
      description: "Share your thoughts and suggestions",
    },
    {
      value: "bug_report",
      label: "Bug Report",
      icon: <AlertTriangle className="w-5 h-5" />,
      description: "Report a technical issue",
    },
    {
      value: "feature_request",
      label: "Feature Request",
      icon: <Lightbulb className="w-5 h-5" />,
      description: "Suggest a new feature",
    },
    {
      value: "help_request",
      label: "Help Request",
      icon: <HelpCircle className="w-5 h-5" />,
      description: "Ask for assistance",
    },
  ];

  const categories = [
    { value: "general", label: "General" },
    { value: "dashboard", label: "Dashboard" },
    { value: "customers", label: "Customers" },
    { value: "allocations", label: "Allocations" },
    { value: "payments", label: "Payments" },
    { value: "reports", label: "Reports" },
    { value: "mobile", label: "Mobile App" },
  ];

  const priorities = [
    { value: "low", label: "Low", color: "text-gray-600" },
    { value: "medium", label: "Medium", color: "text-blue-600" },
    { value: "high", label: "High", color: "text-orange-600" },
    { value: "urgent", label: "Urgent", color: "text-red-600" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to submit feedback");
      return;
    }

    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("user_feedback").insert({
        user_id: user.id,
        type: formData.type,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: "pending",
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Feedback submitted successfully!");

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          type: "feedback",
          category: "general",
          title: "",
          description: "",
          priority: "medium",
        });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Thank You for Your Feedback!
          </h2>
          <p className="text-gray-600 mb-6">
            Your submission has been received. Our team will review it and get back to you if needed.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Submit Another
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Help & Feedback</h1>
        <p className="text-primary-100">
          We value your input! Share your feedback, report bugs, or request new features.
        </p>
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        {/* Feedback Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            What would you like to submit?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {feedbackTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value as FeedbackType })}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${
                    formData.type === type.value
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${formData.type === type.value ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-600"}
                  `}
                  >
                    {type.icon}
                  </div>
                  <span className="font-medium text-gray-900">{type.label}</span>
                </div>
                <p className="text-sm text-gray-600">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-2">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as FeedbackCategory })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-900 mb-2">
            Priority
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as FeedbackPriority })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {priorities.map((pri) => (
              <option key={pri.value} value={pri.value} className={pri.color}>
                {pri.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Brief summary of your feedback"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Please provide detailed information..."
            required
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          <p className="text-sm text-gray-500 mt-2">
            {formData.type === "bug_report" && "Include steps to reproduce the issue"}
            {formData.type === "feature_request" && "Describe the feature and how it would benefit you"}
            {formData.type === "help_request" && "Explain what you need help with"}
          </p>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Submitting as: <span className="font-medium text-gray-900">{profile?.full_name || profile?.email}</span> ({profile?.role})
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your feedback is sent directly to the system administrators</li>
              <li>• Urgent issues trigger immediate notifications</li>
              <li>• You'll receive updates on your submission status</li>
              <li>• Average response time is 24-48 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
