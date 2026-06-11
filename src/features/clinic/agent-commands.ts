export const agentCommandAliases: Record<string, string> = {
  audit_case_safety:
    "Check if this case is ready to approve and explain red flag safety risk",
  auto_triage_case: "Tell me what to do next for this case",
  compare_before_after_draft:
    "Add a clinician edit note and compare the draft with clinician review",
  detect_allergy_gap: "Check allergy status and medicine clarity",
  detect_missing_vitals: "Clean this intake and extract vitals",
  detect_pregnancy_child_chest_pain:
    "Explain why this case is risky and check pregnancy child chest pain escalation",
  generate_patient_audio_script:
    "Answer this patient question in Bangla with a read-aloud script",
  generate_pictogram_plan:
    "Simplify the patient handout for low literacy with pictogram plan",
  generate_staff_tasks:
    "Create receptionist, nurse, doctor, and follow-up desk tasks",
  prepare_referral_packet:
    "Prepare the print packet for handout, referral, medicines, and follow-up",
  predict_followup_risk: "Schedule follow-up for this patient",
  recommend_next_agent_action: "Tell me what to do next for this case",
  rewrite_for_low_literacy: "Simplify the patient handout for low literacy",
  summarize_queue_pressure: "Brief me on today's clinic queue",
  translate_bn_en: "Switch to Bangla and open presentation mode",
};

export function normalizeAgentCommand(command: string) {
  return agentCommandAliases[command] ?? command;
}
