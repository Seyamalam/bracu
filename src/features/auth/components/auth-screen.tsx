"use client";

import { LockKeyhole, LogIn } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DemoUser } from "../types";

export function AuthScreen({
  onLogin,
  onRegister,
}: {
  onLogin: (input: { email: string; password: string }) => Promise<void>;
  onRegister: (input: {
    email: string;
    password: string;
    clinicName: string;
    role: DemoUser["role"];
  }) => Promise<void>;
}) {
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
      setError(caught instanceof Error ? caught.message : "Auth failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#12332c] p-4 text-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-[#f2c14e]">
            <LockKeyhole size={23} aria-hidden="true" />
          </div>
          <CardTitle>Clinic Copilot BD</CardTitle>
          <CardDescription>
            Temporary email/password access for the hackathon build.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <Button
              type="button"
              variant={mode === "register" ? "default" : "ghost"}
              onClick={() => setMode("register")}
            >
              Create
            </Button>
            <Button
              type="button"
              variant={mode === "login" ? "default" : "ghost"}
              onClick={() => setMode("login")}
            >
              Sign in
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            <Field id="auth-email" label="Email">
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field id="auth-password" label="Password">
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            {mode === "register" ? (
              <>
                <Field id="clinic-name" label="Clinic name">
                  <Input
                    id="clinic-name"
                    value={clinicName}
                    onChange={(event) => setClinicName(event.target.value)}
                  />
                </Field>
                <fieldset>
                  <legend className="font-medium text-muted-foreground text-sm">
                    Role
                  </legend>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {(["clinician", "reception"] as const).map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={role === option ? "default" : "outline"}
                        onClick={() => setRole(option)}
                      >
                        {option}
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
            {mode === "register" ? "Create clinic session" : "Sign in"}
          </Button>
          <p className="mt-4 text-muted-foreground text-xs leading-5">
            Passwords are stored only for this temporary prototype and will be
            replaced with production auth later.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

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
