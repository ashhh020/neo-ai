"use client";
import { authedFetch } from "@/lib/authed-fetch";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, XCircle, Zap, Brain, Flame, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Question bank ─────────────────────────────────────────────────────────
type Difficulty = "easy" | "medium" | "hard";
type Topic = "Materia Medica" | "Organon" | "Repertory" | "Miasms" | "Philosophy";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: Difficulty;
  topic: Topic;
}

const ALL_QUESTIONS: Question[] = [
  // ── EASY ──────────────────────────────────────────────────────────────────
  { id: 1, difficulty: "easy", topic: "Materia Medica",
    question: "Arnica patients characteristically say what, even when seriously ill?",
    options: ["I want to go home", "I am fine, I need no doctor", "Please leave me alone", "I am very cold"],
    correct: 1, explanation: "Arnica's classic keynote: the patient insists they are well and refuses medical help even when clearly in distress." },
  { id: 2, difficulty: "easy", topic: "Materia Medica",
    question: "Pulsatilla is thirstless even with high fever — True or False?",
    options: ["True", "False"],
    correct: 0, explanation: "True. Thirstlessness in fever is a hallmark of Pulsatilla, contrasting with Arsenicum's intense thirst for small sips." },
  { id: 3, difficulty: "easy", topic: "Materia Medica",
    question: "Which remedy is described as 'the king of polychrests' and the 'great cleanser'?",
    options: ["Lycopodium", "Sulphur", "Calcarea Carb", "Phosphorus"],
    correct: 1, explanation: "Sulphur — the 'king of antipsoric remedies' and 'great cleanser' — is the most frequently used polychrest in classical homeopathy." },
  { id: 4, difficulty: "easy", topic: "Organon",
    question: "According to §1 of the Organon, the physician's highest calling is to:",
    options: ["Study diseases in the laboratory", "Restore the sick to health", "Prescribe medicines prophylactically", "Prevent epidemics"],
    correct: 1, explanation: "§1: 'The physician's high and only mission is to restore the sick to health, to cure.' This is the founding principle of homeopathy." },
  { id: 5, difficulty: "easy", topic: "Repertory",
    question: "In Kent's Repertory, which section appears first and is considered most important?",
    options: ["Generals", "Head", "Mind", "Particulars"],
    correct: 2, explanation: "The MIND section is the first and most important section in Kent's Repertory, covering all mental and emotional symptoms." },
  { id: 6, difficulty: "easy", topic: "Materia Medica",
    question: "Chamomilla is especially indicated in children who are better when:",
    options: ["Lying still", "In cold air", "Carried and rocked", "Eating"],
    correct: 2, explanation: "Chamomilla children are extremely irritable, hypersensitive to pain, and relieved only when constantly carried and rocked." },
  { id: 7, difficulty: "easy", topic: "Miasms",
    question: "Which miasm is called the 'mother of all chronic diseases' by Hahnemann?",
    options: ["Sycosis", "Syphilis", "Psora", "Tuberculinum"],
    correct: 2, explanation: "Hahnemann identified Psora as the fundamental miasm — the root of 7/8ths of all chronic disease, arising from suppressed itch (scabies)." },
  { id: 8, difficulty: "easy", topic: "Materia Medica",
    question: "Which remedy has the characteristic 'burning pains relieved by heat'?",
    options: ["Sulphur", "Pulsatilla", "Arsenicum Album", "Belladonna"],
    correct: 2, explanation: "Arsenicum Album's paradoxical keynote: burning pains are relieved by warmth (not cold), as the body's reaction is counterintuitive." },
  { id: 9, difficulty: "easy", topic: "Philosophy",
    question: "The Law of Similars states that a disease is cured by:",
    options: ["Opposites (contraria contrariis)", "Similar disease-producing agents (similia similibus)", "Chemical antidotes", "High doses of vitamins"],
    correct: 1, explanation: "Similia similibus curentur — 'like cures like' — is the fundamental law of homeopathy, first systematically applied by Hahnemann." },
  { id: 10, difficulty: "easy", topic: "Materia Medica",
    question: "Nux Vomica is the chief remedy for ailments from:",
    options: ["Grief and loss", "Overwork, stimulants, and sedentary life", "Suppressed eruptions", "Fright and shock"],
    correct: 1, explanation: "Nux Vomica suits the overworked, driven type: sedentary habits, stimulants (coffee, alcohol), irregular hours, mental strain." },
  { id: 31, difficulty: "easy", topic: "Materia Medica",
    question: "Which remedy is known as the 'children's remedy' with colic better from bending double?",
    options: ["Chamomilla", "Colocynthis", "Magnesia Phos", "Dioscorea"],
    correct: 1, explanation: "Colocynthis: colic better by hard pressure and bending double. The other bending-double remedy — Dioscorea — is better bending backward." },
  { id: 32, difficulty: "easy", topic: "Organon",
    question: "The vital force in Hahnemann's theory is described as:",
    options: ["The immune system", "A spirit-like dynamis that governs life", "Hormonal balance", "Nervous system activity"],
    correct: 1, explanation: "Hahnemann described the vital force as a spirit-like dynamis that animates the material body and maintains health and harmony." },
  { id: 33, difficulty: "easy", topic: "Materia Medica",
    question: "Belladonna is characteristically associated with which type of fever?",
    options: ["Slow onset, with chills", "Sudden onset, with burning heat, red face, delirium", "Gradual fever with thirst for cold water", "Fever with profuse sweating"],
    correct: 1, explanation: "Belladonna: sudden, violent onset — burning heat, bright red flushed face, dilated pupils, delirium. The classic 'three reds' remedy." },

  // ── MEDIUM ────────────────────────────────────────────────────────────────
  { id: 11, difficulty: "medium", topic: "Materia Medica",
    question: "A patient worsens after sleep and cannot tolerate anything tight around the neck. Consider:",
    options: ["Natrum Mur", "Lycopodium", "Lachesis", "Sulphur"],
    correct: 2, explanation: "Lachesis: aggravation after sleep ('sleeps into aggravation') and intense aversion to tight clothing around throat or abdomen — classic snake remedy keynotes." },
  { id: 12, difficulty: "medium", topic: "Miasms",
    question: "Which miasm is associated with destructiveness, ulceration, and nihilistic mental states?",
    options: ["Psora", "Sycosis", "Syphilis", "Tuberculinum"],
    correct: 2, explanation: "The Syphilitic miasm is the miasm of destruction — ulcers, bone destruction, degeneration, and mental states involving nihilism and suicidal ideation." },
  { id: 13, difficulty: "medium", topic: "Repertory",
    question: "In Kent's Repertory grading, what does a remedy in plain type (grade 1) signify?",
    options: ["Confirmed in clinical practice only", "Mentioned in one or two provings", "Most strongly indicated remedy", "Contraindicated remedy"],
    correct: 1, explanation: "Grade 1 (plain): mentioned in provings but with limited clinical confirmation. Grade 2 (italic): well-proven. Grade 3 (bold): most reliable and confirmed." },
  { id: 14, difficulty: "medium", topic: "Organon",
    question: "§7 of the Organon establishes that the basis of prescribing must be:",
    options: ["Pathological diagnosis", "Totality of symptoms", "Laboratory findings", "Single characteristic symptom"],
    correct: 1, explanation: "§7: The totality of symptoms — the outer image of the inner disease — is the only guide to remedy selection. It is the cornerstone of Hahnemannian prescribing." },
  { id: 15, difficulty: "medium", topic: "Materia Medica",
    question: "Child: one cheek red and hot, one pale and cold; extreme irritability; screams with pain. Remedy?",
    options: ["Belladonna", "Pulsatilla", "Chamomilla", "Calcarea Carb"],
    correct: 2, explanation: "Chamomilla: the classic presentation — asymmetric facial redness, hypersensitivity to pain, extreme irritability. The child is better only when carried." },
  { id: 16, difficulty: "medium", topic: "Materia Medica",
    question: "Lycopodium is characteristically worse at:",
    options: ["4–8 pm", "2–4 am", "9–11 am", "Midnight"],
    correct: 0, explanation: "Lycopodium's classical aggravation time is 4–8 pm. This time modality is one of the most reliable keynotes for this remedy." },
  { id: 17, difficulty: "medium", topic: "Philosophy",
    question: "Hahnemann's concept of 'dynamization' or 'potentization' means:",
    options: ["Increasing the dose", "Reducing chemical toxicity by dilution only", "Liberating the medicinal power through serial dilution and succussion", "Mixing multiple medicines"],
    correct: 2, explanation: "Potentization is the process of serial dilution combined with vigorous succussion (shaking), which Hahnemann believed liberated and intensified the spirit-like medicinal energy." },
  { id: 18, difficulty: "medium", topic: "Organon",
    question: "The 'totality of symptoms' in Hahnemann's sense primarily means:",
    options: ["All pathological changes in the body", "The sum of all characteristic, peculiar, and individualizing symptoms", "Common symptoms of the disease", "The chief complaint only"],
    correct: 1, explanation: "Hahnemann emphasized that common symptoms are diagnostically useful but useless for remedy selection. Only characteristic, peculiar, and individualizing symptoms guide the simillimum." },
  { id: 19, difficulty: "medium", topic: "Materia Medica",
    question: "Natrum Muriaticum's emotional core is best described as:",
    options: ["Fearfulness and anxiety", "Grief that cannot be consoled, worse from consolation", "Anger with violent impulses", "Hysteria and changeability"],
    correct: 1, explanation: "Natrum Mur's key mental state: deep, long-held grief, worse from consolation (they withdraw further). Cannot weep in company; weeps alone." },
  { id: 20, difficulty: "medium", topic: "Repertory",
    question: "In case analysis, Kent emphasized starting repertorization with:",
    options: ["Physical generals first", "Complete symptoms (location + sensation + modality + concomitant)", "Chief complaint pathology", "Causative factors only"],
    correct: 1, explanation: "A complete symptom has 4 components: Location, Sensation, Modality, and Concomitant. These carry the most weight in repertorization as they are the most individualizing." },
  { id: 34, difficulty: "medium", topic: "Miasms",
    question: "Which nosode is the main representative of the Sycotic miasm?",
    options: ["Psorinum", "Medorrhinum", "Syphilinum", "Tuberculinum"],
    correct: 1, explanation: "Medorrhinum is the chief nosode of the Sycotic miasm, derived from gonorrheal discharge. It covers the overgrowth, excess, and wart characteristics of sycosis." },
  { id: 35, difficulty: "medium", topic: "Materia Medica",
    question: "Sepia's core emotional theme that differentiates it from Natrum Mur is:",
    options: ["Silent grief with consolation aggravation", "Indifference to loved ones, aversion to family, bearing-down sensation", "Anxiety about health", "Weeping from music"],
    correct: 1, explanation: "Sepia: indifference to loved ones (especially her own children), aversion to sympathy, involuntary bearing-down sensation, and improvement from vigorous exercise." },
  { id: 36, difficulty: "medium", topic: "Philosophy",
    question: "The 'single remedy' principle means:",
    options: ["Only one remedy should be given per day", "Only one remedy is indicated by the totality at any given time", "Never repeat a remedy", "Give one remedy per organ"],
    correct: 1, explanation: "The law of simillimum: only one remedy can be most similar to the complete picture at any given time. Giving two remedies creates complexity and muddies the case." },

  // ── HARD ──────────────────────────────────────────────────────────────────
  { id: 21, difficulty: "hard", topic: "Organon",
    question: "§63 of the Organon describes the concept of primary and secondary action. The secondary action is produced by:",
    options: ["The medicine's direct action on tissues", "The vital force as a counter-reaction to the primary medicinal disease", "A second medicine given subsequently", "The patient's pathological state"],
    correct: 1, explanation: "§63-65: Primary action is from the medicine; secondary action (reaction) is the vital force's counter-reaction — always opposite in nature to restore equilibrium. This explains palliation vs. cure." },
  { id: 22, difficulty: "hard", topic: "Miasms",
    question: "Sycosis as a miasm manifests most typically with:",
    options: ["Ulcerative and destructive pathology", "Deficiency, suppression, and functional disturbance", "Overgrowth, excess, and warts/condylomata", "Episodic acute crisis"],
    correct: 2, explanation: "Sycosis = the miasm of excess. Characterized by warts, condylomata, cysts, tumors, overgrowths, and functional excess. Linked to Thuja, Medorrhinum, Nitric Acid." },
  { id: 23, difficulty: "hard", topic: "Philosophy",
    question: "Hering's Law of Cure states that cure proceeds:",
    options: ["From pathology to symptom suppression", "From within outward, from above downward, in reverse order of appearance", "From the least vital organ to the most vital", "From physical to mental symptoms"],
    correct: 1, explanation: "Hering's Law: cure moves from within outward (deeper to superficial), from above downward (head to extremities), and in reverse chronological order (most recent symptoms disappear last)." },
  { id: 24, difficulty: "hard", topic: "Materia Medica",
    question: "Sulphur, Calcarea Carb, and Lycopodium are described by Kent as forming:",
    options: ["The antipsoric trio", "The complementary triad in reverse order of action", "The first triad of polychrests to consider", "The mineral remedies"],
    correct: 1, explanation: "Kent describes these three as complementary in sequence (Sulphur → Calcarea → Lycopodium) and reverse order — they follow each other well because they complete each other's sphere of action." },
  { id: 25, difficulty: "hard", topic: "Organon",
    question: "§246 of the Organon (6th Ed.) introduces the concept of the LM (50-millesimal) potency. Its main advantage is:",
    options: ["It acts faster", "It can be repeated frequently without aggravation due to minimal dose principle", "It is stronger than centesimals", "It cures miasms faster"],
    correct: 1, explanation: "LM potencies (1/50,000 dilution) allow frequent repetition without aggravation — a major advantage over centesimals. Hahnemann introduced this in his final years as the 'most perfect' method." },
  { id: 26, difficulty: "hard", topic: "Repertory",
    question: "In Kent's Repertory, 'MIND > Delusions' is the section used for symptoms that are:",
    options: ["Imagined by the physician during case-taking", "Fixed false beliefs with or without insight in the patient", "Hallucinations from drug provings only", "Symptoms that change from day to day"],
    correct: 1, explanation: "The Delusions section covers fixed false beliefs — the patient is certain of things that are not objectively true. These are among the most valuable prescribing symptoms as they are highly individualizing." },
  { id: 27, difficulty: "hard", topic: "Materia Medica",
    question: "Phosphorus has a peculiar appetite symptom that is pathognomonic. What is it?",
    options: ["Craving for sweets at midnight", "Intense hunger immediately after eating", "Desire for cold food and drinks, which causes vomiting when warm in stomach", "Aversion to all food except salt"],
    correct: 2, explanation: "Phosphorus: desires cold food/drinks; the cold drink relieves temporarily but is vomited as soon as it becomes warm in the stomach. This gastric keynote is highly characteristic." },
  { id: 28, difficulty: "hard", topic: "Philosophy",
    question: "The concept of 'susceptibility' in homeopathy refers to:",
    options: ["The patient's sensitivity to side effects of medicines", "The organism's inherent capacity to be acted upon by a similar disease or medicine", "Genetic predisposition to certain diseases", "The potency required to produce a response"],
    correct: 1, explanation: "Susceptibility is the organism's innate responsiveness to disease-producing agents. Hahnemann taught that only a susceptible individual can be affected by a particular miasm or simillimum." },
  { id: 29, difficulty: "hard", topic: "Organon",
    question: "§153 of the Organon instructs the prescriber to give most weight to which symptoms in case analysis?",
    options: ["Common symptoms of the diagnosed disease", "The characteristic, uncommon, striking, and peculiar symptoms", "The most severe and disabling symptoms", "Symptoms with clear pathological correlation"],
    correct: 1, explanation: "§153 is the cornerstone of Hahnemannian case analysis: 'the more striking, singular, uncommon and peculiar (characteristic) signs and symptoms of the case are chiefly and most solely to be kept in view.'" },
  { id: 30, difficulty: "hard", topic: "Materia Medica",
    question: "Medorrhinum's characteristic time modality that distinguishes it from most remedies is:",
    options: ["Worse 4–8 pm", "Worse at sunrise", "Better at seaside; worse inland", "All symptoms better in daytime, worse at night"],
    correct: 2, explanation: "Medorrhinum: better at the seashore, worse away from the sea. Also: all symptoms worse by day, better at night (reverse of most remedies). Knee-chest position ameliorates." },
  { id: 37, difficulty: "hard", topic: "Organon",
    question: "According to §274–§275 (Organon 6th Ed.), the minimum dose principle states:",
    options: ["Give the smallest potency first", "Give just enough medicine to cause the smallest possible excitation in the vital force", "Repeat doses only monthly", "Never use above 30C"],
    correct: 1, explanation: "§274: The dose should be just sufficient to produce the gentlest possible excitation to alter the dynamis and initiate cure — the minimum dose that will act without over-stimulating the vital force." },
  { id: 38, difficulty: "hard", topic: "Materia Medica",
    question: "Nux Vomica and Sulphur are related as:",
    options: ["Inimical remedies", "Sulphur follows Nux well in the same case — they are frequently complementary", "They should never be used in the same patient", "They are isopathic to each other"],
    correct: 1, explanation: "The classic Nux→Sulphur sequence: Nux Vomica clears the 'drug miasm' and improves receptivity; Sulphur then follows to work on the deeper psoric layer. Both are antipsoric remedies." },
  { id: 39, difficulty: "hard", topic: "Philosophy",
    question: "The concept of 'miasmatic block' in practice means:",
    options: ["The patient refuses medicine", "A deep-seated miasmatic layer prevents the well-chosen remedy from acting", "The wrong potency was used", "The patient developed proving symptoms"],
    correct: 1, explanation: "When an apparently well-chosen remedy fails to hold or produce lasting improvement, a deeper miasmatic layer (usually Psora or Sycosis) may be blocking action. A nosode (Psorinum, Medorrhinum) is then interpolated." },

  // ── EASY (continued) ─────────────────────────────────────────────────────
  { id: 40, difficulty: "easy", topic: "Materia Medica",
    question: "Ignatia is the premier remedy for:",
    options: ["Rheumatic complaints", "Acute grief and emotional shock", "Suppressed skin eruptions", "Digestive torpor"],
    correct: 1, explanation: "Ignatia: the acute grief remedy — sighing, silent grief, contradictory symptoms. Derived from Saint Ignatius bean (Strychnos ignatii), closely related to Natrum Mur for chronic grief." },
  { id: 41, difficulty: "easy", topic: "Organon",
    question: "The Organon of Medicine was written by:",
    options: ["James Tyler Kent", "Constantine Hering", "Samuel Hahnemann", "William Boericke"],
    correct: 2, explanation: "Samuel Hahnemann (1755–1843) wrote the Organon of Medicine, first published in 1810. The 6th and final edition was completed in 1842 but published posthumously in 1921." },
  { id: 42, difficulty: "easy", topic: "Materia Medica",
    question: "Which remedy is called the 'vegetable sulphur' and is known for its action on mucous membranes?",
    options: ["Thuja", "Calcarea Carb", "Lycopodium", "Causticum"],
    correct: 0, explanation: "Thuja occidentalis — the 'vegetable sulphur' — is the chief sycotic remedy, especially for warts, condylomata, and ill-effects of vaccination. It has strong action on mucous membranes and skin." },
  { id: 43, difficulty: "easy", topic: "Philosophy",
    question: "The homeopathic doctrine states that disease is primarily:",
    options: ["A structural alteration of organs", "A dynamic derangement of the vital force", "A genetic defect", "A biochemical imbalance"],
    correct: 1, explanation: "Hahnemann taught that disease is not in matter but in the spirit-like vital force — a dynamic derangement first, before any structural change occurs. Symptoms are the language of this derangement." },
  { id: 44, difficulty: "easy", topic: "Repertory",
    question: "What does the abbreviation 'Sep' stand for in Kent's Repertory?",
    options: ["Septicinum", "Sepia officinalis", "Selenium phosphoricum", "Septicum"],
    correct: 1, explanation: "Sep = Sepia officinalis (cuttlefish ink). Abbreviations in Kent's Repertory follow Latin names; knowing the common remedies' abbreviations is essential for rapid repertory work." },
  { id: 45, difficulty: "easy", topic: "Miasms",
    question: "The Tubercular miasm is associated with which family history?",
    options: ["Cancer and malignancies", "Tuberculosis, respiratory diseases, and wandering symptoms", "Venereal diseases", "Skin diseases and itch"],
    correct: 1, explanation: "The Tubercular (Pseudo-psoric) miasm: history of TB, chest conditions, constant changeability of symptoms, desire to travel, emaciation despite eating, lymph node involvement." },
  { id: 46, difficulty: "easy", topic: "Materia Medica",
    question: "Rhus Tox is characteristically better from:",
    options: ["Rest", "Cold applications", "Continued motion after initial stiffness", "Lying still"],
    correct: 2, explanation: "Rhus Tox: the 'rusty gate' remedy. Initial movement is painful (stiff, creaking) but continued motion ameliorates. First motion aggravates; keeping moving relieves. Better from warm applications." },
  { id: 47, difficulty: "easy", topic: "Organon",
    question: "According to Hahnemann, the highest purpose of medicine is:",
    options: ["Disease prevention", "Restoring health rapidly, gently, and permanently", "Pain relief", "Longevity"],
    correct: 1, explanation: "§2: The ideal of cure is rapid, gentle, and permanent restoration of health, removing the whole disease in the shortest, most reliable, and least harmful way, on easily comprehensible principles." },
  { id: 48, difficulty: "easy", topic: "Materia Medica",
    question: "Which remedy has the characteristic symptom: 'desires company but cannot bear consolation'?",
    options: ["Pulsatilla", "Sepia", "Natrum Muriaticum", "Arsenicum Album"],
    correct: 2, explanation: "Natrum Mur: the patient is worse from consolation (retreats further into grief when sympathy is offered). Unlike Pulsatilla who desires consolation, or Arsenicum who desires company from anxiety." },
  { id: 49, difficulty: "easy", topic: "Materia Medica",
    question: "Aconitum is best suited for conditions that come on suddenly after:",
    options: ["Prolonged grief", "Exposure to dry cold wind or fright", "Overheating", "Overeating"],
    correct: 1, explanation: "Aconite: sudden onset after cold dry wind or intense fright/shock. Intense anxiety, restlessness, fear of death. Excellent for the first 24 hours of acute illness — not for chronic or advanced conditions." },
  { id: 50, difficulty: "easy", topic: "Philosophy",
    question: "Potency selection in homeopathy primarily depends on:",
    options: ["The patient's age", "The patient's sensitivity, vitality, and disease type", "The remedy's price", "Whether the patient has used homeopathy before"],
    correct: 1, explanation: "Potency is chosen based on: susceptibility/sensitivity of the patient, vitality, nature of disease (acute vs. chronic), and whether we want to avoid aggravation. Higher potency = more dynamic action." },

  // ── MEDIUM (continued) ────────────────────────────────────────────────────
  { id: 51, difficulty: "medium", topic: "Materia Medica",
    question: "Arsenicum Album patient's anxiety is characteristically:",
    options: ["About financial matters", "About health, fear of death, worse midnight to 2 am", "About relationships", "About failure and career"],
    correct: 1, explanation: "Arsenicum: intense health anxiety, hypochondriacal, restlessness driving from place to place, worse midnight to 2 am, fear of being alone (calls doctors). Classic triad: anguish, restlessness, prostration." },
  { id: 52, difficulty: "medium", topic: "Organon",
    question: "The 'unprejudiced observer' (§6) means the homeopath should:",
    options: ["Have no medical training", "Record symptoms without imposing theoretical frameworks", "Ignore the patient's subjective complaints", "Only rely on lab findings"],
    correct: 1, explanation: "§6: The physician must be an unprejudiced observer — recording what the patient expresses without letting pathological theories color or filter the symptom picture. This objectivity is foundational to case-taking." },
  { id: 53, difficulty: "medium", topic: "Repertory",
    question: "In case analysis, 'Generals' rubrics (from the Generals chapter) are preferred because:",
    options: ["They are alphabetically convenient", "They represent the whole patient's reaction, not a local symptom", "They have more remedies listed", "They are easier to find"],
    correct: 1, explanation: "Generals represent the entire patient — 'I am worse in heat' vs. 'my headache is worse in heat'. Total-patient generals are more characteristic and individualizing than local symptoms." },
  { id: 54, difficulty: "medium", topic: "Materia Medica",
    question: "Pulsatilla's remedy relationship: it follows well after:",
    options: ["Sulphur", "Calcarea Carb", "Nux Vomica", "Arsenicum"],
    correct: 0, explanation: "Pulsatilla follows Sulphur well in many cases (Sulphur → Pulsatilla is a classic sequence). They are complementary — Sulphur reaches the psoric base; Pulsatilla mops up the reactive manifestations." },
  { id: 55, difficulty: "medium", topic: "Miasms",
    question: "Which miasm manifests in the 'DEFICIENCY' model — lack, suppression, functional underactivity?",
    options: ["Sycosis", "Syphilis", "Psora", "Tuberculinum"],
    correct: 2, explanation: "Psora is the miasm of deficiency and suppression: skin diseases driven inward, functional weakness, unfinished reactions, chronic itch without eruption. 7/8ths of chronic disease is psoric in origin." },
  { id: 56, difficulty: "medium", topic: "Materia Medica",
    question: "Causticum is especially indicated in complaints that arise from:",
    options: ["Grief and loss", "Long-lasting grief, burns, or loss of vital fluids", "Cold damp weather only", "Suppressed anger"],
    correct: 1, explanation: "Causticum: ill-effects of burns (especially chronic), raw soreness, long-sustained grief, over-sympathy for others' suffering. Keynote: 'things go wrong' — paralysis, ptosis, enuresis, hoarseness." },
  { id: 57, difficulty: "medium", topic: "Organon",
    question: "Hahnemann distinguished between 'similar' and 'same' disease. Two diseases can cure each other when they are:",
    options: ["Of the same etiology", "Similar in symptom picture (§43-§46)", "Equally intense", "From the same kingdom"],
    correct: 1, explanation: "§43-46: A similar artificial disease (from the remedy) can cure the natural disease because the vital force cannot sustain two similar diseases at once — the stronger (artificial) displaces the weaker (natural)." },
  { id: 58, difficulty: "medium", topic: "Materia Medica",
    question: "Which remedy is indicated for 'chilly, hurried, fussy perfectionists' with craving for sweets?",
    options: ["Arsenicum Album", "Nux Vomica", "Lycopodium", "Argentum Nitricum"],
    correct: 3, explanation: "Argentum Nitricum: anticipatory anxiety, hurried, impulsive, fearful of heights and crowd. Chilly despite heat aggravation. Craving sugar that aggravates diarrhea. Apprehension before events." },
  { id: 59, difficulty: "medium", topic: "Repertory",
    question: "The rubric 'MIND: Consolation, aggravation' in Kent's Repertory contains:",
    options: ["Pulsatilla (3), Arsenicum (3)", "Nat-m (3), Ignatia (3), Sepia (2)", "Sulphur (3), Nux Vomica (3)", "Phosphorus (3), Lachesis (3)"],
    correct: 1, explanation: "Consolation aggravates: Nat-m (3), Ign (3), Sep (2), Lil-t (2), Nit-ac (2). These patients withdraw or become more distressed when sympathy is offered. Contrast: Puls and Phos desire consolation." },
  { id: 60, difficulty: "medium", topic: "Philosophy",
    question: "The 'Law of Infinitesimals' in homeopathy refers to:",
    options: ["Using very frequent doses", "The principle that extreme dilutions retain and even enhance medicinal power", "Giving medicines one at a time", "Treating the smallest symptom first"],
    correct: 1, explanation: "The law of infinitesimals: as dilution increases (with proper succussion), medicinal power increases rather than decreasing. This is the scientific paradox of homeopathy — the minimum effective dose is the infinitesimal." },
  { id: 61, difficulty: "medium", topic: "Materia Medica",
    question: "Calcarea Carb's physical constitution is best described as:",
    options: ["Thin, emaciated, dark complexion", "Fair, fat, flabby; head sweats, cold and damp extremities", "Lean, intellectual, nervous", "Tall, slender, hemorrhagic tendency"],
    correct: 1, explanation: "Calcarea Carb: the classic 'fat, fair, flabby' constitution. Head sweats profusely on pillow. Cold, clammy hands. Sourness of perspiration, stool, vomit. Slow, methodical, stubborn child." },
  { id: 62, difficulty: "medium", topic: "Organon",
    question: "According to §9, the vital force in health:",
    options: ["Is controlled by the nervous system", "Animates the body and keeps all parts in harmonious operation", "Is identical to metabolism", "Resides in the brain"],
    correct: 1, explanation: "§9: The spirit-like vital force (dynamis) that animates the material organism reigns in supreme sovereignty, keeping all parts in harmonious, vital operation so that our mind can freely employ itself for the higher purposes of existence." },
  { id: 63, difficulty: "medium", topic: "Miasms",
    question: "The inter-current use of Psorinum is indicated when:",
    options: ["The patient is improving well", "The well-chosen remedy acts but improvement is not sustained (psoric block)", "The patient has gonorrheal history", "The case shows syphilitic pathology"],
    correct: 1, explanation: "Psorinum intercurrent: when a carefully selected remedy gives partial or temporary improvement that doesn't hold, a psoric miasm is blocking. Psorinum as intercurrent clears the block and allows the simillimum to complete its work." },
  { id: 64, difficulty: "medium", topic: "Materia Medica",
    question: "Silicea (Silica) is known for its action on what tissue?",
    options: ["Mucous membranes", "Bones, nails, connective tissue; suppurations and foreign bodies", "Liver and gallbladder", "Kidneys"],
    correct: 1, explanation: "Silicea: pushes out foreign bodies, ripens abscesses, works on connective tissue, nails, bones, glands. The 'cleanser and eliminator'. Also: lack of self-confidence, yielding, fixed ideas." },

  // ── HARD (continued) ──────────────────────────────────────────────────────
  { id: 65, difficulty: "hard", topic: "Organon",
    question: "§19 and §22 together establish that curative medicines must:",
    options: ["Suppress the disease-producing cause", "Possess the power to alter health and produce symptoms similar to the disease", "Strengthen the immune system directly", "Neutralize the miasm chemically"],
    correct: 1, explanation: "§19: Medicines cure only by their power to alter health states. §22: The only suitable therapeutic approach is the homeopathic — the medicine must be capable of producing in healthy subjects symptoms similar to those it is meant to cure." },
  { id: 66, difficulty: "hard", topic: "Materia Medica",
    question: "The Lachesis-Lycopodium differential: both have bloating after eating. They differ in that Lachesis is:",
    options: ["Better from eating", "Left-sided with aggravation after sleep; Lycopodium is right-sided worse 4–8 pm", "Right-sided and better from warmth", "Worse from cold and better from heat"],
    correct: 1, explanation: "Lachesis: predominantly left-sided, worse after sleep ('sleeps into aggravation'), worse from tight clothing. Lycopodium: right-sided or right-to-left progression, worse 4–8 pm, worse from cold, better from warm drinks." },
  { id: 67, difficulty: "hard", topic: "Philosophy",
    question: "The concept of 'direction of cure' in second prescription — when old symptoms return during treatment — indicates:",
    options: ["The wrong remedy was given", "A curative response — symptoms returning in reverse chronological order (Hering's law)", "An aggravation requiring antidoting", "A new disease layer"],
    correct: 1, explanation: "Return of old symptoms in reverse order of appearance during treatment is a good prognostic sign per Hering's Law. It means the vital force is retracing pathology, unwinding the disease from the most recent inward to the original outward manifestation." },
  { id: 68, difficulty: "hard", topic: "Repertory",
    question: "Repertory rubric 'GENERALS: Food and drinks; cold; drinks, cold, desires' has which remedy in highest grade?",
    options: ["Arsenicum (3)", "Phosphorus (3)", "Rhus Tox (3)", "Pulsatilla (3)"],
    correct: 1, explanation: "Phosphorus is grade 3 for craving cold drinks (which are vomited as soon as warm in stomach). This is one of Phosphorus's most characteristic food symptoms — cold food and drink desired, warm drinks aggravate." },
  { id: 69, difficulty: "hard", topic: "Miasms",
    question: "According to J.H. Allen, the Pseudo-psoric (Tubercular) miasm combines:",
    options: ["Sycosis and Syphilis", "Psora and Syphilis", "Psora and Sycosis", "All three miasms"],
    correct: 1, explanation: "Allen's 'Chronic Miasms': the Tubercular (Pseudo-psoric) miasm is a combination of Psora (the deficiency layer) and Syphilis (the destructive layer), accounting for the destructive lung pathology combined with deficiency." },
  { id: 70, difficulty: "hard", topic: "Materia Medica",
    question: "Natrum Mur's peculiar physical characteristic that confirms the remedy is:",
    options: ["Oily skin", "Mapped tongue with white coating at edges", "Cracks at corners of mouth, herpes labialis, emaciation with good appetite", "Profuse night sweats"],
    correct: 2, explanation: "Natrum Mur: cracks at corners of mouth (commissural herpes), greasy skin (but chapped lips), emaciation greatest in the neck, great appetite but emaciates. The mapped (geographic) tongue is more Natrum Carb." },
  { id: 71, difficulty: "hard", topic: "Organon",
    question: "§210–§230 of the Organon discuss the treatment of mental diseases. Hahnemann's key insight was:",
    options: ["Mental diseases should be treated with psychotherapy first", "Mental symptoms are part of the totality and treated with homeopathic medicines", "Mental diseases are incurable", "Sedatives should be used alongside remedies"],
    correct: 1, explanation: "§210-230: Mental diseases are one-sided diseases where mental symptoms predominate. They are treated with the same method — simillimum based on totality (especially the mental-emotional picture) — not with asylum methods or opposite treatment." },
  { id: 72, difficulty: "hard", topic: "Materia Medica",
    question: "The Kent trio Sulphur-Calcarea-Lycopodium is used in sequence. Which goes first, and why?",
    options: ["Lycopodium first — deepest acting", "Sulphur first — clears the psoric base and opens the case", "Calcarea first — broadest constitutional", "All three simultaneously"],
    correct: 1, explanation: "Sulphur is given first to stir up and reveal the case (it is the great 'reagent' of the psoric miasm). Calcarea follows to consolidate and build. Lycopodium completes the cycle, acting on deeper functional and hepatic layers." },
  { id: 73, difficulty: "hard", topic: "Repertory",
    question: "The completeness of a symptom for repertorization requires 4 components. Which set is correct?",
    options: ["Location, pathology, diagnosis, duration", "Location, sensation, modality, concomitant", "Chief complaint, onset, duration, severity", "Cause, organ, laterality, intensity"],
    correct: 1, explanation: "A complete symptom (Kent): Location (where) + Sensation (what it feels like) + Modality (what makes it better/worse) + Concomitant (what accompanies it). The more complete the symptom, the more specific the rubric and the more reliable the prescription." },
  { id: 74, difficulty: "hard", topic: "Philosophy",
    question: "Kent's doctrine of 'vital force' differs from Hahnemann's in which key respect?",
    options: ["Kent believed the vital force was physical", "Kent gave the vital force a more explicitly spiritual/Swedenborgian character", "Kent denied the vital force concept", "Kent equated vital force with electricity"],
    correct: 1, explanation: "Kent (influenced by Swedenborg) gave the vital force an explicitly spiritual, God-given character — a 'simple substance' between body and soul. Hahnemann's vital force was more of a functional/energetic principle. Both were dynamic rather than material." },
  { id: 75, difficulty: "hard", topic: "Organon",
    question: "§228 instructs that in one-sided mental diseases, after the non-medicinal moral treatment, the simillimum is chosen from:",
    options: ["The pathological diagnosis alone", "Physical symptoms combined with what can be gathered of the mental symptoms", "The patient's family history", "A fixed list of mental remedies"],
    correct: 1, explanation: "§228: In one-sided mental diseases where mental symptoms dominate, the physician assembles the totality from physical generals, physical concomitants, and whatever mental/emotional picture emerges — never from diagnosis alone." },
  { id: 76, difficulty: "hard", topic: "Materia Medica",
    question: "Sepia, Pulsatilla, and Natrum Mur are often called the 'female triad.' Their chief differentiating keynote is:",
    options: ["All three are hot remedies", "Consolation: Puls desires it, Nat-m worsens from it, Sepia is indifferent to it", "All three crave salt", "All three are better in open air"],
    correct: 1, explanation: "The consolation differential is classic: Pulsatilla = desires and is better from consolation; Natrum Mur = worse from consolation (withdraws); Sepia = indifferent (doesn't want it, not particularly worse). All weep but from different causes." },
  { id: 77, difficulty: "hard", topic: "Miasms",
    question: "The 'oscillation theory' of miasms holds that:",
    options: ["Miasms change between patients", "The same patient can oscillate between psoric and sycotic expressions over time", "All miasms are inherited equally", "Miasms are activated only by suppression"],
    correct: 1, explanation: "Clinical miasmatic theory: the same patient may show predominantly psoric features (dry, itching, functional) at one time and sycotic features (excess, warts, growth) at another, oscillating based on constitution, season, and treatment." },
  { id: 78, difficulty: "hard", topic: "Philosophy",
    question: "Hahnemann's concept of 'maintaining causes' (§7, footnote) refers to:",
    options: ["The initial cause of the disease", "Ongoing factors that sustain the disease — diet, lifestyle, emotions — that must be removed for cure", "Miasmatic predispositions", "Constitutional weaknesses"],
    correct: 1, explanation: "§7 footnote: Maintaining causes (Unterhaltende Ursache) are the continuing factors that keep the patient sick — dietary indiscretions, emotional situations, environmental factors. The physician must identify and remove these alongside giving the remedy." },
  { id: 79, difficulty: "hard", topic: "Materia Medica",
    question: "The differential between Gelsemium and Aconite in acute fever is:",
    options: ["Both are identical in acute fever", "Gelsemium: slow onset, dullness, drowsiness, no thirst; Aconite: sudden onset, intense anxiety, great thirst, fear of death", "Aconite has more muscular weakness", "Gelsemium has more restlessness"],
    correct: 1, explanation: "Classic comparison: Aconite = sudden, violent, 1st 24 hours, great anxiety and thirst, fear of death. Gelsemium = slower onset, great fatigue/heaviness, drowsiness, absence of thirst, no anxiety — more like 'dull flu'." },
  { id: 80, difficulty: "hard", topic: "Repertory",
    question: "In Boenninghausen's method, the 'concomitants' (unrelated symptoms) are used because:",
    options: ["They are the most common symptoms", "They reveal the totality of the patient's reactivity beyond the main complaint", "They are easier to repertorize", "They have more remedies in the rubric"],
    correct: 1, explanation: "Boenninghausen: a symptom 'unrelated' to the main complaint is often the most individualizing. These concomitants reveal the characteristic reaction pattern of the vital force — often more specific than the chief complaint itself." },
  { id: 81, difficulty: "easy", topic: "Materia Medica",
    question: "Phosphorus is characterised by which bleeding tendency?",
    options: ["No bleeding tendency", "Bright red blood, bleeds easily, poor coagulation", "Dark clotted blood", "Internal bleeding only"],
    correct: 1, explanation: "Phosphorus: bright red, profuse bleeding from any orifice — nose, lungs, GIT, uterus. Blood does not coagulate easily. This hemorrhagic tendency is one of the most characteristic generals of Phosphorus." },
  { id: 82, difficulty: "easy", topic: "Organon",
    question: "The term 'allopathy' as used by Hahnemann means:",
    options: ["Western medicine in general", "Treatment with medicines that produce opposite effects to the disease symptoms (contraria contrariis)", "Any non-homeopathic system", "Treatment with large doses"],
    correct: 1, explanation: "Hahnemann coined 'allopathy' (allos = other, pathos = disease) to describe the practice of treating disease with medicines that produce a different or opposite effect — contraria contrariis. He contrasted this with homeopathy (similia similibus)." },
  { id: 83, difficulty: "easy", topic: "Materia Medica",
    question: "Which remedy is the first to think of in acute otitis media (ear infection) in a child with great pain, screaming?",
    options: ["Pulsatilla", "Belladonna", "Chamomilla", "Hepar Sulph"],
    correct: 2, explanation: "Chamomilla is most often indicated in acute otitis with extreme pain and unbearable irritability. The child screams, cannot be comforted, wants to be carried. Contrasted with Pulsatilla (milder, weeping, wants sympathy)." },
  { id: 84, difficulty: "easy", topic: "Miasms",
    question: "The Cancer miasm (4th miasm, as per some authors) is most closely associated with:",
    options: ["Skin diseases", "Destructive suppression, cancer tendency, perfectionism", "Excessive discharges", "Febrile diseases"],
    correct: 1, explanation: "The Cancer miasm (recognized by Burnett, later Foubister): combination of all three primary miasms. Perfectionism, suppressed emotions, family history of cancer. Carcinosin is its chief nosode." },
  { id: 85, difficulty: "easy", topic: "Repertory",
    question: "In Kent's Repertory, bold type remedies (Grade 3) indicate:",
    options: ["Rarely used remedies", "Most reliable and clinically confirmed remedies for that rubric", "Newly added remedies", "Remedies used in one proving only"],
    correct: 1, explanation: "Grade 3 (bold/CAPS): the most reliable, most confirmed, most consistently effective remedies for the rubric — confirmed in multiple provings and extensive clinical practice. These are the first remedies to investigate." },
  { id: 86, difficulty: "medium", topic: "Materia Medica",
    question: "Apis Mellifica's characteristic pain sensation is:",
    options: ["Burning, stinging, worse from heat, better from cold applications", "Cramping, worse from motion", "Dull aching, worse from cold", "Lancinating, periodic"],
    correct: 0, explanation: "Apis: stinging, burning pains (like bee stings), worse from heat (warm room, hot applications), better from cold. The swellings are watery (oedematous), rosy-pink, shiny. No thirst in inflammation." },
  { id: 87, difficulty: "medium", topic: "Organon",
    question: "The 'therapeutic aggravation' (homeopathic aggravation) described in §157-§161 is:",
    options: ["Always a bad sign requiring antidoting", "A temporary worsening indicating the remedy is similar — a positive prognostic sign in acute disease", "Proof the wrong remedy was given", "The result of too-high potency always"],
    correct: 1, explanation: "§157-161: A slight, brief initial aggravation of symptoms means the remedy closely matches the disease — the vital force is responding. In acute disease it passes quickly. In chronic cases it signals to wait or reduce potency before repeating." },
  { id: 88, difficulty: "medium", topic: "Materia Medica",
    question: "Graphites is particularly indicated in skin conditions with:",
    options: ["Dry, burning eruptions", "Oozing, honey-like, glutinous discharge from skin cracks", "Vesicular eruptions that itch intensely", "Smooth, painless skin nodules"],
    correct: 1, explanation: "Graphites: characteristic skin — sticky, honey-like, glutinous exudate from cracks and eruptions. Especially at flexures (behind ears, groin, between fingers). Chilly, fat, constipated patients with sad music making them weep." },
  { id: 89, difficulty: "medium", topic: "Philosophy",
    question: "The 'doctrine of signatures' is:",
    options: ["Foundational to homeopathy", "A pre-scientific idea (not homeopathic) that a plant's appearance indicates its medicinal use", "How Hahnemann proved remedies", "The basis of potency selection"],
    correct: 1, explanation: "The doctrine of signatures (Paracelsus) says a plant's appearance indicates its use (red berries = heart; yellow = jaundice). Hahnemann explicitly rejected this — homeopathic proving on healthy subjects is the only valid method of establishing remedy action." },
  { id: 90, difficulty: "medium", topic: "Materia Medica",
    question: "Ferrum Metallicum is indicated in anemia with which characteristic presentation?",
    options: ["Pallor with no flushing", "Alternating pallor and flushing, weakness, noise intolerance, watery diarrhea from least food", "Dark skin, chronic fatigue", "Purpura and bruising"],
    correct: 1, explanation: "Ferrum Metallicum: anaemia with alternating pallor and flushes of red (face can flush suddenly). Extreme weakness, noise intolerance (voices jar unpleasantly), painless diarrhea, aggravated by rest and better from gentle motion." },
  { id: 91, difficulty: "medium", topic: "Repertory",
    question: "The rubric 'GENERALS: Sides; right' covers symptoms that are:",
    options: ["Only on the right side of the body", "Predominantly or characteristically right-sided in their expression", "Caused by right-sided pathology only", "Bilateral but starting on the right"],
    correct: 1, explanation: "Laterality rubrics describe the characteristic tendency of a remedy's symptoms to occur on a specific side. Lycopodium is predominantly right-sided; Lachesis is left-sided; Baryta Carb tends to right. Laterality is a valuable individualizing general." },
  { id: 92, difficulty: "hard", topic: "Organon",
    question: "§259-§261 of the Organon discuss the 'obstacles to cure' (Hindernisse der Heilung). These include all EXCEPT:",
    options: ["Unhealthy diet and lifestyle", "Strong medicinal agents in food (coffee, spices, herbs)", "The patient's financial situation", "Emotional suppression"],
    correct: 2, explanation: "§259-261: Obstacles to cure are maintaining causes that sustain illness: unhealthy diet, exciting passions, strong medicinal substances in daily food (coffee, herbal teas, spices), and emotional burdens. Financial situation is not listed as an obstacle per se." },
  { id: 93, difficulty: "hard", topic: "Materia Medica",
    question: "The Baryta Carb constitution is classically described as:",
    options: ["Tall, thin, nervous, hemorrhagic", "Dwarfed children or elderly — slow development, timidity, enlarged glands, prone to tonsillitis", "Fair, fat, flabby like Calcarea", "Hot, restless, intellectual"],
    correct: 1, explanation: "Baryta Carb: the remedy for extreme timidity and underdevelopment. Children who are backward (mentally and physically) with enlarged glands and tonsils. In elderly: premature senility, loss of memory, arteriosclerosis." },
  { id: 94, difficulty: "hard", topic: "Repertory",
    question: "Cross-reference in the Repertory (e.g., 'See also Mind: Anger') is used because:",
    options: ["To save space", "Related rubrics may contain complementary remedies not all listed under one heading", "It is alphabetical convenience", "The rubrics are identical"],
    correct: 1, explanation: "Cross-referencing in the repertory guides the prescriber to related rubrics that may contain additional or more appropriate remedies. A thorough prescriber checks cross-references to ensure no important remedy is missed." },
  { id: 95, difficulty: "hard", topic: "Philosophy",
    question: "The 'Centesimal' potency (C scale) means:",
    options: ["Diluted 1:10 at each step", "Diluted 1:100 at each step with succussion", "Diluted 1:50,000 at each step", "Any dilution above 12C"],
    correct: 1, explanation: "Centesimal (C) scale: 1 part medicine to 99 parts diluent (1:100 ratio), succussed vigorously at each step. 30C = 30 sequential 1:100 dilutions. The C scale is the most widely used. LM = 1:50,000 per step." },

  // ── EASY (batch 3) ────────────────────────────────────────────────────────
  { id: 96, difficulty: "easy", topic: "Materia Medica",
    question: "Coffea Cruda is most indicated for sleeplessness caused by:",
    options: ["Worry and anxiety", "Excessive flow of thoughts, overactive mind, joy", "Grief and sorrow", "Overwork"],
    correct: 1, explanation: "Coffea Cruda: sleeplessness from joyful excitement and overflow of ideas. The mind races with pleasant thoughts. Also indicated for extreme sensitivity to pain (as if a thousand delicate nerves are exposed)." },
  { id: 97, difficulty: "easy", topic: "Organon",
    question: "Which edition of the Organon introduced the LM (50-millesimal) potency?",
    options: ["3rd Edition", "5th Edition", "6th Edition", "4th Edition"],
    correct: 2, explanation: "The 6th Edition (written 1842, published 1921) introduced the LM (quinquagintamillesimal) potency scale, allowing frequent repetition without aggravation — Hahnemann's final contribution to prescribing methodology." },
  { id: 98, difficulty: "easy", topic: "Materia Medica",
    question: "Staphysagria is the remedy for ailments from suppressed anger and:",
    options: ["Overexertion", "Wounded pride, insults, humiliation", "Cold exposure", "Overeating"],
    correct: 1, explanation: "Staphysagria: suppressed emotions — particularly anger from humiliation, insult, or abuse. Also: ailments from surgical incisions, sexual abuse aftermath. The patient swallows their anger (contrasted with Nux which expresses it violently)." },
  { id: 99, difficulty: "easy", topic: "Repertory",
    question: "The chapter 'Generalities' in Kent's Repertory covers:",
    options: ["Mental symptoms", "General symptoms of the whole patient — thermal state, food cravings, time modalities", "Specific organ symptoms", "Only hereditary conditions"],
    correct: 1, explanation: "Generalities: whole-patient symptoms — how the entire organism is affected. Thermal state (hot/chilly), time modalities (better morning, worse evening), food desires/aversions, weather effects, constitutional generals." },
  { id: 100, difficulty: "easy", topic: "Philosophy",
    question: "The 'totality of symptoms' approach means the prescribed remedy must cover:",
    options: ["The main complaint only", "All physical symptoms but no mental symptoms", "The characteristic mental, physical, and general symptoms taken together", "The laboratory findings and diagnosis"],
    correct: 2, explanation: "Totality of symptoms = the complete characteristic picture: mental/emotional, physical generals, and peculiar local symptoms taken as a whole. No one symptom prescribes — the pattern of the whole patient guides remedy selection." },
  { id: 101, difficulty: "easy", topic: "Materia Medica",
    question: "Hepar Sulphuris Calcareum (Hepar Sulph) is especially indicated for suppurations that are:",
    options: ["Painless and cold", "Hypersensitive, offensive-smelling, chilly patients who heal slowly", "Dry and crusted", "Deep and silent"],
    correct: 1, explanation: "Hepar Sulph: hypersensitive to pain, touch, cold air. Suppurations that smell like old cheese. Extremely chilly. The patient is irritable and angry. Low potencies promote discharge; high potencies abort abscesses." },
  { id: 102, difficulty: "easy", topic: "Miasms",
    question: "Which nosode comes from the tuberculosis bacillus and its products?",
    options: ["Psorinum", "Medorrhinum", "Syphilinum", "Tuberculinum bovinum"],
    correct: 3, explanation: "Tuberculinum bovinum (TB) is prepared from sterilized tuberculous tissue. It's the chief nosode for the Tubercular miasm — given when a clear TB family history is present or when indicated remedies fail to hold." },
  { id: 103, difficulty: "easy", topic: "Materia Medica",
    question: "Euphrasia (Eyebright) is primarily indicated for:",
    options: ["Ear complaints", "Eye complaints — profuse acrid lachrymation, bland nasal discharge", "Skin rashes", "Digestive complaints"],
    correct: 1, explanation: "Euphrasia: opposite of Allium Cepa. Euphrasia has acrid tears (burning the cheeks) but bland nasal discharge. Allium Cepa has acrid nasal discharge but bland tears. This opposite is a classic MM examination point." },
  { id: 104, difficulty: "easy", topic: "Organon",
    question: "§5 of the Organon instructs the physician to consider the following in case-taking EXCEPT:",
    options: ["Exciting (precipitating) causes", "Maintaining causes", "The hospital budget", "Fundamental miasmatic cause"],
    correct: 2, explanation: "§5: The physician needs the exciting cause, the maintaining cause, the patient's constitution, and the fundamental miasm. The hospital or clinic budget is obviously not a clinical consideration per the Organon." },
  { id: 105, difficulty: "easy", topic: "Materia Medica",
    question: "Cantharis is the main remedy for burning, cutting urinary pains with:",
    options: ["Frequent urge with no burning", "Intolerable burning before, during, and after urination with constant urge to urinate", "Painless frequency", "Incontinence in sleep"],
    correct: 1, explanation: "Cantharis: intense burning, cutting urinary pains. The urge is constant and intolerable. Pain before, during, and after urination. Indicated in acute cystitis with these violent, burning characteristics." },

  // ── MEDIUM (batch 3) ──────────────────────────────────────────────────────
  { id: 106, difficulty: "medium", topic: "Materia Medica",
    question: "Spigelia is a principal remedy for heart and pericardial symptoms because:",
    options: ["It causes cardiac enlargement in provings", "Its left-sided neuralgic pains extend to the chest, with stitch on inspiration and violent palpitations", "It is derived from a cardiac plant", "It reduces blood pressure"],
    correct: 1, explanation: "Spigelia: left-sided neuralgic pains (face, eye, heart), violent palpitations visible to the eye, stitch on inspiration, worse lying on right side. Sits up and leans forward. Key exam reminder: Spigelia for left-sided sharp precordial pains." },
  { id: 107, difficulty: "medium", topic: "Philosophy",
    question: "Hahnemann's concept of 'exciting cause' (§7) in acute disease refers to:",
    options: ["The patient's miasmatic background", "The immediate precipitating factor that triggered the acute episode", "The remedy's primary action", "The inheritance pattern"],
    correct: 1, explanation: "Exciting cause = the trigger that precipitates an acute illness — cold exposure, emotional shock, overeating, etc. The physician must both identify and remove this cause AND select the remedy based on the resulting symptom picture." },
  { id: 108, difficulty: "medium", topic: "Repertory",
    question: "The rubric 'MIND: Fear; death, of' is useful when the patient expresses which keynote?",
    options: ["Depression", "Fear that they are about to die — seen in Aconite, Arsenicum, Nitric Acid", "Fear of heights", "Anxiety about health in general"],
    correct: 1, explanation: "Fear of death rubric: Aconite (acute sudden fear with every complaint), Arsenicum (chronic fear, midnight, clings to others), Nit-ac (predicts time of death). The quality and context of the fear differentiates these remedies." },
  { id: 109, difficulty: "medium", topic: "Materia Medica",
    question: "Mercurius (Mer Viv/Mer Sol) has a diagnostic modality that no other remedy shares as specifically:",
    options: ["Worse from heat alone", "Worse from both heat AND cold — thermolabile, sweating without relief, night aggravation", "Better from sweating", "Worse only from cold"],
    correct: 1, explanation: "Mercury's classic aggravation: worse from BOTH heat and cold (thermolabile). Profuse sweating that does not relieve. Worse at night. Offensive discharges from every orifice. Trembling, slavering, offensive breath." },
  { id: 110, difficulty: "medium", topic: "Miasms",
    question: "The Sycotic miasm at its core produces pathology characterized by:",
    options: ["Deficiency and weakness", "Excess, proliferation, overgrowth, and secretion", "Destruction and ulceration", "Eruptions and itch"],
    correct: 1, explanation: "Sycosis = 'to fig' (wart). The miasm of excess: warts, condylomata, papillomas, polyps, cysts, fibroids, excess secretions, emotional excess (jealousy, fixed ideas). Associated with Thuja, Medorrhinum, Nat Sulph." },
  { id: 111, difficulty: "medium", topic: "Organon",
    question: "In §118, Hahnemann establishes that each medicine has a specific, unique action. This means:",
    options: ["All medicines treat the same diseases", "No two medicines have identical effects on health — each occupies a unique space in therapeutics", "Higher potencies are more specific", "Classification by chemistry determines action"],
    correct: 1, explanation: "§118: Each medicine has its own unique characteristic action on the healthy human organism — no two are identical. This is the foundation of individualized prescribing: only the one most similar to the patient's symptoms will cure." },
  { id: 112, difficulty: "medium", topic: "Materia Medica",
    question: "The remedy 'Opium' in homeopathy is primarily indicated when:",
    options: ["There is excessive pain and sensitivity", "There is a LACK of reaction — emotional blunting, painlessness despite apparent illness, constipation with no urge", "The patient is highly anxious", "Violent convulsions"],
    correct: 1, explanation: "Opium: the classic 'no reaction' remedy. Patient seems better than they are, complains of no pain. Constipation with no desire for stool. After fright where the frightful image remains (fright and its effects). Face red, bloated, hot." },
  { id: 113, difficulty: "medium", topic: "Philosophy",
    question: "In constitutional prescribing for chronic disease, the physician evaluates ALL of the following EXCEPT:",
    options: ["Mental constitution and temperament", "Physical generals (thermals, food cravings)", "Blood type", "Peculiar, uncommon symptoms"],
    correct: 2, explanation: "Constitutional prescribing uses mental constitution, physical generals, temperament, peculiar symptoms, history, and miasmatic background. Blood type has no established role in classical homeopathic prescribing." },
  { id: 114, difficulty: "medium", topic: "Materia Medica",
    question: "Veratrum Album is indicated in collapse with which characteristics?",
    options: ["Hot face, no perspiration", "Ice-cold perspiration on forehead, collapse with cramps, rice-water stools, great thirst for cold water", "Dry skin, high fever", "Warm perspiration, no thirst"],
    correct: 1, explanation: "Veratrum Album: the collapse remedy of classical homeopathy. Ice-cold perspiration on forehead, cold body, violent cramps, profuse rice-water diarrhea (cholera-like), unquenchable thirst for cold water. Prostration out of proportion." },
  { id: 115, difficulty: "medium", topic: "Repertory",
    question: "In Boenninghausen's Therapeutic Pocketbook, remedies are found under 'Conditions' (modalities). The key advantage is:",
    options: ["It has more remedies", "Complete symptoms can be built by combining location, sensation, modality, and concomitant from separate sections", "It is easier to read", "It only covers mental symptoms"],
    correct: 1, explanation: "Boenninghausen's method: each component of a symptom (location, sensation, modality, concomitant) is repertorized separately and results are combined. This allows prescribing even from incomplete symptoms — very practical in acute prescribing." },
  { id: 116, difficulty: "medium", topic: "Miasms",
    question: "Carcinosin (Carcinominum) as a nosode is used intercurrently when:",
    options: ["Any cancer diagnosis is made", "The case shows strong family history of cancer, perfectionism, suppressed emotions, failure of well-chosen remedies", "The patient has skin cancer", "Whenever the case is difficult"],
    correct: 1, explanation: "Carcinosin intercurrent: family history of cancer/TB/diabetes (multiple miasms), perfectionist with suppressed emotions, early traumatic history, moles on chest. It unblocks cases where the indicated remedy acts but doesn't hold." },
  { id: 117, difficulty: "medium", topic: "Materia Medica",
    question: "Platina (Platinum Metallicum) has the unusual mental symptom of:",
    options: ["Extreme fear and timidity", "Excessive pride, arrogance, contempt for others, feels everything is smaller than it really is", "Religious mania", "Weeping without cause"],
    correct: 1, explanation: "Platina: haughtiness, extreme pride, contempt for others (everything seems too small, too low). Opposite mental delusion to Baryta Carb. Alternating states: arrogant then weeping. Sexual hypersensitivity. Constricting sensations." },

  // ── HARD (batch 3) ─────────────────────────────────────────────────────────
  { id: 118, difficulty: "hard", topic: "Materia Medica",
    question: "The Aurum Metallicum (gold) patient's depression is differentiated from Natrum Mur by:",
    options: ["Both are identical", "Aurum has suicidal ideation with self-blame and high sense of duty; Nat-m has silent grief with consolation aggravation", "Nat-m has suicidal ideation; Aurum does not", "Aurum is better from consolation"],
    correct: 1, explanation: "Aurum: depression with actual suicidal ideation (rare in homeopathy to be so specific). High sense of duty, feels they have failed, self-reproach. Worse in winter. Contrast Nat-m: grief without suicidal ideation, consolation aggravates." },
  { id: 119, difficulty: "hard", topic: "Organon",
    question: "§104 of the Organon instructs that in a chronic disease, the complete symptom list is assembled from:",
    options: ["The first consultation alone", "Current symptoms plus ALL symptoms observed over multiple consultations and from the patient's past history", "Lab reports and diagnosis", "The physician's experience with similar cases"],
    correct: 1, explanation: "§104: In chronic disease, the complete characteristic picture must be assembled over time — including current symptoms, historical symptoms, and information from the patient's first to most recent consultations. Patience and thoroughness define chronic prescribing." },
  { id: 120, difficulty: "hard", topic: "Philosophy",
    question: "Kent's concept of 'isopathy' refers to:",
    options: ["Using the exact same substance as the disease-producing agent (same, not similar)", "Using the similar remedy", "Using nosodes only", "Using constitutional remedies"],
    correct: 0, explanation: "Isopathy = treating with the identical causative agent (e.g., giving Influenzinum for flu). Kent and Hahnemann distinguished isopathy from homeopathy: similia (similar) is the law; the isopathic (same) is only occasionally curative and not the general principle." },
  { id: 121, difficulty: "hard", topic: "Repertory",
    question: "The synthesis repertory differs from Kent's original in which key respect?",
    options: ["It has fewer remedies", "It incorporates rubrics from multiple repertories (Boenninghausen, Boger, etc.) and modern additions", "It was written before Kent's", "It only covers mental symptoms"],
    correct: 1, explanation: "The Synthesis Repertory (Schroyens): compiled from Kent plus Boenninghausen, Boger's synoptic key, clinical additions, and modern provings. Vastly larger than Kent's original. Forms the basis of most computerized repertory software." },
  { id: 122, difficulty: "hard", topic: "Miasms",
    question: "A.P. Allen's 'The Chronic Miasms' classified Tubercular miasm as separate from Psora because:",
    options: ["It was historically identified later", "It showed a distinct destructive tendency (hemoptysis, emaciation, night sweats) combined with psoric deficiency", "It only affects the lungs", "Hahnemann identified it separately"],
    correct: 1, explanation: "J.H. Allen (not A.P.) separated Tubercular miasm because it showed a unique combination: psoric deficiency + syphilitic destruction, producing the classic TB picture (chronic cough, emaciation, night sweats, family history of tuberculosis) not fully explained by Psora alone." },
  { id: 123, difficulty: "hard", topic: "Materia Medica",
    question: "In the Sulphur-Calcarea-Lycopodium triad, which pairing is considered 'complementary' per Clarke?",
    options: ["Sulphur and Lycopodium only", "All three are complementary to each other in sequence", "Calcarea and Lycopodium only", "None are complementary"],
    correct: 1, explanation: "Per Clarke's Dictionary and Kent's teachings: Sulphur, Calcarea Carb, and Lycopodium form a complementary trio — each follows the other well in sequence. Sulphur initiates (psoric base), Calcarea consolidates (deep constitutional), Lycopodium finishes (functional layer)." },
  { id: 124, difficulty: "hard", topic: "Organon",
    question: "The concept of 'inimical' (incompatible) remedies means they:",
    options: ["Are derived from similar plants", "Should not be used in close succession because they antidote or produce adverse reactions together", "Treat opposite symptoms", "Are always given together"],
    correct: 1, explanation: "Inimical (incompatible) remedies: those that should not immediately follow each other — their combined action produces adverse effects or antidotes. Example: Phosphorus and Causticum are inimical. This relationship must be known before second prescription." },
  { id: 125, difficulty: "hard", topic: "Philosophy",
    question: "Hahnemann's 'Theory of Chronic Disease' (1828) proposed that all chronic diseases other than syphilis and sycosis arise from:",
    options: ["Poor nutrition", "Suppressed psora (7/8ths of all chronic disease)", "Genetic inheritance without miasmatic overlay", "Environmental toxins"],
    correct: 1, explanation: "Hahnemann's chronic disease theory: Psora (suppressed itch disease/scabies miasm) is the mother of all chronic diseases — responsible for 7/8ths of non-venereal chronic illness. Syphilis and Sycosis account for the remaining 1/8th." },
  { id: 126, difficulty: "hard", topic: "Repertory",
    question: "The E.B. Nash 'Regional Leaders' approach to repertory work means:",
    options: ["Only using generals", "Finding the 'leading' remedy for each region of the body based on clinical experience", "Using geographic location of the patient", "Prescribing only for regional symptoms"],
    correct: 1, explanation: "Nash's Leaders: Nash identified characteristic 'leader' remedies for each body region based on clinical experience — e.g., Belladonna leads for sudden head symptoms; Bryonia for lung/pleurisy. This clinical shortcut complements formal repertorization." },
  { id: 127, difficulty: "hard", topic: "Materia Medica",
    question: "Stannum Metallicum (tin) has a unique characteristic regarding weakness: describe it.",
    options: ["Weakness better from exertion", "Progressive, profound weakness — especially of chest; voice becomes weaker with use; talking exhausts", "Sudden weakness from anxiety", "Weakness with full recovery after rest"],
    correct: 1, explanation: "Stannum: profound, progressive debility of the chest muscles. Talking exhausts; the voice gives out. Characteristic chest weakness and copious mucus. The remedy of choice in exhausting coughs with profuse green-yellow expectoration." },
  { id: 128, difficulty: "hard", topic: "Miasms",
    question: "Syphilinum (Luesinum) as a remedy is primarily indicated in pathology involving:",
    options: ["Overgrowth and warts", "Bone destruction, nocturnal aggravation, ulceration, nihilistic mental states", "Functional deficiency and itch", "Chronic respiratory disease"],
    correct: 1, explanation: "Syphilinum: the nosode of the Syphilitic miasm. Bone pains worse at night, ulcerative pathology, destructive processes (teeth, nails, bone), nihilistic and suicidal mental states, worse at night, better during the day." },
  { id: 129, difficulty: "hard", topic: "Organon",
    question: "§161 describes the 'initial aggravation' in chronic disease treatment. The correct management is:",
    options: ["Immediately antidote the remedy", "Wait — this brief worsening indicates a good prognosis; reduce potency if persistent", "Give higher potency immediately", "Stop treatment permanently"],
    correct: 1, explanation: "§161: In chronic disease, a homeopathic aggravation means the remedy is well-chosen but the dose/potency may need adjustment. If the aggravation is brief and mild → wait and watch. If prolonged → reduce dose or frequency or potency. Do NOT antidote a well-acting remedy." },
  { id: 130, difficulty: "hard", topic: "Materia Medica",
    question: "Zincum Metallicum's most characteristic neurological keynote is:",
    options: ["Convulsions with loss of consciousness", "Restless feet — constant fidgeting/moving of feet, especially in sleep; cannot keep feet still", "Paralysis of lower limbs", "Facial tics"],
    correct: 1, explanation: "Zincum Met: restless feet — cannot keep them still, especially when trying to sleep. Also: exhaustion of the nervous system, brain-fag from overwork, trembling, suppressed discharges. The 'brain-tired student' remedy." },

  // ── EASY (batch 4) ────────────────────────────────────────────────────────
  { id: 131, difficulty: "easy", topic: "Materia Medica",
    question: "Ledum Palustre is the remedy of choice after:",
    options: ["Burns", "Puncture wounds, insect stings, and injuries where the part becomes cold and mottled", "Bruising (blunt trauma)", "Fractures"],
    correct: 1, explanation: "Ledum: puncture wounds, insect stings — the part becomes cold, numb, mottled bluish-purple yet is relieved by cold applications. First remedy to prevent tetanus after puncture wounds. Contrasted with Arnica (blunt injury, bruising)." },
  { id: 132, difficulty: "easy", topic: "Philosophy",
    question: "The 'minimum dose' principle means the physician should give:",
    options: ["The highest potency available", "Just enough to stimulate the vital force without over-stimulating or causing prolonged aggravation", "The lowest potency", "Frequent large doses"],
    correct: 1, explanation: "Minimum dose: give just enough (in terms of size and frequency of dose) to gently stimulate the vital force to initiate healing — not so much as to cause unnecessary aggravation or prolonged medicinal disease." },
  { id: 133, difficulty: "easy", topic: "Materia Medica",
    question: "Bryonia Alba is the remedy when the patient is:",
    options: ["Better from motion, worse from rest", "Worse from every motion — wants absolute stillness; thirsty for large quantities", "Restless and cannot keep still", "Worse from cold"],
    correct: 1, explanation: "Bryonia: the keynote is absolute WORSE FROM ANY MOTION. The patient lies perfectly still. Irritable, wants to go home, thirsty for large cold drinks at long intervals. Dryness of all mucous membranes. Worse 9 pm." },
  { id: 134, difficulty: "easy", topic: "Organon",
    question: "The word 'homeopathy' is derived from Greek and means:",
    options: ["Home treatment", "Similar suffering", "Healing by nature", "Small dose medicine"],
    correct: 1, explanation: "Homeopathy = homoios (similar) + pathos (suffering/disease). Coined by Hahnemann, it literally means 'similar suffering' — the medicine that in a healthy person causes symptoms similar to the patient's disease will cure that patient." },
  { id: 135, difficulty: "easy", topic: "Materia Medica",
    question: "Which remedy is indicated for the first stage of measles, before eruptions appear, with photophobia and watery nasal discharge?",
    options: ["Belladonna", "Pulsatilla", "Euphrasia", "Ferrum Phos"],
    correct: 2, explanation: "Euphrasia in measles: before and during eruption, with profuse acrid tears and photophobia. Also Morbillinum (nosode) for prevention. Pulsatilla comes in later when catarrh is thick and bland." },
  { id: 136, difficulty: "easy", topic: "Miasms",
    question: "Psoric miasm most commonly manifests as what type of skin disease?",
    options: ["Warts and condylomata", "Dry, itching eruptions that alternate with internal disease", "Ulcers and destructive lesions", "Pustular eruptions"],
    correct: 1, explanation: "Psora: the 'itch miasm'. Manifests as dry, itching skin eruptions (eczema, psoriasis) that alternate with internal chronic disease (asthma, arthritis). Suppression of these skin eruptions drives pathology inward to deeper organs." },
  { id: 137, difficulty: "easy", topic: "Repertory",
    question: "The abbreviation 'Nat-m' in Kent's Repertory refers to:",
    options: ["Natrum Muriaticum", "Natrum Mur + Magnesium", "Natural Medicines", "Natrum Murex"],
    correct: 0, explanation: "Nat-m = Natrum Muriaticum (common salt / sodium chloride). One of Hahnemann's most deeply acting polychrests, covering profound grief, herpes, anemia, and constitutions with great thirst for cold water." },
  { id: 138, difficulty: "easy", topic: "Materia Medica",
    question: "Drosera Rotundifolia is the primary remedy for:",
    options: ["Whooping cough with a violent, spasmodic cough ending in retching", "Loose, wet cough with easy expectoration", "Dry cough at night only", "Cough with fever"],
    correct: 0, explanation: "Drosera: violent, spasmodic paroxysms of cough following each other so rapidly the patient cannot breathe. Retching and vomiting after coughing. Whooping cough remedy. Worse after midnight, after lying down." },
  { id: 139, difficulty: "easy", topic: "Philosophy",
    question: "Individualization in homeopathy refers to:",
    options: ["Giving individual patients different doses", "Prescribing based on the unique characteristic symptoms of each patient rather than the disease name", "Treating patients one at a time", "Using a single remedy at a time"],
    correct: 1, explanation: "Individualization: the cornerstone of homeopathic case-taking. Two patients with 'pneumonia' receive different remedies if their characteristic symptom pictures differ. The disease label matters less than the individual's unique symptom expression." },
  { id: 140, difficulty: "easy", topic: "Materia Medica",
    question: "Which remedy has the characteristic modality: 'worse from 11 am to 12 noon'?",
    options: ["Lycopodium", "Natrum Mur", "Sulphur", "Arsenicum"],
    correct: 2, explanation: "Sulphur: classic 11 am aggravation — extreme weakness and hunger at 11 am, often requiring something to eat. Also the classic 'hot feet at night, must uncover feet', burning top of head, and aggravation from bathing." },

  // ── MEDIUM (batch 4) ──────────────────────────────────────────────────────
  { id: 141, difficulty: "medium", topic: "Materia Medica",
    question: "Conium Maculatum (hemlock) is most indicated in which type of tumor/enlargement?",
    options: ["Soft, mobile lymph nodes", "Hard, stony-hard glandular enlargements that begin small and grow slowly — especially in breast, testicle, prostate", "Soft fatty lipomas", "Cystic swellings"],
    correct: 1, explanation: "Conium: the stone-hard glandular remedy. Scirrhous tumors of breast/prostate/testis. Gradually progressive ascending paralysis (upward). Worsened by sexual abstinence, better for discharge. Elderly: cerebral softening, vertigo on lying down." },
  { id: 142, difficulty: "medium", topic: "Organon",
    question: "§140-§145 discuss the technique of proving (Arzneiprüfung). The essential rule is:",
    options: ["Only sick patients can prove remedies", "Proving must be done on healthy humans to obtain the pure remedy picture", "Animals alone are used for proving", "Clinical experience replaces proving"],
    correct: 1, explanation: "§140-145: Proving must be done on healthy human subjects to capture the medicine's pure pathogenesis — the set of symptoms it can produce. Sick patients cannot prove reliably because their existing symptoms confuse the picture." },
  { id: 143, difficulty: "medium", topic: "Miasms",
    question: "The 'chronic disease' concept explains why a well-indicated acute remedy eventually fails to act in a chronic patient. The reason is:",
    options: ["Wrong potency", "The underlying miasm sustains the disease — the acute remedy addresses the surface but the miasmatic root drives recurrence", "The patient is not taking the remedy correctly", "The disease is incurable"],
    correct: 1, explanation: "In chronic miasmatic disease, the acute layer may temporarily respond to the simillimum, but without addressing the miasmatic root (Psora, Sycosis, Syphilis), the disease recurs. Anti-miasmatic treatment (nosodes, deep-acting remedies) is required for lasting cure." },
  { id: 144, difficulty: "medium", topic: "Materia Medica",
    question: "Magnesia Phosphorica (Mag Phos) is the classic remedy for neuralgic pains that are:",
    options: ["Burning, worse from warmth", "Cramping, lightning-like, better from warmth, pressure, and rubbing", "Dull, better from cold", "Tearing, worse from motion"],
    correct: 1, explanation: "Mag Phos: the nerve pain remedy. Lightning-like, cramping, radiating neuralgia better from heat, pressure, and firm rubbing. Worse from cold, touch, at night. Most often right-sided. Compare with Colocynthis (left-sided, better bending double)." },
  { id: 145, difficulty: "medium", topic: "Philosophy",
    question: "The term 'provings' (Arzneiprüfungen) in homeopathy specifically means:",
    options: ["Clinical trials of remedies on sick patients", "Systematic experiments on healthy humans to determine the remedy's symptom picture", "Proving that a remedy worked in a case", "Animal testing for toxicology"],
    correct: 1, explanation: "Homeopathic provings: controlled experiments where healthy subjects take a medicine repeatedly and record ALL symptoms produced. These symptoms constitute the remedy's 'pathogenesis' — the basis for selecting it in clinical practice." },
  { id: 146, difficulty: "medium", topic: "Materia Medica",
    question: "The differential between Kali Bichromicum and Hepar Sulph in sinusitis is:",
    options: ["Both are identical", "Kali Bic: thick, ropy, stringy, yellow-green discharge in small quantity; Hepar: hypersensitive, worse cold air, scanty with bone pain", "Hepar has thick mucus; Kali Bic has watery mucus", "Kali Bic is for left side; Hepar for right"],
    correct: 1, explanation: "Kali Bich: characteristic thick, ropy, stringy, tough mucus that can be stretched in strings. Pressure at root of nose. Ulcerations with punched-out edges. Hepar Sulph: extreme hypersensitivity to cold, pain, and touch; worse from cold drafts." },
  { id: 147, difficulty: "medium", topic: "Repertory",
    question: "The rubric 'GENERALS: Bathing; aversion to' includes remedies that characteristically dislike washing. Which pair is most notable?",
    options: ["Pulsatilla and Phosphorus", "Sulphur and Ammonium Carb", "Arsenicum and Nux Vomica", "Calcarea and Sepia"],
    correct: 1, explanation: "Sulphur and Ammonium Carb lead in 'aversion to bathing'. Sulphur's classic modality: aggravation from washing and bathing (worse from water). Ammonium Carb similarly dislikes washing. Sulphur's dirty-looking skin is famous despite no desire to bathe." },
  { id: 148, difficulty: "medium", topic: "Materia Medica",
    question: "Crotalus Horridus (rattlesnake venom) differs from Lachesis in laterality and hemorrhagic tendency:",
    options: ["Crotalus is left-sided; Lachesis is right-sided", "Crotalus is predominantly right-sided and more hemorrhagic; Lachesis is more left-sided and neuralgic", "Both are identical in laterality", "Crotalus has no hemorrhagic tendency"],
    correct: 1, explanation: "Crotalus Horridus: predominantly right-sided, more hemorrhagic (dark, non-coagulating blood), indicated in septic states, yellow fever, hemorrhagic diseases. Lachesis: left-sided (or left-to-right), more neuralgic, jealousy, loquacity, aggravation after sleep." },

  // ── HARD (batch 4) ─────────────────────────────────────────────────────────
  { id: 149, difficulty: "hard", topic: "Materia Medica",
    question: "Arsenicum Album and Phosphorus both have great restlessness and anxiety. Their chief differentiating point in etiology is:",
    options: ["Same etiology — both are identical", "Arsenicum: anxiety from fear of death and inability to recover; Phosphorus: anxiety with sympathetic concern for others and sensitivity to impressions", "Phosphorus has more physical restlessness; Arsenicum has none", "Arsenicum is worse morning; Phosphorus worse midnight"],
    correct: 1, explanation: "Arsenicum: anxiety from self-preservation — fear of death, disease, poverty. Midnight aggravation. Restlessness driving from place to place. Phosphorus: anxiety from over-sympathetic sensitivity to others' suffering. Both have midnight aggravation but for different reasons." },
  { id: 150, difficulty: "hard", topic: "Philosophy",
    question: "The 'obstacle to cure' scenario where a patient lives in a mouldy house is relevant because:",
    options: ["Mould changes the disease diagnosis", "Maintaining causes in the environment sustain the vital force's disease state — the remedy cannot complete cure until the cause is removed (§7)", "This is only relevant if the patient is allergic", "Homeopathy can overcome all maintaining causes"],
    correct: 1, explanation: "§7 footnote: Maintaining causes must be identified and removed. If a patient lives in damp, mouldy conditions and you prescribe Nat Sulph or Thuya without removing the environmental cause, improvement will be temporary at best. Cause removal is co-essential with prescribing." },
  { id: 151, difficulty: "hard", topic: "Organon",
    question: "§285 instructs on the choice of the vehicle (water or dry) for administering the remedy. The key advantage of water (aqueous) administration is:",
    options: ["It is cheaper", "Each dose can be slightly succussed before administration, producing a slightly altered potency so it finds a new virgin area of vital force to act on", "Water has no effect on the remedy", "Patients prefer water"],
    correct: 1, explanation: "§285-286: Aqueous administration allows slight succussion before each dose, infinitesimally changing the potency at each repetition. This avoids the vital force becoming accustomed to the same potency, allowing frequent safe repetition — the basis of the 'plussing method'." },
  { id: 152, difficulty: "hard", topic: "Repertory",
    question: "A patient has grief-induced insomnia, sighing, weeping, worse consolation. The most targeted rubric combination is:",
    options: ["Mind: Sadness + Sleep: Sleeplessness", "Mind: Grief + Mind: Consolation, aggravation + Sleep: Sleeplessness, thoughts activity of", "Head: Pain + Mind: Weeping", "Generals: Weakness + Mind: Crying"],
    correct: 1, explanation: "Precise rubric selection: Mind: Grief (Ign, Nat-m, Sep) + Mind: Consolation agg (Nat-m, Ign) + Sleep: Sleeplessness from grief or active thoughts narrows the field sharply to Ignatia and Natrum Mur, then the totality distinguishes between them." },
  { id: 153, difficulty: "hard", topic: "Materia Medica",
    question: "Cuprum Metallicum's most characteristic spasm pathology is:",
    options: ["Slow, painless paralysis", "Violent, cramping, sudden spasms beginning in fingers and toes — thumb flexed into palm before convulsion begins", "Spasms only of facial muscles", "Gradual increasing muscle stiffness"],
    correct: 1, explanation: "Cuprum Met: sudden, violent cramping. Characteristic — the cramping begins in fingers and toes and extends upward. Before a convulsion the thumb is drawn into the palm. Metallic taste. Face bluish. Cramping of chest muscles in whooping cough." },
  { id: 154, difficulty: "hard", topic: "Miasms",
    question: "Hahnemann's fundamental proposition about Psora states that it was first contracted by:",
    options: ["Sexual exposure to infected partners", "Contact with the itch mite (Sarcoptes scabiei) — suppressed skin disease spreading miasmatically", "Inheritance alone", "Contaminated water"],
    correct: 1, explanation: "Hahnemann: Psora originated from suppressed scabies (the itch disease, caused by Sarcoptes scabiei). The suppression of the skin eruption drove the disease inward, creating a miasmatic predisposition that has been passed down through generations. This is still controversially debated." },
  { id: 155, difficulty: "hard", topic: "Philosophy",
    question: "The 'simillimum' refers to:",
    options: ["Any remedy that helps the patient", "The one remedy that most closely matches the complete symptom picture — the perfect similar", "The most commonly prescribed remedy", "The constitutional remedy only"],
    correct: 1, explanation: "The simillimum (superlative of similis = most similar): the single remedy whose complete symptom picture is most similar to the patient's complete characteristic symptom picture. In practice, we seek to approach the simillimum; perfect similitude is the ideal." },
  { id: 156, difficulty: "hard", topic: "Organon",
    question: "§213 states that in one-sided diseases (where mental symptoms dominate), the remedy must be selected primarily from the:",
    options: ["Physical symptoms alone", "The patient's narrative about their feelings and mental state, combined with physical concomitants", "The diagnosis", "The miasmatic nosode directly"],
    correct: 1, explanation: "§213: In mental disease cases, the physician uses whatever can be ascertained of the mental/emotional state combined with the characteristic physical concomitants to build the totality. The mental picture plus body-level generals = totality for prescribing." },
  { id: 157, difficulty: "hard", topic: "Materia Medica",
    question: "Hepar Sulph vs. Silicea in abscess management: when do you use HIGH potency Hepar and HIGH potency Silicea?",
    options: ["Both to promote discharge", "High Hepar to ABORT an unripe abscess; High Silicea to expel foreign bodies and push out deeply embedded matter", "Both to stop suppuration", "High Silicea to abort; High Hepar to push out"],
    correct: 1, explanation: "Classic teaching: Hepar Sulph LOW potency = promotes suppuration and discharge. HEPAR HIGH potency = aborts an incipient abscess. SILICEA: pushes out foreign bodies, tips out deeply situated pus. These therapeutic directions depend critically on potency selection." },
  { id: 158, difficulty: "hard", topic: "Repertory",
    question: "In the Repertory, the grade of a remedy is determined primarily by:",
    options: ["The number of times it appears in the repertory", "How strongly and reliably that remedy produced the symptom in provings and is confirmed in clinical practice", "Alphabetical precedence", "Historical age of the proving"],
    correct: 1, explanation: "Grade determination: Grade 3 = strongly produced in provings, repeatedly confirmed clinically. Grade 2 = produced in proving, moderate clinical confirmation. Grade 1 = appears in one proving, limited clinical data. Grading reflects the reliability of the relationship between remedy and symptom." },
  { id: 159, difficulty: "hard", topic: "Philosophy",
    question: "The doctrine that 'the vital force speaks through symptoms' (Hahnemann, Organon §7-§11) means that:",
    options: ["Symptoms are the disease", "Symptoms are the only accessible expression of the otherwise invisible dynamic derangement — they are the language the vital force uses to signal distress", "Pathology can be ignored if symptoms are treated", "Symptoms must be suppressed to heal the vital force"],
    correct: 1, explanation: "§7-11: The vital force is spirit-like and invisible. Its derangement manifests as symptoms — the only tangible expression of inner disease available to the physician. To cure the vital force, the physician must read its symptom-language and match it with a similarly-acting medicine." },
  { id: 160, difficulty: "hard", topic: "Materia Medica",
    question: "Baryta Carb vs. Calcarea Carb in childood development delay: the key differential is:",
    options: ["Both are identical", "Baryta: primarily mental/intellectual backward ness, extreme timidity, enlarged tonsils; Calcarea: more physical (fat, flabby, slow milestones, head sweats)", "Calcarea has more timidity; Baryta has physical delay", "Baryta is used only for elderly"],
    correct: 1, explanation: "Baryta Carb: predominantly intellectual/mental retardation, profound timidity (hides behind furniture), childish behavior in adults, enlarged tonsils. Calcarea: predominantly physical delay (late walking, teething), fat constitution, sweating head, nutritional issues." },
];




// ─── helpers ──────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DIFFICULTY_META = {
  easy:   { label: "Easy",   color: "#16a34a", Icon: Zap,   bg: "rgba(22,163,74,0.08)",  border: "rgba(22,163,74,0.3)"  },
  medium: { label: "Medium", color: "#d97706", Icon: Brain, bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.3)"  },
  hard:   { label: "Hard",   color: "#dc2626", Icon: Flame, bg: "rgba(220,38,38,0.08)",  border: "rgba(220,38,38,0.3)"  },
};

const TOPIC_COLORS: Record<Topic, string> = {
  "Materia Medica": "#4e73df", Organon: "#9b59b6", Repertory: "#e67e22",
  Miasms: "#e74c3c", Philosophy: "#16a34a",
};

// ─── component ────────────────────────────────────────────────────────────────
const TIMER_SECONDS: Record<Difficulty, number> = { easy: 30, medium: 45, hard: 60 };

export default function QuizPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [selectedTopic, setSelectedTopic] = useState<Topic | "All">("All");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizDone, setQuizDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer logic
  useEffect(() => {
    if (!timerEnabled || !quizStarted || quizDone || selected !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const secs = TIMER_SECONDS[difficulty];
    setTimeLeft(secs);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto-advance on timeout — mark as wrong
          setSelected(-1);
          setShowExplanation(true);
          setAnswers(a => [...a, -1]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, quizStarted, quizDone]);

  const meta = DIFFICULTY_META[difficulty];
  const { Icon: DiffIcon } = meta;

  const availableForTopic = selectedTopic === "All"
    ? ALL_QUESTIONS.filter(q => q.difficulty === difficulty)
    : ALL_QUESTIONS.filter(q => q.difficulty === difficulty && q.topic === selectedTopic);

  function startQuiz() {
    const pool = shuffle(availableForTopic);
    setQuestions(pool.slice(0, Math.min(10, pool.length)));
    setCurrentIndex(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
    setAnswers([]);
    setQuizDone(false);
    setQuizStarted(true);
  }

  const current = questions[currentIndex];

  function handleSelect(idx: number) {
    if (selected !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(idx);
    setShowExplanation(true);
    setAnswers(prev => [...prev, idx]);
    if (idx === current.correct) setScore(s => s + 1);
  }

  async function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      setQuizDone(true);
      try {
        await authedFetch("/api/quiz-results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: difficulty,
            score,
            total: questions.length,
            answers: questions.map((q, i) => ({
              questionId: q.id, topic: q.topic,
              selected: answers[i] ?? -1,
              correct: (answers[i] ?? -1) === q.correct,
            })),
          }),
        });
        // Award XP for completing a quiz
        authedFetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activity: "quiz_complete" }),
        });
        toast.success("Result saved! +10 XP");
      } catch { /* silent */ }
    }
  }

  const pct = Math.round((score / (questions.length || 1)) * 100);

  // ── START SCREEN ──────────────────────────────────────────────────────────
  if (!quizStarted) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>
            Quiz Engine
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
            {ALL_QUESTIONS.length} curated questions · Materia Medica · Organon · Repertory · Miasms · Philosophy
          </p>
        </div>

        <div className="shard p-5 space-y-4">
          <p className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>Select difficulty</p>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(DIFFICULTY_META) as [Difficulty, typeof DIFFICULTY_META.easy][]).map(([key, m]) => {
              const { Icon } = m;
              const sel = difficulty === key;
              return (
                <button key={key} onClick={() => setDifficulty(key)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
                  style={sel ? { background: m.bg, border: `2px solid ${m.border}` }
                             : { background: "rgba(0,0,0,0.03)", border: "2px solid transparent" }}>
                  <Icon className="h-5 w-5" style={{ color: m.color }} />
                  <span className="font-bold text-sm" style={{ color: sel ? m.color : "var(--text-dim)" }}>{m.label}</span>
                  <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>
                    {ALL_QUESTIONS.filter(q => q.difficulty === key).length} questions
                  </span>
                </button>
              );
            })}
          </div>

          <div className="px-3 py-2 rounded-xl text-xs" style={{ background: meta.bg, color: meta.color }}>
            {difficulty === "easy" && "Foundational keynotes, clear modalities, first principles — perfect for revision."}
            {difficulty === "medium" && "Multi-symptom cases, modalities, aphorism interpretation — tests applied knowledge."}
            {difficulty === "hard" && "Advanced aphorisms, secondary miasms, rare keynotes — for deep mastery."}
          </div>

          {/* Topic filter */}
          <div>
            <p className="font-bold text-sm mb-2" style={{ color: "var(--text-obsidian)" }}>Filter by topic</p>
            <div className="flex flex-wrap gap-2">
              {(["All", ...Object.keys(TOPIC_COLORS)] as Array<Topic | "All">).map(t => {
                const count = t === "All"
                  ? ALL_QUESTIONS.filter(q => q.difficulty === difficulty).length
                  : ALL_QUESTIONS.filter(q => q.difficulty === difficulty && q.topic === t).length;
                const color = t === "All" ? "#6b7280" : TOPIC_COLORS[t as Topic];
                const sel = selectedTopic === t;
                return (
                  <button key={t} onClick={() => setSelectedTopic(t)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
                    style={sel
                      ? { background: color + "20", color, border: `1.5px solid ${color}` }
                      : { background: "rgba(0,0,0,0.04)", color: "var(--text-dim)", border: "1.5px solid transparent" }}>
                    {t} · {count}q
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timer toggle */}
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>Timed mode</p>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>{TIMER_SECONDS[difficulty]}s per question · auto-skip on timeout</p>
            </div>
            <button onClick={() => setTimerEnabled(v => !v)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ background: timerEnabled ? meta.color : "rgba(0,0,0,0.12)" }}>
              <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                style={{ left: timerEnabled ? "calc(100% - 22px)" : "2px" }} />
            </button>
          </div>

          <button onClick={startQuiz} disabled={availableForTopic.length === 0}
            className="w-full h-12 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: `linear-gradient(135deg,${meta.color},${meta.color}cc)` }}>
            <DiffIcon className="h-4 w-4" />
            Start Quiz · {Math.min(10, availableForTopic.length)} questions
          </button>
        </div>
      </div>
    );
  }

  // ── DONE SCREEN ───────────────────────────────────────────────────────────
  if (quizDone) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        <div className="shard p-6 text-center space-y-3">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl"
            style={{ background: pct >= 70 ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.1)" }}>
            {pct >= 90 ? "🏆" : pct >= 70 ? "✅" : pct >= 50 ? "📚" : "💪"}
          </div>
          <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>
            {score}/{questions.length} correct
          </h2>
          <p className="text-3xl font-black" style={{ color: pct >= 70 ? "#16a34a" : "#dc2626" }}>{pct}%</p>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: pct >= 70 ? "#16a34a" : "#dc2626" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            {pct >= 90 ? "Outstanding! Classical master level."
             : pct >= 70 ? "Good work — solid understanding."
             : pct >= 50 ? "Decent — review the explanations below."
             : "Keep studying — use the MM Tutor for deeper review."}
          </p>
        </div>

        <div className="space-y-3">
          {questions.map((q, i) => {
            const userAns = answers[i] ?? -1;
            const correct = userAns === q.correct;
            return (
              <div key={q.id} className="shard p-4 space-y-2">
                <div className="flex items-start gap-2">
                  {correct
                    ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#16a34a" }} />
                    : <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#dc2626" }} />}
                  <p className="text-sm font-medium" style={{ color: "var(--text-obsidian)" }}>{q.question}</p>
                </div>
                {!correct && (
                  <p className="text-xs ml-6" style={{ color: "#dc2626" }}>
                    Your answer: {q.options[userAns] ?? "—"}
                  </p>
                )}
                <p className="text-xs ml-6 font-semibold" style={{ color: "#16a34a" }}>
                  ✓ {q.options[q.correct]}
                </p>
                <p className="text-xs ml-6 leading-relaxed" style={{ color: "var(--text-dim)" }}>{q.explanation}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={startQuiz}
            className="h-11 rounded-2xl text-white font-bold text-sm"
            style={{ background: `linear-gradient(135deg,${meta.color},${meta.color}cc)` }}>
            Retry same difficulty
          </button>
          <button onClick={() => { setQuizStarted(false); setQuizDone(false); }}
            className="h-11 rounded-2xl font-bold text-sm"
            style={{ background: "rgba(0,0,0,0.06)", color: "var(--text-dim)" }}>
            Change difficulty
          </button>
          <a href="/student"
            className="h-11 rounded-2xl font-bold text-sm flex items-center justify-center col-span-2"
            style={{ background: "rgba(78,115,223,0.08)", color: "var(--accent-mineral)", border: "1px solid rgba(78,115,223,0.2)" }}>
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // ── QUIZ IN PROGRESS ──────────────────────────────────────────────────────
  const progress = (currentIndex / questions.length) * 100;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
            <DiffIcon className="inline h-3 w-3 mr-1" />{meta.label}
          </span>
          <span className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{ background: TOPIC_COLORS[current.topic] + "15", color: TOPIC_COLORS[current.topic] }}>
            {current.topic}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {timerEnabled && selected === null && (
            <div className="flex items-center gap-1 text-sm font-bold tabular-nums"
              style={{ color: timeLeft <= 10 ? "#dc2626" : "var(--text-dim)" }}>
              <Timer className="h-3.5 w-3.5" />
              {timeLeft}s
            </div>
          )}
          <span className="text-sm font-bold" style={{ color: "var(--text-dim)" }}>
            {currentIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: meta.color }} />
      </div>
      {timerEnabled && selected === null && (
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.04)" }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${(timeLeft / TIMER_SECONDS[difficulty]) * 100}%`,
              background: timeLeft <= 10 ? "#dc2626" : timeLeft <= 20 ? "#F59E0B" : "#16a34a",
            }} />
        </div>
      )}

      <div className="shard p-5">
        <p className="font-bold text-base leading-snug" style={{ color: "var(--text-obsidian)" }}>
          {current.question}
        </p>
      </div>

      <div className="space-y-2">
        {current.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === current.correct;
          let bg = "rgba(0,0,0,0.03)";
          let border = "transparent";
          let textColor = "var(--text-obsidian)";
          if (selected !== null) {
            if (isCorrect) { bg = "rgba(22,163,74,0.1)"; border = "rgba(22,163,74,0.4)"; textColor = "#16a34a"; }
            else if (isSelected) { bg = "rgba(220,38,38,0.08)"; border = "rgba(220,38,38,0.3)"; textColor = "#dc2626"; }
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null}
              className={cn("w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                selected === null && "hover:bg-white/60")}
              style={{ background: bg, border: `2px solid ${border}`, color: textColor }}>
              <span className="font-mono mr-2 text-[11px]" style={{ color: "var(--text-dim)" }}>
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
              {selected !== null && isCorrect && <CheckCircle2 className="inline ml-2 h-4 w-4" style={{ color: "#16a34a" }} />}
              {selected !== null && isSelected && !isCorrect && <XCircle className="inline ml-2 h-4 w-4" style={{ color: "#dc2626" }} />}
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="shard p-4 border-l-4"
          style={{ borderLeftColor: selected === current.correct ? "#16a34a" : "#dc2626" }}>
          <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--text-dim)" }}>
            {selected === current.correct ? "✓ Correct" : "✗ Incorrect"} — Explanation
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-obsidian)" }}>{current.explanation}</p>
        </div>
      )}

      {selected !== null && (
        <button onClick={handleNext}
          className="w-full h-11 rounded-2xl text-white font-bold text-sm"
          style={{ background: `linear-gradient(135deg,${meta.color},${meta.color}cc)` }}>
          {currentIndex < questions.length - 1 ? "Next Question →" : "Finish & See Results"}
        </button>
      )}
    </div>
  );
}
