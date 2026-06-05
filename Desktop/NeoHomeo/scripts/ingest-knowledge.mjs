/**
 * RAG ingestion script — embeds all homeopathic knowledge into Supabase pgvector.
 * Run: node scripts/ingest-knowledge.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load .env.local manually
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => l.split("=").map((s) => s.trim()))
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_KEY = env.GEMINI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function embed(text) {
  const result = await embedModel.embedContent(text.slice(0, 8000));
  return result.embedding.values;
}

async function upsert(docs) {
  for (const doc of docs) {
    process.stdout.write(`  Embedding: ${doc.title}...`);
    const embedding = null;
    const { error } = await supabase.from("knowledge_documents").upsert(
      { ...doc, embedding },
      { onConflict: "title" }
    );
    if (error) console.error(" ✗", error.message);
    else console.log(" ✓");
    await new Promise((r) => setTimeout(r, 200)); // rate limit
  }
}

// ─────────────────────────────────────────────
// MATERIA MEDICA DATA
// ─────────────────────────────────────────────
const materiaMedica = [
  {
    name: "Sulphur", abbr: "Sul.", category: "mineral",
    constitution: "Philosophical, untidy, warm-blooded intellectual",
    keynotes: ["Burning sensations everywhere — palms, soles, vertex", "Worse 11 AM, heat, bathing, standing", "Red orifices", "The 'ragged philosopher'", "King of Polychrests"],
    mind: ["Philosophical, speculative", "Untidy despite intelligence", "Selfish, indolent", "Delusions of grandeur", "Anxiety about salvation"],
    modalities: { worse: ["Heat", "Bathing", "11 AM", "Standing", "Rest"], better: ["Dry warm weather", "Motion", "Open air"] },
    relationships: { complementary: ["Calcarea Carb", "Psorinum"], antidotes: ["Aconite", "Camphor"] },
  },
  {
    name: "Natrum Muriaticum", abbr: "Nat-m.", category: "mineral",
    constitution: "Reserved, romantic, long-suppressed grief",
    keynotes: ["Never well since grief or humiliation", "Aversion to consolation", "Craves salt", "Weeps alone", "Mapped tongue"],
    mind: ["Introversion", "Dwells on past grief", "Aversion to consolation", "Holds grudges", "Sensitive to rudeness"],
    modalities: { worse: ["10 AM", "Sun", "Seashore", "Consolation"], better: ["Open air", "Cool bathing", "Rest"] },
    relationships: { complementary: ["Sepia", "Ignatia"], antidotes: ["Camphor", "Arsenicum"] },
  },
  {
    name: "Lycopodium", abbr: "Lyc.", category: "plant",
    constitution: "Intellectual coward — bold outside, anxious within",
    keynotes: ["Right-sided remedy", "4–8 PM aggravation", "Flatulence, bloating", "Desire for sweets", "Anticipatory anxiety"],
    mind: ["Cowardly but dictatorial at home", "Fear of failure but arrogant facade", "Anticipatory anxiety", "Intellectual but lacks confidence", "Irritable on waking"],
    modalities: { worse: ["4–8 PM", "Right side", "Warm room", "Oysters"], better: ["Motion", "Warm food", "Cool air"] },
    relationships: { complementary: ["Calcarea", "Sulphur"], antidotes: ["Camphor", "Causticum"] },
  },
  {
    name: "Nux Vomica", abbr: "Nux-v.", category: "plant",
    constitution: "Driven, impatient, over-worked executive",
    keynotes: ["Oversensitive to all stimuli", "Chilly, irritable, impatient", "Worse mornings and cold", "Sedentary habits", "Antidotes many drugs"],
    mind: ["Type-A personality", "Cannot stand contradiction", "Fault-finding", "Workaholic", "Suicidal from business failure"],
    modalities: { worse: ["Morning", "Cold", "Noise", "Light", "Spices", "Stimulants"], better: ["Evening", "Rest", "Strong pressure", "Milk"] },
    relationships: { complementary: ["Sulphur", "Sepia"], antidotes: ["Coffea", "Ignatia"] },
  },
  {
    name: "Pulsatilla", abbr: "Puls.", category: "plant",
    constitution: "Mild, yielding, weeping, seeks consolation",
    keynotes: ["Thirstless", "Worse warmth, better open air", "Wandering pains", "Changeable symptoms and mood", "Craves sympathy"],
    mind: ["Mild, gentle, yielding", "Weeps easily", "Craves sympathy", "Changeable moods", "Timid, indecisive"],
    modalities: { worse: ["Warmth", "Evening", "Rich food", "Lying on left side"], better: ["Open air", "Cold", "Motion", "Consolation"] },
    relationships: { complementary: ["Silica", "Kali Mur"], antidotes: ["Coffea", "Ignatia"] },
  },
  {
    name: "Sepia", abbr: "Sep.", category: "animal",
    constitution: "Tall, slender, artistic, emotionally open",
    keynotes: ["Indifference to loved ones", "Worse before menses", "Dragging sensation in pelvis", "Craves vinegar and pickles", "Yellow saddle across nose"],
    mind: ["Indifferent to family", "Aversion to being consoled", "Irritable", "Craves solitude", "Weeps when telling symptoms"],
    modalities: { worse: ["Cold", "Before storms", "Morning and evening", "Before menses"], better: ["Exercise", "Warmth", "Cold drinks", "Drawing up limbs"] },
    relationships: { complementary: ["Natrum Mur", "Phosphorus"], antidotes: ["Rhus Tox", "Sulphur"] },
  },
  {
    name: "Arsenicum Album", abbr: "Ars.", category: "mineral",
    constitution: "Fastidious, anxious, restless, fear of death",
    keynotes: ["Restlessness with weakness", "Burning pains relieved by heat", "Fear of death, of being alone", "Worse 1–2 AM", "Fastidious, neat"],
    mind: ["Fear of death", "Anxiety about health", "Fastidious", "Restless", "Miserly"],
    modalities: { worse: ["Cold", "1–2 AM", "Exertion", "Cold drinks"], better: ["Heat", "Hot drinks", "Motion", "Elevating head"] },
    relationships: { complementary: ["Phosphorus", "Thuja"], antidotes: ["Camphor", "Hepar Sulph"] },
  },
  {
    name: "Calcarea Carbonica", abbr: "Calc.", category: "mineral",
    constitution: "Fair, fat, flabby, slow, cold, sweaty head",
    keynotes: ["Coldness — especially cold feet in bed", "Sweaty head during sleep", "Craves eggs, indigestible things", "Slow development", "Fear of disease and insanity"],
    mind: ["Obstinate but yielding under pressure", "Fear of disease, going insane", "Methodical", "Sluggish mind", "Anxiety about future"],
    modalities: { worse: ["Cold", "Wet", "Exertion", "Full moon"], better: ["Dry weather", "Lying on painful side"] },
    relationships: { complementary: ["Belladonna", "Rhus Tox", "Sulphur"], antidotes: ["Camphor", "Ipecac"] },
  },
  {
    name: "Phosphorus", abbr: "Phos.", category: "mineral",
    constitution: "Tall, slender, artistic, emotionally open",
    keynotes: ["Burning pains", "Craves cold drinks vomited when warm", "Fear of thunderstorms", "Haemorrhage — bright red, profuse", "Sympathetic, clairvoyant"],
    mind: ["Open, expressive", "Seeks sympathy", "Clairvoyant", "Fear of dark, thunderstorms", "Easily excited then exhausted"],
    modalities: { worse: ["Evening", "Lying on left side", "Cold", "Thunderstorms"], better: ["Cold food", "Sleep", "Rubbing"] },
    relationships: { complementary: ["Arsenicum", "Carcinosin"], antidotes: ["Coffea", "Nux Vomica"] },
  },
  {
    name: "Belladonna", abbr: "Bell.", category: "plant",
    constitution: "Acute, sudden, intense onset with heat and redness",
    keynotes: ["Sudden violent onset", "3 Hs: Heat, Redness, Throbbing", "Dilated pupils", "No thirst with fever", "Worse 3 PM"],
    mind: ["Violent, furious delirium", "Biting, striking", "Sees monsters", "Confusion, hallucinations"],
    modalities: { worse: ["Touch", "Jar", "Noise", "Light", "Afternoon"], better: ["Rest", "Warmth", "Semi-erect"] },
    relationships: { complementary: ["Calcarea", "Hepar Sulph"], antidotes: ["Opium", "Coffee"] },
  },
  {
    name: "Ignatia", abbr: "Ign.", category: "plant",
    constitution: "Romantic, sensitive, idealistic — ailments from grief",
    keynotes: ["Contradictory symptoms", "Sighing", "Ailments from grief", "Hysteria", "Lump in throat"],
    mind: ["Rapid mood changes", "Silent grief", "Sighing", "Contradiction of symptoms", "Introspective"],
    modalities: { worse: ["Grief", "Tobacco", "Coffee", "Morning"], better: ["Warmth", "Lying on painful side", "Eating"] },
    relationships: { complementary: ["Natrum Mur"], antidotes: ["Pulsatilla", "Coffea"] },
  },
  {
    name: "Lachesis", abbr: "Lach.", category: "animal",
    constitution: "Loquacious, jealous, suspicious, left-sided",
    keynotes: ["Left-sided remedy", "Worse after sleep", "Cannot bear tight clothing around neck", "Bluish discoloration", "Loquacious"],
    mind: ["Loquacious", "Jealousy", "Religious mania", "Suspicious", "Worse after sleep"],
    modalities: { worse: ["Sleep", "Left side", "Tight clothing", "Warm drinks"], better: ["Open air", "Cold drinks", "Hard pressure"] },
    relationships: { complementary: ["Hepar Sulph", "Lycopodium"], antidotes: ["Arsenic", "Mercury"] },
  },
  {
    name: "Rhus Toxicodendron", abbr: "Rhus-t.", category: "plant",
    constitution: "Restless, worse initial motion, better continued motion",
    keynotes: ["Restlessness", "Worse first motion, better continued motion", "Hot bath ameliorates", "Triangular red tip of tongue", "Worse cold wet weather"],
    mind: ["Restless, must move", "Anxiety at night", "Superstitious", "Suicidal from pain"],
    modalities: { worse: ["Rest", "Cold wet weather", "Night", "Overexertion"], better: ["Continued motion", "Warmth", "Dry weather"] },
    relationships: { complementary: ["Calcarea", "Phytolacca"], antidotes: ["Grindelia", "Croton Tig"] },
  },
  {
    name: "Aconite", abbr: "Acon.", category: "plant",
    constitution: "Sudden fear and panic after exposure to cold wind",
    keynotes: ["Sudden onset after cold dry wind", "Fear of death", "Restlessness", "Better in open air", "Never well since fright"],
    mind: ["Fear of death — predicts time of death", "Panic attacks", "Restlessness", "Tossing about"],
    modalities: { worse: ["Night", "Cold wind", "Warm room", "Lying on affected side"], better: ["Open air", "Rest", "Warm sweat"] },
    relationships: { complementary: ["Sulphur", "Coffea"], antidotes: ["Nux Vomica", "Sulphur"] },
  },
  {
    name: "Bryonia", abbr: "Bry.", category: "plant",
    constitution: "Irritable, wants to lie still, worse any motion",
    keynotes: ["Worse any motion", "Dryness of all mucous membranes", "Great thirst for large quantities", "Stitching pains", "Better pressure and lying on painful side"],
    mind: ["Irritable", "Wants to go home", "Business worries while sick", "Taciturn"],
    modalities: { worse: ["Motion", "Morning", "Warmth", "Eating"], better: ["Pressure", "Lying on painful side", "Rest", "Cold"] },
    relationships: { complementary: ["Rhus Tox", "Alumina"], antidotes: ["Aconite", "Chamomilla"] },
  },
];

// ─────────────────────────────────────────────
// ORGANON APHORISMS
// ─────────────────────────────────────────────
const organonAphorisms = [
  { num: 1, text: "The physician's high and only mission is to restore the sick to health, to cure, as it is termed.", topic: "Mission of the Physician" },
  { num: 2, text: "The highest ideal of cure is rapid, gentle and permanent restoration of the health, or removal and annihilation of the disease in its whole extent, in the shortest, most reliable, and most harmless way, on easily comprehensible principles.", topic: "Ideal of Cure" },
  { num: 3, text: "If the physician clearly perceives what is to be cured in diseases, that is to say, in every individual case of disease; if he clearly perceives what is curative in medicines; and according to well-defined principles, rightly adapts what is curative in medicines to what he has clearly recognised to be morbid in the patient, so that recovery must result.", topic: "Physician's Knowledge" },
  { num: 6, text: "The unprejudiced observer recognises nothing in every individual disease except the changes in the condition of the body and mind which are perceptible to the senses. Only these morbid phenomena are the disease itself.", topic: "Disease Definition" },
  { num: 7, text: "Now, as in a disease, from which no manifest exciting or maintaining cause has to be removed, we can perceive nothing but the morbid symptoms, it must be the symptoms alone by which the disease demands and points to the remedy suited to it.", topic: "Role of Symptoms" },
  { num: 9, text: "In the healthy condition of man, the spiritual vital force animates the material body and retains all its parts in admirable, harmonious, vital operation.", topic: "Vital Force" },
  { num: 10, text: "The material organism, without the vital force, is capable of no sensation, no function, no self-preservation; it derives all sensation and performs all the functions of life solely by means of the immaterial being which animates the material organism in health and disease.", topic: "Vital Force and Body" },
  { num: 11, text: "When a person falls ill, it is only this spiritual, self-acting vital force, everywhere present in his organism, that is primarily deranged by the dynamic influence upon it of a morbific agent.", topic: "Vital Force in Disease" },
  { num: 16, text: "Our vital force, as a spirit-like dynamis, cannot be attacked and affected by injurious influences on the healthy organism, nor can it be destroyed, except by agencies that are also spirit-like in their nature.", topic: "Vital Force Susceptibility" },
  { num: 17, text: "Now, as in the cure of disease we can never directly perceive this process of extinguishing and annihilating the disease in the vital principle, only the disappearance of all morbid phenomena can show us that we have restored the health of the patient.", topic: "Cure and Vital Force" },
  { num: 22, text: "Since it is undeniable that the curative principle in medicines is not in itself perceptible, and as in pure experiments with medicines conducted by the most accurate observers, nothing can be observed that can constitute them remedies or curative agents except their property of producing distinct alterations of the condition in the health of human beings.", topic: "Curative Principle" },
  { num: 24, text: "There is, therefore, no other possible way of employing medicines usefully in diseases than either the allopathic, enantiopathic or the homoeopathic method.", topic: "Methods of Treatment" },
  { num: 26, text: "This depends on the following homoeopathic natural law of cure which was sometimes, though unheeded, observed in nature: A weaker dynamic affection is permanently extinguished in the living organism by a stronger one, if the latter (whilst differing in kind) is very similar to the former in its manifestations.", topic: "Law of Similars — Nature" },
  { num: 27, text: "The curative power of medicines therefore depends on their symptoms being similar to those of the disease, but stronger; so that each individual case of disease is most surely, radically, rapidly and permanently annihilated and removed only by a medicine capable of producing in the most similar and complete manner the totality of its symptoms.", topic: "Similia Similibus Curentur" },
  { num: 29, text: "As every disease (not surgical case) consists only in a special, morbid, dynamic derangement of the vital force in the feelings and functions, the only mission of the physician is to remove this morbid derangement.", topic: "Goal of Treatment" },
  { num: 70, text: "It is more difficult to discover the characteristic symptoms in disease which have but few decided symptoms — i.e., in diseases of a relatively simple character; and yet it is so necessary to attend especially to the characteristic, particular, and uncommon symptoms.", topic: "Characteristic Symptoms" },
  { num: 105, text: "In order to be able to cure according to nature's laws, the physician must possess a knowledge of diseases, a knowledge of medicines and the knowledge of their employment.", topic: "Physician's Triple Knowledge" },
  { num: 153, text: "In this search for a homoeopathic specific remedy — that is to say, in this comparison of the collective symptoms of the natural disease with the list of symptoms of known medicines, in order to find among these an artificial morbific agent corresponding by similarity to the disease to be cured — the more striking, singular, uncommon and peculiar (characteristic) signs and symptoms of the case of disease are chiefly and most solely to be kept in view.", topic: "Characteristic Symptoms in Case-Taking" },
  { num: 169, text: "In such cases it is found advisable to give the medicines indicated in alternation.", topic: "Alternation of Remedies" },
  { num: 246, text: "Every perceptibly progressive and strikingly increasing amelioration during treatment is a condition which, as long as it lasts, completely precludes every repetition of the administration of any medicine whatsoever.", topic: "Repetition of Dose" },
  { num: 269, text: "The homoeopathic system of medicine develops for its special use, to a hitherto unheard of degree, the inner medicinal powers of the crude substances by a process peculiar to it and which has hitherto never been tried, whereby only they become immeasurably and penetratingly efficacious and remedial, even those that in the crude state give no evidence of the slightest medicinal power on the human body.", topic: "Potentisation" },
  { num: 270, text: "In order to prepare the homoeopathic dilutions, one part of the substance is first mixed with 99 parts of a suitable vehicle and potentised. This is done by rubbing in a mortar, or shaking in a phial.", topic: "Preparation of Potencies" },
  { num: 272, text: "Such a globule placed dry upon the tongue is one of the smallest doses for a moderate recent case of illness. Here but few nerves are touched by the medicine. A larger number of nerves are affected when it is dissolved in water.", topic: "Dose — Single Globule" },
];

// ─────────────────────────────────────────────
// REPERTORY RUBRICS (Kent's)
// ─────────────────────────────────────────────
const repertoryRubrics = [
  { rubric: "MIND; ANXIETY; health, about", remedies: [{ name: "Arsenicum Album", grade: 3 }, { name: "Calcarea Carb", grade: 3 }, { name: "Nitric Acid", grade: 2 }, { name: "Phosphorus", grade: 2 }] },
  { rubric: "MIND; FEAR; death, of", remedies: [{ name: "Arsenicum Album", grade: 3 }, { name: "Aconite", grade: 3 }, { name: "Platina", grade: 2 }, { name: "Calcarea Carb", grade: 2 }] },
  { rubric: "MIND; GRIEF; ailments from", remedies: [{ name: "Ignatia", grade: 3 }, { name: "Natrum Muriaticum", grade: 3 }, { name: "Staphysagria", grade: 2 }, { name: "Causticum", grade: 2 }] },
  { rubric: "MIND; JEALOUSY", remedies: [{ name: "Lachesis", grade: 3 }, { name: "Hyoscyamus", grade: 3 }, { name: "Nux Vomica", grade: 2 }, { name: "Pulsatilla", grade: 1 }] },
  { rubric: "MIND; CONSOLATION; agg.", remedies: [{ name: "Natrum Muriaticum", grade: 3 }, { name: "Sepia", grade: 3 }, { name: "Lilium Tigrinum", grade: 2 }, { name: "Silica", grade: 1 }] },
  { rubric: "MIND; WEEPING; consolation; amel.", remedies: [{ name: "Pulsatilla", grade: 3 }, { name: "Phosphorus", grade: 2 }, { name: "Calcarea Phos", grade: 1 }] },
  { rubric: "GENERALS; HEAT; lack of vital", remedies: [{ name: "Calcarea Carb", grade: 3 }, { name: "Silica", grade: 3 }, { name: "Baryta Carb", grade: 2 }, { name: "Arsenicum Album", grade: 2 }] },
  { rubric: "GENERALS; FOOD and DRINKS; salt; desire", remedies: [{ name: "Natrum Muriaticum", grade: 3 }, { name: "Calcarea Carb", grade: 2 }, { name: "Phosphorus", grade: 2 }, { name: "Veratrum Album", grade: 2 }] },
  { rubric: "GENERALS; FOOD and DRINKS; sweets; desire", remedies: [{ name: "Lycopodium", grade: 3 }, { name: "Argentum Nitricum", grade: 3 }, { name: "Sulphur", grade: 2 }, { name: "China", grade: 2 }] },
  { rubric: "GENERALS; MOTION; amel.", remedies: [{ name: "Rhus Toxicodendron", grade: 3 }, { name: "Pulsatilla", grade: 2 }, { name: "Ferrum", grade: 2 }, { name: "Dulcamara", grade: 1 }] },
  { rubric: "GENERALS; MOTION; agg.", remedies: [{ name: "Bryonia", grade: 3 }, { name: "Colocynthis", grade: 2 }, { name: "Nux Vomica", grade: 2 }, { name: "Ledum", grade: 1 }] },
  { rubric: "GENERALS; SIDE; right", remedies: [{ name: "Lycopodium", grade: 3 }, { name: "Belladonna", grade: 2 }, { name: "Chelidonium", grade: 3 }, { name: "Apis", grade: 2 }] },
  { rubric: "GENERALS; SIDE; left", remedies: [{ name: "Lachesis", grade: 3 }, { name: "Spigelia", grade: 3 }, { name: "Natrum Muriaticum", grade: 2 }, { name: "Rhus Tox", grade: 1 }] },
  { rubric: "GENERALS; AGGRAVATION; 11 AM", remedies: [{ name: "Sulphur", grade: 3 }, { name: "Natrum Muriaticum", grade: 2 }, { name: "Arsenicum Album", grade: 1 }] },
  { rubric: "GENERALS; AGGRAVATION; 4–8 PM", remedies: [{ name: "Lycopodium", grade: 3 }, { name: "Helleborus", grade: 2 }, { name: "Colchicum", grade: 2 }] },
  { rubric: "SKIN; ITCHING; warmth; agg.", remedies: [{ name: "Sulphur", grade: 3 }, { name: "Psorinum", grade: 3 }, { name: "Mezereum", grade: 2 }, { name: "Oleander", grade: 2 }] },
  { rubric: "HEAD; PAIN; burning; vertex", remedies: [{ name: "Sulphur", grade: 3 }, { name: "Belladonna", grade: 2 }, { name: "Glonoine", grade: 2 }] },
  { rubric: "STOMACH; APPETITE; increased; 11 AM", remedies: [{ name: "Sulphur", grade: 3 }, { name: "Zinc", grade: 2 }, { name: "Natrum Carb", grade: 1 }] },
  { rubric: "MIND; LOQUACITY", remedies: [{ name: "Lachesis", grade: 3 }, { name: "Hyoscyamus", grade: 3 }, { name: "Coffea", grade: 2 }, { name: "Stramonium", grade: 2 }] },
  { rubric: "MIND; ANGER; contradiction; from", remedies: [{ name: "Nux Vomica", grade: 3 }, { name: "Bryonia", grade: 2 }, { name: "Ignatia", grade: 2 }, { name: "Lycopodium", grade: 2 }] },
];

// ─────────────────────────────────────────────
// BUILD DOCUMENTS & INGEST
// ─────────────────────────────────────────────
async function buildAndIngest() {
  console.log("\n🌿 NeoHomeo AI — RAG Knowledge Ingestion\n");

  // 1. Materia Medica
  console.log("📚 Ingesting Materia Medica...");
  const mmDocs = materiaMedica.map((r) => ({
    source: "materia_medica",
    category: r.name,
    title: `Materia Medica: ${r.name} (${r.abbr})`,
    content: [
      `REMEDY: ${r.name} (${r.abbr}) — ${r.category.toUpperCase()}`,
      `CONSTITUTION: ${r.constitution}`,
      `KEYNOTES:\n${r.keynotes.map((k) => `• ${k}`).join("\n")}`,
      `MIND:\n${r.mind.map((m) => `• ${m}`).join("\n")}`,
      `MODALITIES:\nWorse: ${r.modalities.worse.join(", ")}\nBetter: ${r.modalities.better.join(", ")}`,
      `RELATIONSHIPS:\nComplementary: ${r.relationships.complementary?.join(", ") || "—"}\nAntidotes: ${r.relationships.antidotes?.join(", ") || "—"}`,
    ].join("\n\n"),
    metadata: { remedy: r.name, abbreviation: r.abbr, category: r.category },
  }));
  await upsert(mmDocs);

  // 2. Organon
  console.log("\n📖 Ingesting Organon Aphorisms...");
  const organonDocs = organonAphorisms.map((a) => ({
    source: "organon",
    category: `Aphorism §${a.num}`,
    title: `Organon §${a.num}: ${a.topic}`,
    content: `APHORISM §${a.num} — ${a.topic.toUpperCase()}\n\n"${a.text}"\n\n— Samuel Hahnemann, Organon of Medicine (6th Edition)`,
    metadata: { aphorism_number: a.num, topic: a.topic },
  }));
  await upsert(organonDocs);

  // 3. Repertory
  console.log("\n🗂 Ingesting Repertory Rubrics...");
  const repDocs = repertoryRubrics.map((r) => ({
    source: "repertory",
    category: r.rubric.split(";")[0].trim(),
    title: `Repertory: ${r.rubric}`,
    content: [
      `RUBRIC: ${r.rubric}`,
      `\nREMEDIES (by grade):`,
      `Grade 3 (Bold): ${r.remedies.filter((x) => x.grade === 3).map((x) => x.name).join(", ") || "—"}`,
      `Grade 2 (Italic): ${r.remedies.filter((x) => x.grade === 2).map((x) => x.name).join(", ") || "—"}`,
      `Grade 1 (Plain): ${r.remedies.filter((x) => x.grade === 1).map((x) => x.name).join(", ") || "—"}`,
      `\nFULL LIST: ${r.remedies.map((x) => `${x.name} [${x.grade}]`).join(", ")}`,
    ].join("\n"),
    metadata: { rubric: r.rubric, top_remedy: r.remedies[0]?.name },
  }));
  await upsert(repDocs);

  console.log(`\n✅ Done! Ingested ${mmDocs.length + organonDocs.length + repDocs.length} documents into Supabase.\n`);
}

buildAndIngest().catch(console.error);
