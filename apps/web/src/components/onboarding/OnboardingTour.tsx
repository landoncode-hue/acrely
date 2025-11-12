"use client";

import { useEffect, useState } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";
import { useOnboarding } from "@/hooks/useOnboarding";

interface OnboardingTourProps {
  onComplete?: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const { shouldShowOnboarding, completeOnboarding, userRole } = useOnboarding();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    if (shouldShowOnboarding && userRole) {
      setSteps(getStepsForRole(userRole));
      // Delay to ensure DOM elements are loaded
      setTimeout(() => setRun(true), 500);
    }
  }, [shouldShowOnboarding, userRole]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      await completeOnboarding();
      onComplete?.();
    }
  };

  const getStepsForRole = (role: string): Step[] => {
    const commonSteps: Step[] = [
      {
        target: "body",
        content: (
          <div>
            <h2 className="text-xl font-bold mb-2">Welcome to Acrely! 🎉</h2>
            <p className="text-gray-700">
              Let's take a quick tour to help you get started with managing your real estate operations at Pinnacle Builders.
            </p>
          </div>
        ),
        placement: "center",
        disableBeacon: true,
      },
      {
        target: '[href="/dashboard"]',
        content: "This is your Dashboard - your command center for all activities.",
        disableBeacon: true,
      },
      {
        target: '[href="/dashboard/customers"]',
        content: "Manage all your clients here. View, add, and edit customer information.",
        disableBeacon: true,
      },
      {
        target: '[href="/dashboard/estates"]',
        content: "Browse Pinnacle Estates and available plots for allocation.",
        disableBeacon: true,
      },
      {
        target: '[href="/dashboard/allocations"]',
        content: "Track all plot allocations and monitor payment plans.",
        disableBeacon: true,
      },
      {
        target: '[href="/dashboard/payments"]',
        content: "Record and view all payment transactions. Generate receipts automatically.",
        disableBeacon: true,
      },
    ];

    // Role-specific steps
    const roleSpecificSteps: Record<string, Step[]> = {
      CEO: [
        {
          target: '[href="/dashboard/reports"]',
          content: "Access comprehensive business reports and analytics here.",
          disableBeacon: true,
        },
        {
          target: '[href="/dashboard/audit"]',
          content: "Monitor all system activities and user actions in the audit log.",
          disableBeacon: true,
        },
        {
          target: '[href="/dashboard/admin"]',
          content: "Your executive dashboard with real-time business metrics and KPIs.",
          disableBeacon: true,
        },
      ],
      MD: [
        {
          target: '[href="/dashboard/reports"]',
          content: "Access comprehensive business reports and analytics here.",
          disableBeacon: true,
        },
        {
          target: '[href="/dashboard/audit"]',
          content: "Monitor all system activities and user actions in the audit log.",
          disableBeacon: true,
        },
        {
          target: '[href="/dashboard/admin"]',
          content: "Your executive dashboard with real-time business metrics and KPIs.",
          disableBeacon: true,
        },
      ],
      SysAdmin: [
        {
          target: '[href="/dashboard/sms"]',
          content: "Manage SMS campaigns and communication with clients.",
          disableBeacon: true,
        },
        {
          target: '[href="/dashboard/reports"]',
          content: "Generate and view detailed system reports.",
          disableBeacon: true,
        },
        {
          target: '[href="/dashboard/audit"]',
          content: "Monitor all system activities and security events.",
          disableBeacon: true,
        },
        {
          target: '[href="/dashboard/settings"]',
          content: "Configure system settings and manage users.",
          disableBeacon: true,
        },
      ],
      Frontdesk: [
        {
          target: '[href="/dashboard/calls"]',
          content: "Log all customer calls and track follow-ups here.",
          disableBeacon: true,
        },
        {
          target: ".notification-bell",
          content: "Check notifications for important updates and reminders.",
          disableBeacon: true,
        },
      ],
      Agent: [
        {
          target: '[href="/dashboard/leads"]',
          content: "Manage your leads and track conversion progress.",
          disableBeacon: true,
        },
        {
          target: '[href="/dashboard/commissions"]',
          content: "View your commission earnings and claim approved commissions.",
          disableBeacon: true,
        },
        {
          target: ".notification-bell",
          content: "Stay updated on new leads and payment confirmations.",
          disableBeacon: true,
        },
      ],
    };

    const finalStep: Step = {
      target: "body",
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2">You're All Set! ✅</h2>
          <p className="text-gray-700 mb-3">
            You've completed the onboarding tour. Need help anytime?
          </p>
          <p className="text-sm text-gray-600">
            📚 Visit the <strong>Help Center</strong> from the sidebar or press <kbd>F1</kbd>
          </p>
        </div>
      ),
      placement: "center",
    };

    return [
      ...commonSteps,
      ...(roleSpecificSteps[role] || []),
      finalStep,
    ];
  };

  if (!shouldShowOnboarding || !run) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#0EA5E9",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "12px",
          padding: "16px",
        },
        buttonNext: {
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "14px",
          fontWeight: "600",
        },
        buttonBack: {
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "14px",
          marginRight: "8px",
        },
        buttonSkip: {
          color: "#64748b",
          fontSize: "14px",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip Tour",
      }}
    />
  );
}
