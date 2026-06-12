"use client";

import { LockKeyhole, LogIn } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/features/language/language-context";
import { BrandMark } from "@/features/marketing/components/brand-mark";
import type { DemoUser } from "../types";

export function AuthScreen({
  compact = false,
  onLogin,
  onRegister,
}: {
  compact?: boolean;
  onLogin: (input: { email: string; password: string }) => Promise<void>;
  onRegister: (input: {
    email: string;
    password: string;
    clinicName: string;
    role: DemoUser["role"];
  }) => Promise<void>;
}) {
  const { language } = useLanguage();
  const copy = authCopy[language];
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("doctor@demo.clinic");
  const [password, setPassword] = useState("demo1234");
  const [clinicName, setClinicName] = useState("Dhanmondi Care Desk");
  const [role, setRole] = useState<DemoUser["role"]>("clinician");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setIsSubmitting(true);
    setError("");
    try {
      if (mode === "register") {
        await onRegister({ email, password, clinicName, role });
      } else {
        await onLogin({ email, password });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.authFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  const content = (
    <Card className="w-full border-slate-200 bg-white/95 shadow-xl">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <BrandMark />
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#f2c14e]">
            <LockKeyhole size={21} aria-hidden="true" />
          </div>
        </div>
        <p className="mt-4 text-muted-foreground text-sm leading-6">
          {copy.helper}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
          <Button
            type="button"
            variant={mode === "register" ? "default" : "ghost"}
            onClick={() => setMode("register")}
          >
            {copy.create}
          </Button>
          <Button
            type="button"
            variant={mode === "login" ? "default" : "ghost"}
            onClick={() => setMode("login")}
          >
            {copy.signIn}
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          <Field id="auth-email" label={copy.email}>
            <Input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field id="auth-password" label={copy.password}>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          {mode === "register" ? (
            <>
              <Field id="clinic-name" label={copy.clinicName}>
                <Input
                  id="clinic-name"
                  value={clinicName}
                  onChange={(event) => setClinicName(event.target.value)}
                />
              </Field>
              <fieldset>
                <legend className="font-medium text-muted-foreground text-sm">
                  {copy.role}
                </legend>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {(["clinician", "reception"] as const).map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={role === option ? "default" : "outline"}
                      onClick={() => setRole(option)}
                    >
                      {copy.roles[option]}
                    </Button>
                  ))}
                </div>
              </fieldset>
            </>
          ) : null}
        </div>

        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}

        <Button
          className="mt-5 w-full"
          size="lg"
          type="button"
          disabled={isSubmitting}
          onClick={submit}
        >
          <LogIn size={18} aria-hidden="true" />
          {mode === "register" ? copy.createSession : copy.signIn}
        </Button>
        <p className="mt-4 text-muted-foreground text-xs leading-5">
          {copy.passwordNote}
        </p>
      </CardContent>
    </Card>
  );

  if (compact) {
    return content;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#12332c] p-4 text-slate-950">
      <div className="w-full max-w-md">{content}</div>
    </main>
  );
}

const authCopy = {
  en: {
    authFailed: "Auth failed.",
    clinicName: "Clinic name",
    create: "Create",
    createSession: "Create clinic session",
    email: "Email",
    helper:
      "Temporary demo access. Use the seeded login or create a clinic session for the demo workspace.",
    password: "Password",
    passwordNote:
      "Passwords are stored only for this temporary prototype and will be replaced with production auth later.",
    role: "Role",
    roles: {
      clinician: "clinician",
      reception: "reception",
    },
    signIn: "Sign in",
  },
  bn: {
    authFailed: "অথেন্টিকেশন ব্যর্থ হয়েছে।",
    clinicName: "ক্লিনিকের নাম",
    create: "তৈরি করুন",
    createSession: "ক্লিনিক সেশন তৈরি করুন",
    email: "ইমেইল",
    helper:
      "অস্থায়ী ডেমো অ্যাক্সেস। সিডেড লগইন ব্যবহার করুন বা ডেমো ওয়ার্কস্পেসের জন্য ক্লিনিক সেশন তৈরি করুন।",
    password: "পাসওয়ার্ড",
    passwordNote:
      "এই অস্থায়ী প্রোটোটাইপে পাসওয়ার্ড শুধু ডেমোর জন্য রাখা হয়; পরে প্রোডাকশন অথ দিয়ে বদলানো হবে।",
    role: "রোল",
    roles: {
      clinician: "ক্লিনিশিয়ান",
      reception: "রিসেপশন",
    },
    signIn: "সাইন ইন",
  },
} as const;

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
