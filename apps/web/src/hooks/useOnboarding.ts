"use client";

import { useEffect, useState } from "react";
import { supabase } from "@acrely/services";
import { useAuth } from "@/providers/AuthProvider";

export interface OnboardingSettings {
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  show_tooltips: boolean;
  preferred_help_language: string;
}

export function useOnboarding() {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<OnboardingSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOnboardingSettings();
    }
  }, [user]);

  async function fetchOnboardingSettings() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching onboarding settings:", error);
        return;
      }

      if (!data) {
        // Create default settings
        const { data: newSettings, error: insertError } = await supabase
          .from("user_settings")
          .insert({
            user_id: user.id,
            onboarding_completed: false,
            show_tooltips: true,
            preferred_help_language: "en",
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating settings:", insertError);
          return;
        }

        setSettings(newSettings);
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error in fetchOnboardingSettings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function completeOnboarding() {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_settings")
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setSettings((prev) => ({
        ...prev!,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  }

  async function toggleTooltips(show: boolean) {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_settings")
        .update({ show_tooltips: show })
        .eq("user_id", user.id);

      if (error) throw error;

      setSettings((prev) => ({ ...prev!, show_tooltips: show }));
    } catch (error) {
      console.error("Error toggling tooltips:", error);
    }
  }

  const shouldShowOnboarding =
    !loading && settings && !settings.onboarding_completed;

  return {
    settings,
    loading,
    shouldShowOnboarding,
    completeOnboarding,
    toggleTooltips,
    userRole: profile?.role,
  };
}
