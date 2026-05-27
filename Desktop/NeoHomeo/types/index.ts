export type UserRole = "patient" | "doctor" | "student" | "admin" | "pharmacy";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  bloodGroup?: string;
  allergies: string[];
  currentMeds: string[];
  constitution?: string;
  avatar?: string;
  phone?: string;
  city?: string;
  activeDoctorId?: string;
  currentRemedy?: string;
  currentPotency?: string;
  adherencePercent: number;
}

export interface PractitionerProfile {
  id: string;
  userId: string;
  name: string;
  title: string;
  specialties: string[];
  languages: string[];
  city: string;
  state: string;
  fee: number;
  teleconsult: boolean;
  rating: number;
  reviewCount: number;
  experience: number;
  bio: string;
  qualifications: string[];
  verified: boolean;
  avatar?: string;
  availableSlots?: TimeSlot[];
  registrationNumber?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  college?: string;
  year?: number;
  streakDays: number;
  xp: number;
  level: number;
  masteryScores: {
    materiaMedica: number;
    organon: number;
    repertory: number;
  };
  badges: string[];
  avatar?: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar?: string;
  date: string;
  time: string;
  type: "in-person" | "teleconsult";
  status: "upcoming" | "completed" | "cancelled" | "no-show";
  notes?: string;
  chiefComplaint?: string;
  fee: number;
}

export interface Remedy {
  id: string;
  name: string;
  commonName?: string;
  abbreviation: string;
  category: "mineral" | "plant" | "animal" | "nosode" | "imponderabilia";
  constitution?: string;
  keynotes: string[];
  mind: string[];
  generals: string[];
  particulars: {
    head?: string[];
    eyes?: string[];
    throat?: string[];
    stomach?: string[];
    chest?: string[];
    back?: string[];
    extremities?: string[];
    skin?: string[];
    sleep?: string[];
    fever?: string[];
  };
  modalities: {
    worse: string[];
    better: string[];
  };
  relationships: {
    complementary?: string[];
    follows?: string[];
    antidotes?: string[];
    inimical?: string[];
  };
  potencies: string[];
  source: string;
}

export interface RepertoryRubric {
  id: string;
  section: string;
  rubric: string;
  remedies: Array<{ name: string; grade: 1 | 2 | 3 }>;
}

export interface PrescriptionItem {
  remedyId: string;
  remedyName: string;
  potency: string;
  dose: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  caseId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  items: PrescriptionItem[];
  rationale?: string;
  status: "draft" | "active" | "completed" | "superseded";
  followUpDate?: string;
  aiSuggestionId?: string;
  doctorResponse?: "approved" | "modified" | "rejected";
}

export interface Case {
  id: string;
  patientId: string;
  doctorId: string;
  openedAt: string;
  status: "active" | "closed" | "follow-up";
  chiefComplaint: string;
  history: CaseEntry[];
  currentPrescription?: Prescription;
}

export interface CaseEntry {
  id: string;
  date: string;
  type: "consultation" | "follow-up" | "prescription" | "ai-assessment";
  notes: string;
  prescription?: Prescription;
  vitals?: Record<string, string>;
  remedy?: string;
  potency?: string;
}

export interface AISuggestion {
  id: string;
  caseId: string;
  patientId: string;
  doctorId?: string;
  mode: "patient" | "doctor" | "student";
  input: string;
  suggestions: RemedySuggestion[];
  caseSummary?: CaseSummary;
  status: "pending" | "approved" | "modified" | "rejected";
  createdAt: string;
  doctorFeedback?: string;
}

export interface RemedySuggestion {
  rank: 1 | 2 | 3;
  remedyName: string;
  confidence: number;
  rubrics: string[];
  rationale: string;
  potency?: string;
  materiaMedicaRef?: string;
}

export interface CaseSummary {
  chiefComplaint: string;
  modalities: { better: string[]; worse: string[] };
  mentalSymptoms: string[];
  physicalSymptoms: string[];
  constitution?: string;
  rubrics: string[];
  timestamp: string;
}

export interface RemedyDose {
  id: string;
  patientId: string;
  remedyName: string;
  potency: string;
  scheduledAt: string;
  takenAt?: string;
  status: "taken" | "missed" | "upcoming";
}

export interface SymptomEntry {
  id: string;
  patientId: string;
  date: string;
  intensity: number;
  modalities: string[];
  notes: string;
  aggravation: boolean;
  amelioration: boolean;
}

export interface Invoice {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  date: string;
}

export interface FlashCard {
  id: string;
  deckId: string;
  deck: "materia-medica" | "organon" | "repertory" | "custom";
  front: string;
  back: string;
  tags: string[];
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewDate?: string;
}

export interface QuizQuestion {
  id: string;
  type: "mcq" | "true-false" | "fill-blank";
  topic: string;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

export interface AnalyticsData {
  revenue: { date: string; amount: number }[];
  appointments: { date: string; count: number; type: string }[];
  patientRetention: number;
  topRemedies: { name: string; count: number }[];
  outcomeStats: { improved: number; stable: number; worsened: number };
  followUpAdherence: number;
}

export interface AuditEvent {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  ipAddress?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: "appointment" | "prescription" | "message" | "system" | "reminder";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}
