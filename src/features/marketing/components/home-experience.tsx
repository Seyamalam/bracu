"use client";

import { AuthScreen } from "@/features/auth/components/auth-screen";
import { useDemoAuth } from "@/features/auth/use-demo-auth";
import { ClinicCopilotApp } from "@/features/clinic/components/clinic-copilot-app";
import { PublicSite } from "./public-site";

export function HomeExperience() {
  const auth = useDemoAuth();

  if (!auth.isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#12332c] text-white">
        Loading Clinic Copilot BD...
      </main>
    );
  }

  if (auth.user) {
    return <ClinicCopilotApp />;
  }

  return (
    <PublicSite
      authSlot={
        <AuthScreen onLogin={auth.login} onRegister={auth.register} compact />
      }
    />
  );
}

export function PublicPageExperience({
  page,
}: {
  page: "docs" | "features" | "login" | "mission" | "pitch";
}) {
  const auth = useDemoAuth();

  if (!auth.isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#12332c] text-white">
        Loading Clinic Copilot BD...
      </main>
    );
  }

  if (auth.user && page === "login") {
    return <ClinicCopilotApp />;
  }

  return (
    <PublicSite
      page={page}
      authSlot={
        <AuthScreen onLogin={auth.login} onRegister={auth.register} compact />
      }
    />
  );
}
