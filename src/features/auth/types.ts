import type { Id } from "../../../convex/_generated/dataModel";

export type DemoUser = {
  _id: Id<"users">;
  email: string;
  clinicName: string;
  role: "clinician" | "reception";
};
