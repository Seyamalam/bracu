"use client";

import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { DemoUser } from "./types";

const storageKey = "clinic-copilot-demo-user";
const seededDemoLogin = {
  clinicName: "Dhanmondi Care Desk",
  email: "doctor@demo.clinic",
  password: "demo1234",
  role: "clinician" as const,
};

export function useDemoAuth() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const registerMutation = useMutation(api.auth.register);
  const loginMutation = useMutation(api.auth.login);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      setUser(JSON.parse(raw) as DemoUser);
    }
    setIsReady(true);
  }, []);

  const persistUser = (nextUser: DemoUser) => {
    window.localStorage.setItem(storageKey, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  return {
    user,
    isReady,
    async register(input: {
      email: string;
      password: string;
      clinicName: string;
      role: DemoUser["role"];
    }) {
      const nextUser = await registerMutation(input);
      persistUser(nextUser as DemoUser);
    },
    async login(input: { email: string; password: string }) {
      const email = input.email.trim().toLowerCase();
      try {
        const nextUser = await loginMutation({ ...input, email });
        persistUser(nextUser as DemoUser);
      } catch (caught) {
        const isSeededLogin =
          email === seededDemoLogin.email &&
          input.password === seededDemoLogin.password;
        if (!isSeededLogin) {
          throw caught;
        }

        const nextUser = await registerMutation(seededDemoLogin);
        persistUser(nextUser as DemoUser);
      }
    },
    logout() {
      window.localStorage.removeItem(storageKey);
      setUser(null);
    },
  };
}
