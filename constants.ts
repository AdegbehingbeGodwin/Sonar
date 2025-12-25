
import { Visit } from './types';

export const INITIAL_VISITS: Visit[] = [
  {
    id: "visit_001",
    patientName: "Samuel Faseun",
    patientAge: 54,
    chiefComplaint: "Chest pain follow-up",
    visitType: "Follow-up",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: "pending",
    duration: 720,
    confidence: 94
  },
  {
    id: "visit_002",
    patientName: "Asake Remilekun",
    patientAge: 32,
    chiefComplaint: "Annual physical",
    visitType: "Check-up",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    status: "approved",
    duration: 900,
    confidence: 98
  },
  {
    id: "visit_003",
    patientName: "Jide Folawe",
    patientAge: 67,
    chiefComplaint: "Type 2 Diabetes management",
    visitType: "Specialist",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "approved",
    duration: 1200,
    confidence: 92
  },
  {
    id: "visit_004",
    patientName: "Oluwaseun Ajayi",
    patientAge: 29,
    chiefComplaint: "Abdominal pain",
    visitType: "Urgent Care",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: "pending",
    duration: 600,
    confidence: 88
  }
];

// Removed mock transcript script and SOAP note as we now use MedASR for real-time transcription
