
export type VisitStatus = 'pending' | 'approved' | 'in_progress';

export interface MedicalTerm {
  text: string;
  confidence: number;
}

export interface Visit {
  id: string;
  patientName: string;
  patientAge: number;
  chiefComplaint: string;
  visitType: string;
  timestamp: string;
  status: VisitStatus;
  duration: number; // in seconds
  confidence: number;
  transcript?: string;
  soapNote?: SOAPNote;
}

export interface Diagnosis {
  diagnosis: string;
  icd10: string;
  confidence: number;
}

export interface SOAPNote {
  chiefComplaint: string;
  subjective: string;
  objective: string;
  assessment: Diagnosis[];
  plan: string;
  overallConfidence: number;
}

export type View = 'dashboard' | 'recording' | 'review';
