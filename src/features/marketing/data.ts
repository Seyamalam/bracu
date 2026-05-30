import {
  Activity,
  ClipboardCheck,
  FileText,
  Languages,
  MessageSquareText,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";

export const brand = {
  name: "Clinic Copilot BD",
  shortName: "Copilot BD",
  tagline: "Bangla-first clinic operations, not another generic chatbot.",
  logo: "/clinic-copilot-logo.svg",
} as const;

export const marketingImages = {
  hero: "/images/clinic-copilot-hero.png",
  product: "/images/clinic-copilot-product.png",
  teachBack: "/images/clinic-copilot-teachback.png",
} as const;

export const publicNav = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/mission", label: "Mission" },
  { href: "/pitch", label: "Pitch" },
  { href: "/login", label: "Login" },
] as const;

export const proofStats = [
  { label: "Core AI workflows", value: "18+" },
  { label: "BD demo cases", value: "6" },
  { label: "Languages", value: "BN/EN" },
] as const;

export const featurePillars = [
  {
    icon: FileText,
    title: "Intake to draft",
    body: "Turns messy Bangla, English, or mixed intake notes into clinician-reviewable summaries, SOAP support, missing questions, and red flags.",
  },
  {
    icon: ShieldCheck,
    title: "Safety guardrails",
    body: "Approval checks, medicine clarity review, risk explanations, audit trail, and visit closeout keep the AI framed as support.",
  },
  {
    icon: MessageSquareText,
    title: "Patient communication",
    body: "Creates printable handouts, follow-up messages, patient question answers, reply triage, and teach-back prompts.",
  },
  {
    icon: Activity,
    title: "Clinic operations",
    body: "Queue board, Operations Pulse, follow-up panel, trends, visit journey, and staffing focus turn the demo into a clinic cockpit.",
  },
  {
    icon: Languages,
    title: "Bangla-first care",
    body: "Built around Bangla-first workflows, low-literacy explanations, mixed-language intake, and printable family instructions.",
  },
  {
    icon: Smartphone,
    title: "Mobile desk ready",
    body: "Responsive layouts, accessibility display controls, print slips, and touch-friendly workflows for front desks and phones.",
  },
] as const;

export const missionPoints = [
  {
    title: "Mission",
    body: "Help small clinics in Bangladesh document faster, communicate clearly, and catch safety gaps without pretending AI replaces clinicians.",
  },
  {
    title: "Vision",
    body: "A practical operating layer for low-resource clinics where reception, nurses, doctors, and follow-up staff share one safer workflow.",
  },
  {
    title: "Principle",
    body: "AI drafts, staff verify, clinicians decide. Every patient-facing output is framed for review, teach-back, and follow-up ownership.",
  },
] as const;

export const pitchBeats = [
  "Small clinics lose time translating messy intake into safe clinical documentation.",
  "Clinic Copilot BD converts intake into structured workflow: draft, safety review, handout, follow-up, and closeout.",
  "The product is Bangladesh-native: Bangla-first, mobile-friendly, printable, low-literacy aware, and built for follow-up calls.",
  "The demo proves viability with seed cases, audit logs, queue operations, safety guardrails, and judge-ready progress surfaces.",
] as const;

export const workflowSteps = [
  "Reception captures the story",
  "AI structures the visit",
  "Clinician reviews safety",
  "Family receives plain instructions",
  "Staff confirms teach-back",
  "Follow-up loop is owned",
] as const;

export const audienceCards = [
  {
    icon: Users,
    title: "For clinic teams",
    body: "One workspace for reception, nurse handoff, clinician review, patient education, and follow-up ownership.",
  },
  {
    icon: ClipboardCheck,
    title: "For judges",
    body: "A complete product story: public site, auth, live AI, Convex persistence, operational dashboard, and safety framing.",
  },
] as const;
