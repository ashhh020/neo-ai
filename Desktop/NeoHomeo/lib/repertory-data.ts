// Kent Repertory — public domain data
// Grades: 3=bold (highest), 2=italic, 1=plain

export interface Remedy {
  name: string;
  abbrev: string;
  grade: 1 | 2 | 3;
}

export interface Rubric {
  id: string;
  chapter: string;
  section: string;
  path: string;
  remedies: Remedy[];
}

export const KENT_REPERTORY: Rubric[] = [
  // ─── MIND ───────────────────────────────────────────────────────────────
  { id:"m001", chapter:"Mind", section:"Fear", path:"MIND; FEAR; death, of",
    remedies:[{name:"Aconite",abbrev:"Acon.",grade:3},{name:"Arsenicum",abbrev:"Ars.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Nitric Acid",abbrev:"Nit-ac.",grade:2},{name:"Phosphorus",abbrev:"Phos.",grade:2},{name:"Platina",abbrev:"Plat.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:1},{name:"Sepia",abbrev:"Sep.",grade:1},{name:"Stramonium",abbrev:"Stram.",grade:2},{name:"Veratrum",abbrev:"Verat.",grade:1}]},
  { id:"m002", chapter:"Mind", section:"Fear", path:"MIND; FEAR; alone, being",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:3},{name:"Bismuth",abbrev:"Bism.",grade:3},{name:"Cactus",abbrev:"Cact.",grade:1},{name:"Drosera",abbrev:"Dros.",grade:1},{name:"Kali-carb",abbrev:"Kali-c.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:2},{name:"Phosphorus",abbrev:"Phos.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:1},{name:"Staphysagria",abbrev:"Staph.",grade:1}]},
  { id:"m003", chapter:"Mind", section:"Fear", path:"MIND; FEAR; crowd, in a",
    remedies:[{name:"Aconite",abbrev:"Acon.",grade:2},{name:"Argentum Nit",abbrev:"Arg-n.",grade:3},{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Gelsemium",abbrev:"Gels.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:1}]},
  { id:"m004", chapter:"Mind", section:"Fear", path:"MIND; FEAR; disease, of impending",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:3},{name:"Lac-c",abbrev:"Lac-c.",grade:1},{name:"Nitric Acid",abbrev:"Nit-ac.",grade:2},{name:"Phosphorus",abbrev:"Phos.",grade:2}]},
  { id:"m005", chapter:"Mind", section:"Fear", path:"MIND; FEAR; ghosts, of",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Calcarea",abbrev:"Calc.",grade:3},{name:"Carbo Veg",abbrev:"Carb-v.",grade:1},{name:"Lycopodium",abbrev:"Lyc.",grade:1},{name:"Pulsatilla",abbrev:"Puls.",grade:2},{name:"Stramonium",abbrev:"Stram.",grade:2}]},
  { id:"m006", chapter:"Mind", section:"Fear", path:"MIND; FEAR; insanity, of",
    remedies:[{name:"Argentum Nit",abbrev:"Arg-n.",grade:2},{name:"Calcarea",abbrev:"Calc.",grade:3},{name:"Cannabis",abbrev:"Cann-i.",grade:2},{name:"Cimic",abbrev:"Cimic.",grade:2},{name:"Mancinella",abbrev:"Manc.",grade:2}]},
  { id:"m007", chapter:"Mind", section:"Grief", path:"MIND; GRIEF; ailments from",
    remedies:[{name:"Causticum",abbrev:"Caust.",grade:2},{name:"Ignatia",abbrev:"Ign.",grade:3},{name:"Natrum Mur",abbrev:"Nat-m.",grade:3},{name:"Phosphoric Acid",abbrev:"Ph-ac.",grade:3},{name:"Staphysagria",abbrev:"Staph.",grade:2}]},
  { id:"m008", chapter:"Mind", section:"Grief", path:"MIND; GRIEF; silent",
    remedies:[{name:"Ignatia",abbrev:"Ign.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:3},{name:"Pulsatilla",abbrev:"Puls.",grade:2},{name:"Staphysagria",abbrev:"Staph.",grade:2}]},
  { id:"m009", chapter:"Mind", section:"Anxiety", path:"MIND; ANXIETY; health, about",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:3},{name:"Kali-ars",abbrev:"Kali-ar.",grade:2},{name:"Nitric Acid",abbrev:"Nit-ac.",grade:2},{name:"Phosphorus",abbrev:"Phos.",grade:2}]},
  { id:"m010", chapter:"Mind", section:"Anxiety", path:"MIND; ANXIETY; future, about",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:3},{name:"Lycopodium",abbrev:"Lyc.",grade:3},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Phosphorus",abbrev:"Phos.",grade:2},{name:"Psorinum",abbrev:"Psor.",grade:2},{name:"Sulphur",abbrev:"Sul.",grade:2}]},
  { id:"m011", chapter:"Mind", section:"Anxiety", path:"MIND; ANXIETY; conscience, of (as if guilty)",
    remedies:[{name:"Digitalis",abbrev:"Dig.",grade:2},{name:"Hyoscyamus",abbrev:"Hyos.",grade:2},{name:"Obadiah",abbrev:"Obia.",grade:1},{name:"Spongia",abbrev:"Spong.",grade:2}]},
  { id:"m012", chapter:"Mind", section:"Consolation", path:"MIND; CONSOLATION; aggravates",
    remedies:[{name:"Ignatia",abbrev:"Ign.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:3},{name:"Nitric Acid",abbrev:"Nit-ac.",grade:1},{name:"Sepia",abbrev:"Sep.",grade:2},{name:"Silicea",abbrev:"Sil.",grade:1}]},
  { id:"m013", chapter:"Mind", section:"Delusions", path:"MIND; DELUSIONS; great person, being a",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:1},{name:"Platinum",abbrev:"Plat.",grade:3},{name:"Sulphur",abbrev:"Sul.",grade:3},{name:"Veratrum",abbrev:"Verat.",grade:2}]},
  { id:"m014", chapter:"Mind", section:"Delusions", path:"MIND; DELUSIONS; superhuman, being",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:1},{name:"Cannabis",abbrev:"Cann-i.",grade:3},{name:"Lachesis",abbrev:"Lach.",grade:2},{name:"Platinum",abbrev:"Plat.",grade:2},{name:"Stramonium",abbrev:"Stram.",grade:2}]},
  { id:"m015", chapter:"Mind", section:"Weeping", path:"MIND; WEEPING; causeless",
    remedies:[{name:"Ignatia",abbrev:"Ign.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:1},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Phosphorus",abbrev:"Phos.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:3},{name:"Sepia",abbrev:"Sep.",grade:2}]},
  { id:"m016", chapter:"Mind", section:"Weeping", path:"MIND; WEEPING; music, from",
    remedies:[{name:"Graphites",abbrev:"Graph.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Phosphorus",abbrev:"Phos.",grade:2}]},
  { id:"m017", chapter:"Mind", section:"Irresolution", path:"MIND; IRRESOLUTION; general",
    remedies:[{name:"Baryta Carb",abbrev:"Bar-c.",grade:2},{name:"Lac-c",abbrev:"Lac-c.",grade:1},{name:"Lycopodium",abbrev:"Lyc.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:3},{name:"Silicea",abbrev:"Sil.",grade:1}]},
  { id:"m018", chapter:"Mind", section:"Fastidious", path:"MIND; FASTIDIOUS",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:1},{name:"Nux Vomica",abbrev:"Nux-v.",grade:3}]},
  { id:"m019", chapter:"Mind", section:"Jealousy", path:"MIND; JEALOUSY",
    remedies:[{name:"Apis",abbrev:"Apis.",grade:2},{name:"Hyoscyamus",abbrev:"Hyos.",grade:3},{name:"Lachesis",abbrev:"Lach.",grade:3},{name:"Nux Vomica",abbrev:"Nux-v.",grade:1},{name:"Pulsatilla",abbrev:"Puls.",grade:1},{name:"Stramonium",abbrev:"Stram.",grade:1}]},
  { id:"m020", chapter:"Mind", section:"Anger", path:"MIND; ANGER; trifles, at",
    remedies:[{name:"Ignatia",abbrev:"Ign.",grade:2},{name:"Nux Vomica",abbrev:"Nux-v.",grade:3},{name:"Platinum",abbrev:"Plat.",grade:2},{name:"Sepia",abbrev:"Sep.",grade:2},{name:"Staphysagria",abbrev:"Staph.",grade:3}]},
  { id:"m021", chapter:"Mind", section:"Anger", path:"MIND; ANGER; contradiction, from",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Ignatia",abbrev:"Ign.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:2},{name:"Nitric Acid",abbrev:"Nit-ac.",grade:2},{name:"Nux Vomica",abbrev:"Nux-v.",grade:3},{name:"Sepia",abbrev:"Sep.",grade:2},{name:"Silicea",abbrev:"Sil.",grade:2}]},
  { id:"m022", chapter:"Mind", section:"Timidity", path:"MIND; TIMIDITY; bashful",
    remedies:[{name:"Baryta Carb",abbrev:"Bar-c.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:2},{name:"Silicea",abbrev:"Sil.",grade:3}]},
  { id:"m023", chapter:"Mind", section:"Obstinate", path:"MIND; OBSTINATE",
    remedies:[{name:"Argentum Nit",abbrev:"Arg-n.",grade:1},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Causticum",abbrev:"Caust.",grade:2},{name:"China",abbrev:"Chin.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:2},{name:"Silicea",abbrev:"Sil.",grade:3},{name:"Sulphur",abbrev:"Sul.",grade:2}]},
  { id:"m024", chapter:"Mind", section:"Cheerful", path:"MIND; CHEERFUL; alternating with sadness",
    remedies:[{name:"Aconite",abbrev:"Acon.",grade:2},{name:"Calcarea",abbrev:"Calc.",grade:1},{name:"Crocus",abbrev:"Croc.",grade:3},{name:"Ignatia",abbrev:"Ign.",grade:3},{name:"Nux Vomica",abbrev:"Nux-v.",grade:1},{name:"Platinum",abbrev:"Plat.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:2}]},
  { id:"m025", chapter:"Mind", section:"Sensitive", path:"MIND; SENSITIVE; noise, to",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Belladonna",abbrev:"Bell.",grade:3},{name:"Coffea",abbrev:"Coff.",grade:3},{name:"Ignatia",abbrev:"Ign.",grade:2},{name:"Nux Vomica",abbrev:"Nux-v.",grade:3},{name:"Phosphorus",abbrev:"Phos.",grade:3}]},
  { id:"m026", chapter:"Mind", section:"Sensitive", path:"MIND; SENSITIVE; reprimands, to",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Carcinosin",abbrev:"Carc.",grade:2},{name:"Ignatia",abbrev:"Ign.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Staphysagria",abbrev:"Staph.",grade:3}]},
  { id:"m027", chapter:"Mind", section:"Suspicious", path:"MIND; SUSPICIOUS",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Hyoscyamus",abbrev:"Hyos.",grade:3},{name:"Lachesis",abbrev:"Lach.",grade:3},{name:"Lycopodium",abbrev:"Lyc.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:1},{name:"Sulphur",abbrev:"Sul.",grade:2}]},
  { id:"m028", chapter:"Mind", section:"Hurry", path:"MIND; HURRY; occupation, in",
    remedies:[{name:"Argentum Nit",abbrev:"Arg-n.",grade:3},{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Lachesis",abbrev:"Lach.",grade:2},{name:"Lilium Tig",abbrev:"Lil-t.",grade:3},{name:"Medorrhinum",abbrev:"Med.",grade:2},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2},{name:"Sulphur",abbrev:"Sul.",grade:2}]},
  { id:"m029", chapter:"Mind", section:"Sadness", path:"MIND; SADNESS; general",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:3},{name:"Aurum",abbrev:"Aur.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Ignatia",abbrev:"Ign.",grade:3},{name:"Natrum Mur",abbrev:"Nat-m.",grade:3},{name:"Phosphoric Acid",abbrev:"Ph-ac.",grade:3},{name:"Pulsatilla",abbrev:"Puls.",grade:3},{name:"Sepia",abbrev:"Sep.",grade:3}]},
  { id:"m030", chapter:"Mind", section:"Suicidal", path:"MIND; SUICIDAL disposition",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Aurum",abbrev:"Aur.",grade:3},{name:"Hepar Sulph",abbrev:"Hep.",grade:2},{name:"Mercurius",abbrev:"Merc.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2}]},

  // ─── HEAD ────────────────────────────────────────────────────────────────
  { id:"h001", chapter:"Head", section:"Pain", path:"HEAD; PAIN; temples",
    remedies:[{name:"Belladonna",abbrev:"Bell.",grade:3},{name:"Bryonia",abbrev:"Bry.",grade:3},{name:"Gelsemium",abbrev:"Gels.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:3},{name:"Pulsatilla",abbrev:"Puls.",grade:2},{name:"Spigelia",abbrev:"Spig.",grade:2}]},
  { id:"h002", chapter:"Head", section:"Pain", path:"HEAD; PAIN; forehead",
    remedies:[{name:"Belladonna",abbrev:"Bell.",grade:3},{name:"Bryonia",abbrev:"Bry.",grade:2},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Gelsemium",abbrev:"Gels.",grade:3},{name:"Iris",abbrev:"Iris.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2}]},
  { id:"h003", chapter:"Head", section:"Pain", path:"HEAD; PAIN; occiput",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Gelsemium",abbrev:"Gels.",grade:3},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2},{name:"Silica",abbrev:"Sil.",grade:2}]},
  { id:"h004", chapter:"Head", section:"Pain", path:"HEAD; PAIN; bursting; splitting",
    remedies:[{name:"Belladonna",abbrev:"Bell.",grade:3},{name:"Bryonia",abbrev:"Bry.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Glonoine",abbrev:"Glon.",grade:3},{name:"Sulphur",abbrev:"Sul.",grade:2}]},
  { id:"h005", chapter:"Head", section:"Pain", path:"HEAD; PAIN; menses; during",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Lachesis",abbrev:"Lach.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:3},{name:"Pulsatilla",abbrev:"Puls.",grade:2},{name:"Sepia",abbrev:"Sep.",grade:2}]},
  { id:"h006", chapter:"Head", section:"Vertigo", path:"HEAD; VERTIGO; looking up",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:3},{name:"Silicea",abbrev:"Sil.",grade:2}]},

  // ─── EYES ────────────────────────────────────────────────────────────────
  { id:"e001", chapter:"Eye", section:"Inflammation", path:"EYE; INFLAMMATION; conjunctiva",
    remedies:[{name:"Apis",abbrev:"Apis.",grade:3},{name:"Argentum Nit",abbrev:"Arg-n.",grade:3},{name:"Belladonna",abbrev:"Bell.",grade:2},{name:"Euphrasia",abbrev:"Euph.",grade:3},{name:"Hepar Sulph",abbrev:"Hep.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:3}]},
  { id:"e002", chapter:"Eye", section:"Discharge", path:"EYE; DISCHARGES; thick; yellow",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Hepar Sulph",abbrev:"Hep.",grade:2},{name:"Mercurius",abbrev:"Merc.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:3},{name:"Silica",abbrev:"Sil.",grade:2}]},

  // ─── NOSE ────────────────────────────────────────────────────────────────
  { id:"n001", chapter:"Nose", section:"Coryza", path:"NOSE; CORYZA; fluent",
    remedies:[{name:"Allium Cepa",abbrev:"All-c.",grade:3},{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Euphrasia",abbrev:"Euph.",grade:3},{name:"Mercurius",abbrev:"Merc.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:3},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2}]},
  { id:"n002", chapter:"Nose", section:"Epistaxis", path:"NOSE; EPISTAXIS; blowing nose, on",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:1},{name:"Carbo Veg",abbrev:"Carb-v.",grade:1},{name:"Nitric Acid",abbrev:"Nit-ac.",grade:2},{name:"Phosphorus",abbrev:"Phos.",grade:3}]},
  { id:"n003", chapter:"Nose", section:"Smell", path:"NOSE; SMELL; acute",
    remedies:[{name:"Belladonna",abbrev:"Bell.",grade:2},{name:"Coffea",abbrev:"Coff.",grade:2},{name:"Ignatia",abbrev:"Ign.",grade:2},{name:"Nux Vomica",abbrev:"Nux-v.",grade:3}]},

  // ─── MOUTH / THROAT ──────────────────────────────────────────────────────
  { id:"mt001", chapter:"Mouth", section:"Dryness", path:"MOUTH; DRYNESS; general",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Belladonna",abbrev:"Bell.",grade:3},{name:"Bryonia",abbrev:"Bry.",grade:3},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:3}]},
  { id:"mt002", chapter:"Mouth", section:"Taste", path:"MOUTH; TASTE; bitter",
    remedies:[{name:"Bryonia",abbrev:"Bry.",grade:3},{name:"China",abbrev:"Chin.",grade:3},{name:"Mercurius",abbrev:"Merc.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Nux Vomica",abbrev:"Nux-v.",grade:3},{name:"Pulsatilla",abbrev:"Puls.",grade:2}]},
  { id:"mt003", chapter:"Throat", section:"Inflammation", path:"THROAT; INFLAMMATION; general",
    remedies:[{name:"Apis",abbrev:"Apis.",grade:3},{name:"Belladonna",abbrev:"Bell.",grade:3},{name:"Hepar Sulph",abbrev:"Hep.",grade:2},{name:"Lachesis",abbrev:"Lach.",grade:3},{name:"Mercurius",abbrev:"Merc.",grade:3},{name:"Phytolacca",abbrev:"Phyt.",grade:3}]},
  { id:"mt004", chapter:"Throat", section:"Swallowing", path:"THROAT; SWALLOWING; difficult",
    remedies:[{name:"Baryta Carb",abbrev:"Bar-c.",grade:2},{name:"Belladonna",abbrev:"Bell.",grade:2},{name:"Lachesis",abbrev:"Lach.",grade:3},{name:"Mercurius",abbrev:"Merc.",grade:2},{name:"Phytolacca",abbrev:"Phyt.",grade:2}]},

  // ─── STOMACH ─────────────────────────────────────────────────────────────
  { id:"s001", chapter:"Stomach", section:"Appetite", path:"STOMACH; APPETITE; increased",
    remedies:[{name:"China",abbrev:"Chin.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Phosphorus",abbrev:"Phos.",grade:3},{name:"Sulphur",abbrev:"Sul.",grade:3}]},
  { id:"s002", chapter:"Stomach", section:"Appetite", path:"STOMACH; APPETITE; wanting",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"China",abbrev:"Chin.",grade:2},{name:"Ignatia",abbrev:"Ign.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2}]},
  { id:"s003", chapter:"Stomach", section:"Hunger", path:"STOMACH; HUNGRY; 11 AM",
    remedies:[{name:"Natrum Mur",abbrev:"Nat-m.",grade:1},{name:"Sulphur",abbrev:"Sul.",grade:3},{name:"Zinc",abbrev:"Zinc.",grade:2}]},
  { id:"s004", chapter:"Stomach", section:"Thirst", path:"STOMACH; THIRST; excessive",
    remedies:[{name:"Aconite",abbrev:"Acon.",grade:2},{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Bryonia",abbrev:"Bry.",grade:3},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Phosphorus",abbrev:"Phos.",grade:2},{name:"Sulphur",abbrev:"Sul.",grade:2}]},
  { id:"s005", chapter:"Stomach", section:"Thirst", path:"STOMACH; THIRSTLESS",
    remedies:[{name:"Apis",abbrev:"Apis.",grade:3},{name:"Gelsemium",abbrev:"Gels.",grade:3},{name:"Pulsatilla",abbrev:"Puls.",grade:3}]},
  { id:"s006", chapter:"Stomach", section:"Nausea", path:"STOMACH; NAUSEA; motion, from",
    remedies:[{name:"Bryonia",abbrev:"Bry.",grade:2},{name:"Cocculus",abbrev:"Cocc.",grade:3},{name:"Ipecac",abbrev:"Ip.",grade:3},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2},{name:"Petroleum",abbrev:"Petr.",grade:3},{name:"Tabacum",abbrev:"Tab.",grade:3}]},
  { id:"s007", chapter:"Stomach", section:"Desires", path:"STOMACH; DESIRES; fat",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Nitric Acid",abbrev:"Nit-ac.",grade:2},{name:"Sulphur",abbrev:"Sul.",grade:2}]},
  { id:"s008", chapter:"Stomach", section:"Desires", path:"STOMACH; DESIRES; sweets",
    remedies:[{name:"Argentum Nit",abbrev:"Arg-n.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"China",abbrev:"Chin.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:2},{name:"Sulphur",abbrev:"Sul.",grade:2}]},
  { id:"s009", chapter:"Stomach", section:"Desires", path:"STOMACH; DESIRES; salt",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:1},{name:"Carbo Veg",abbrev:"Carb-v.",grade:1},{name:"Natrum Mur",abbrev:"Nat-m.",grade:3},{name:"Phosphorus",abbrev:"Phos.",grade:2},{name:"Veratrum",abbrev:"Verat.",grade:2}]},
  { id:"s010", chapter:"Stomach", section:"Aversions", path:"STOMACH; AVERSION; meat",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:1},{name:"Graphites",abbrev:"Graph.",grade:2},{name:"Nitric Acid",abbrev:"Nit-ac.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:3},{name:"Sepia",abbrev:"Sep.",grade:2}]},

  // ─── ABDOMEN ─────────────────────────────────────────────────────────────
  { id:"ab001", chapter:"Abdomen", section:"Flatulence", path:"ABDOMEN; FLATULENCE; general",
    remedies:[{name:"Argentum Nit",abbrev:"Arg-n.",grade:3},{name:"Carbo Veg",abbrev:"Carb-v.",grade:3},{name:"China",abbrev:"Chin.",grade:3},{name:"Lycopodium",abbrev:"Lyc.",grade:3},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2}]},
  { id:"ab002", chapter:"Abdomen", section:"Pain", path:"ABDOMEN; PAIN; colic; general",
    remedies:[{name:"Belladonna",abbrev:"Bell.",grade:2},{name:"China",abbrev:"Chin.",grade:2},{name:"Colocynthis",abbrev:"Coloc.",grade:3},{name:"Dioscorea",abbrev:"Dios.",grade:3},{name:"Magnesia Phos",abbrev:"Mag-p.",grade:3},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2}]},

  // ─── RECTUM / STOOL ──────────────────────────────────────────────────────
  { id:"r001", chapter:"Rectum", section:"Constipation", path:"RECTUM; CONSTIPATION; general",
    remedies:[{name:"Alumina",abbrev:"Alum.",grade:3},{name:"Bryonia",abbrev:"Bry.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Nux Vomica",abbrev:"Nux-v.",grade:3},{name:"Opium",abbrev:"Op.",grade:3},{name:"Silicea",abbrev:"Sil.",grade:3}]},
  { id:"r002", chapter:"Rectum", section:"Diarrhoea", path:"RECTUM; DIARRHOEA; morning; driving out of bed",
    remedies:[{name:"Aloe",abbrev:"Aloe.",grade:3},{name:"Natrum Sulph",abbrev:"Nat-s.",grade:3},{name:"Phosphorus",abbrev:"Phos.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:2},{name:"Sulphur",abbrev:"Sul.",grade:3}]},
  { id:"r003", chapter:"Rectum", section:"Diarrhoea", path:"RECTUM; DIARRHOEA; eating; after",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"China",abbrev:"Chin.",grade:2},{name:"Croton Tig",abbrev:"Crot-t.",grade:3},{name:"Ferrum",abbrev:"Ferr.",grade:3},{name:"Phosphorus",abbrev:"Phos.",grade:2}]},

  // ─── URINARY ─────────────────────────────────────────────────────────────
  { id:"u001", chapter:"Bladder", section:"Urging", path:"BLADDER; URGING; constant",
    remedies:[{name:"Cannabis Sat",abbrev:"Cann-s.",grade:3},{name:"Causticum",abbrev:"Caust.",grade:3},{name:"Equisetum",abbrev:"Equis.",grade:3},{name:"Mercurius",abbrev:"Merc.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:1}]},
  { id:"u002", chapter:"Bladder", section:"Urging", path:"BLADDER; URGING; night",
    remedies:[{name:"Baryta Carb",abbrev:"Bar-c.",grade:2},{name:"Causticum",abbrev:"Caust.",grade:2},{name:"Hepar Sulph",abbrev:"Hep.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2}]},

  // ─── FEMALE ──────────────────────────────────────────────────────────────
  { id:"f001", chapter:"Female", section:"Menses", path:"FEMALE; MENSES; copious",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:3},{name:"China",abbrev:"Chin.",grade:3},{name:"Lachesis",abbrev:"Lach.",grade:2},{name:"Phosphorus",abbrev:"Phos.",grade:2},{name:"Sabina",abbrev:"Sabin.",grade:3}]},
  { id:"f002", chapter:"Female", section:"Menses", path:"FEMALE; MENSES; scanty",
    remedies:[{name:"Graphites",abbrev:"Graph.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:3},{name:"Sepia",abbrev:"Sep.",grade:3}]},
  { id:"f003", chapter:"Female", section:"Menses", path:"FEMALE; MENSES; late; too",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Graphites",abbrev:"Graph.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:3},{name:"Sepia",abbrev:"Sep.",grade:2}]},
  { id:"f004", chapter:"Female", section:"Leucorrhoea", path:"FEMALE; LEUCORRHOEA; milky",
    remedies:[{name:"Borax",abbrev:"Bor.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:3},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:2},{name:"Sepia",abbrev:"Sep.",grade:2}]},

  // ─── RESPIRATORY ─────────────────────────────────────────────────────────
  { id:"re001", chapter:"Respiratory", section:"Asthma", path:"RESPIRATORY; ASTHMA; general",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:3},{name:"Carbo Veg",abbrev:"Carb-v.",grade:2},{name:"Ipecac",abbrev:"Ip.",grade:3},{name:"Kali-carb",abbrev:"Kali-c.",grade:3},{name:"Lachesis",abbrev:"Lach.",grade:2},{name:"Medorrhinum",abbrev:"Med.",grade:2},{name:"Natrum Sulph",abbrev:"Nat-s.",grade:3},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:2},{name:"Spongia",abbrev:"Spong.",grade:2}]},
  { id:"re002", chapter:"Respiratory", section:"Cough", path:"RESPIRATORY; COUGH; night",
    remedies:[{name:"Bryonia",abbrev:"Bry.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Drosera",abbrev:"Dros.",grade:3},{name:"Hyoscyamus",abbrev:"Hyos.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:2},{name:"Rumex",abbrev:"Rumx.",grade:3}]},
  { id:"re003", chapter:"Respiratory", section:"Cough", path:"RESPIRATORY; COUGH; barking",
    remedies:[{name:"Belladonna",abbrev:"Bell.",grade:3},{name:"Drosera",abbrev:"Dros.",grade:2},{name:"Spongia",abbrev:"Spong.",grade:3},{name:"Stramonium",abbrev:"Stram.",grade:2}]},
  { id:"re004", chapter:"Respiratory", section:"Cough", path:"RESPIRATORY; COUGH; eating; after",
    remedies:[{name:"Kali-bich",abbrev:"Kali-bi.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:2}]},

  // ─── BACK ────────────────────────────────────────────────────────────────
  { id:"b001", chapter:"Back", section:"Pain", path:"BACK; PAIN; lumbar region",
    remedies:[{name:"Berberis",abbrev:"Berb.",grade:2},{name:"Bryonia",abbrev:"Bry.",grade:2},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Kali-carb",abbrev:"Kali-c.",grade:3},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2},{name:"Rhus Tox",abbrev:"Rhus-t.",grade:3},{name:"Sepia",abbrev:"Sep.",grade:3}]},
  { id:"b002", chapter:"Back", section:"Pain", path:"BACK; PAIN; stiffness; morning",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Kali-carb",abbrev:"Kali-c.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:1},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2},{name:"Rhus Tox",abbrev:"Rhus-t.",grade:3},{name:"Sulphur",abbrev:"Sul.",grade:2}]},

  // ─── EXTREMITIES ─────────────────────────────────────────────────────────
  { id:"ex001", chapter:"Extremities", section:"Pain", path:"EXTREMITIES; PAIN; joints; wandering",
    remedies:[{name:"Benzoic Acid",abbrev:"Benz-ac.",grade:1},{name:"Bryonia",abbrev:"Bry.",grade:2},{name:"Cimicifuga",abbrev:"Cimic.",grade:2},{name:"Kali-sulph",abbrev:"Kali-s.",grade:3},{name:"Pulsatilla",abbrev:"Puls.",grade:3},{name:"Rhus Tox",abbrev:"Rhus-t.",grade:2}]},
  { id:"ex002", chapter:"Extremities", section:"Stiffness", path:"EXTREMITIES; STIFFNESS; morning",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Kali-carb",abbrev:"Kali-c.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:2},{name:"Rhus Tox",abbrev:"Rhus-t.",grade:3},{name:"Sulphur",abbrev:"Sul.",grade:2}]},
  { id:"ex003", chapter:"Extremities", section:"Restlessness", path:"EXTREMITIES; RESTLESSNESS; legs",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Causticum",abbrev:"Caust.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:1},{name:"Rhus Tox",abbrev:"Rhus-t.",grade:3},{name:"Sulphur",abbrev:"Sul.",grade:2},{name:"Zincum",abbrev:"Zinc.",grade:3}]},
  { id:"ex004", chapter:"Extremities", section:"Swelling", path:"EXTREMITIES; SWELLING; feet; ankles",
    remedies:[{name:"Apis",abbrev:"Apis.",grade:3},{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Ledum",abbrev:"Led.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:3}]},

  // ─── SLEEP ───────────────────────────────────────────────────────────────
  { id:"sl001", chapter:"Sleep", section:"Sleeplessness", path:"SLEEP; SLEEPLESSNESS; general",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Coffea",abbrev:"Coff.",grade:3},{name:"Hyoscyamus",abbrev:"Hyos.",grade:2},{name:"Ignatia",abbrev:"Ign.",grade:2},{name:"Nux Vomica",abbrev:"Nux-v.",grade:3},{name:"Opium",abbrev:"Op.",grade:3},{name:"Passiflora",abbrev:"Pass.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:2}]},
  { id:"sl002", chapter:"Sleep", section:"Sleeplessness", path:"SLEEP; SLEEPLESSNESS; anxiety, from",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Coffea",abbrev:"Coff.",grade:2},{name:"Ignatia",abbrev:"Ign.",grade:2},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2}]},
  { id:"sl003", chapter:"Sleep", section:"Position", path:"SLEEP; POSITION; back, on; agg",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:1},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:2}]},
  { id:"sl004", chapter:"Sleep", section:"Dreams", path:"SLEEP; DREAMS; anxious",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:2},{name:"Sulphur",abbrev:"Sul.",grade:2}]},

  // ─── SKIN ────────────────────────────────────────────────────────────────
  { id:"sk001", chapter:"Skin", section:"Eruptions", path:"SKIN; ERUPTIONS; eczema",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Graphites",abbrev:"Graph.",grade:3},{name:"Hepar Sulph",abbrev:"Hep.",grade:2},{name:"Mercurius",abbrev:"Merc.",grade:2},{name:"Mezereum",abbrev:"Mez.",grade:3},{name:"Petroleum",abbrev:"Petr.",grade:3},{name:"Sulphur",abbrev:"Sul.",grade:3}]},
  { id:"sk002", chapter:"Skin", section:"Eruptions", path:"SKIN; ERUPTIONS; urticaria",
    remedies:[{name:"Apis",abbrev:"Apis.",grade:3},{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Dulcamara",abbrev:"Dulc.",grade:2},{name:"Natrum Mur",abbrev:"Nat-m.",grade:2},{name:"Pulsatilla",abbrev:"Puls.",grade:2},{name:"Rhus Tox",abbrev:"Rhus-t.",grade:3},{name:"Urtica Urens",abbrev:"Urt-u.",grade:3}]},
  { id:"sk003", chapter:"Skin", section:"Itching", path:"SKIN; ITCHING; warmth; agg",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:2},{name:"Mezereum",abbrev:"Mez.",grade:2},{name:"Psorinum",abbrev:"Psor.",grade:3},{name:"Sulphur",abbrev:"Sul.",grade:3}]},

  // ─── GENERALS ────────────────────────────────────────────────────────────
  { id:"g001", chapter:"Generals", section:"Side", path:"GENERALS; SIDE; right",
    remedies:[{name:"Belladonna",abbrev:"Bell.",grade:2},{name:"Chelidonium",abbrev:"Chel.",grade:3},{name:"Lycopodium",abbrev:"Lyc.",grade:3},{name:"Sanguin.",abbrev:"Sang.",grade:2}]},
  { id:"g002", chapter:"Generals", section:"Side", path:"GENERALS; SIDE; left",
    remedies:[{name:"Lachesis",abbrev:"Lach.",grade:3},{name:"Natrum Sulph",abbrev:"Nat-s.",grade:2},{name:"Sepia",abbrev:"Sep.",grade:2},{name:"Thuja",abbrev:"Thuj.",grade:2}]},
  { id:"g003", chapter:"Generals", section:"Heat", path:"GENERALS; HEAT; vital; lack of",
    remedies:[{name:"Baryta Carb",abbrev:"Bar-c.",grade:2},{name:"Calcarea",abbrev:"Calc.",grade:3},{name:"Psorinum",abbrev:"Psor.",grade:2},{name:"Silicea",abbrev:"Sil.",grade:3}]},
  { id:"g004", chapter:"Generals", section:"Burning", path:"GENERALS; BURNING; externally",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:3},{name:"Phosphorus",abbrev:"Phos.",grade:2},{name:"Sanguinaria",abbrev:"Sang.",grade:2},{name:"Sulphur",abbrev:"Sul.",grade:3}]},
  { id:"g005", chapter:"Generals", section:"Aggravation", path:"GENERALS; AGGRAVATION; 4 PM",
    remedies:[{name:"Belladonna",abbrev:"Bell.",grade:2},{name:"Lycopodium",abbrev:"Lyc.",grade:3},{name:"Pulsatilla",abbrev:"Puls.",grade:2}]},
  { id:"g006", chapter:"Generals", section:"Aggravation", path:"GENERALS; AGGRAVATION; cold; wet weather",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Dulcamara",abbrev:"Dulc.",grade:3},{name:"Natrum Sulph",abbrev:"Nat-s.",grade:3},{name:"Rhus Tox",abbrev:"Rhus-t.",grade:3}]},
  { id:"g007", chapter:"Generals", section:"Aggravation", path:"GENERALS; AGGRAVATION; morning",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:1},{name:"Lycopodium",abbrev:"Lyc.",grade:1},{name:"Natrum Mur",abbrev:"Nat-m.",grade:1},{name:"Nux Vomica",abbrev:"Nux-v.",grade:3},{name:"Phosphoric Acid",abbrev:"Ph-ac.",grade:1},{name:"Sulphur",abbrev:"Sul.",grade:3}]},
  { id:"g008", chapter:"Generals", section:"Amelioration", path:"GENERALS; AMELIORATION; motion",
    remedies:[{name:"Dioscorea",abbrev:"Dios.",grade:3},{name:"Ferrum",abbrev:"Ferr.",grade:3},{name:"Lycopodium",abbrev:"Lyc.",grade:1},{name:"Pulsatilla",abbrev:"Puls.",grade:2},{name:"Rhus Tox",abbrev:"Rhus-t.",grade:3}]},
  { id:"g009", chapter:"Generals", section:"Amelioration", path:"GENERALS; AMELIORATION; rest",
    remedies:[{name:"Belladonna",abbrev:"Bell.",grade:2},{name:"Bryonia",abbrev:"Bry.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:2},{name:"Nux Vomica",abbrev:"Nux-v.",grade:2}]},
  { id:"g010", chapter:"Generals", section:"Food", path:"GENERALS; FOOD; onions; aversion",
    remedies:[{name:"Lycopodium",abbrev:"Lyc.",grade:2},{name:"Sabadilla",abbrev:"Sabad.",grade:2},{name:"Thuja",abbrev:"Thuj.",grade:3}]},
  { id:"g011", chapter:"Generals", section:"Perspiration", path:"GENERALS; PERSPIRATION; profuse; general",
    remedies:[{name:"Calcarea",abbrev:"Calc.",grade:3},{name:"China",abbrev:"Chin.",grade:2},{name:"Mercurius",abbrev:"Merc.",grade:3},{name:"Phosphorus",abbrev:"Phos.",grade:2},{name:"Silicea",abbrev:"Sil.",grade:3},{name:"Sulphur",abbrev:"Sul.",grade:3}]},
  { id:"g012", chapter:"Generals", section:"Weakness", path:"GENERALS; WEAKNESS; general",
    remedies:[{name:"Arsenicum",abbrev:"Ars.",grade:3},{name:"Calcarea",abbrev:"Calc.",grade:3},{name:"China",abbrev:"Chin.",grade:3},{name:"Gelsemium",abbrev:"Gels.",grade:3},{name:"Muriatic Acid",abbrev:"Mur-ac.",grade:3},{name:"Phosphoric Acid",abbrev:"Ph-ac.",grade:3},{name:"Sulphur",abbrev:"Sul.",grade:2}]},
];

export const CHAPTERS = [...new Set(KENT_REPERTORY.map(r => r.chapter))];
export const SECTIONS = [...new Set(KENT_REPERTORY.map(r => r.section))];

export function searchRubrics(query: string): Rubric[] {
  if (!query.trim()) return [];
  const words = query.toLowerCase().replace(/[*]/g, "").trim().split(/\s+/).filter(Boolean);

  // Support exclusion with - prefix
  const mustWords = words.filter(w => !w.startsWith("-"));
  const notWords = words.filter(w => w.startsWith("-")).map(w => w.slice(1));

  return KENT_REPERTORY.filter(r => {
    const haystack = (r.path + " " + r.chapter + " " + r.section).toLowerCase();
    const hasAll = mustWords.every(w => haystack.includes(w));
    const hasNone = notWords.every(w => !haystack.includes(w));
    return hasAll && hasNone;
  });
}
