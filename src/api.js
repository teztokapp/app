import { createTranslator, DEFAULT_LOCALE } from "./i18n.js";

export const BACKEND_OPENALEX = "openalex";
export const BACKEND_CROSSREF = "crossref";
export const BACKEND_SEMANTIC_SCHOLAR = "semantic-scholar";
export const BACKEND_CORE = "core";
export const BACKEND_PUBMED = "pubmed";
export const BACKEND_YOKTEZ = "yoktez";
export const DEFAULT_BACKEND = BACKEND_OPENALEX;

export const BACKEND_OPTIONS = [
  { id: BACKEND_OPENALEX, label: "OpenAlex" },
  { id: BACKEND_CROSSREF, label: "Crossref" },
  { id: BACKEND_PUBMED, label: "PubMed" },
  { id: BACKEND_YOKTEZ, label: "YÖK Tez" },
];

export function sanitizeBackendSelection(backend) {
  return BACKEND_OPTIONS.some((option) => option.id === backend)
    ? backend
    : DEFAULT_BACKEND;
}

export function getBackendOptions(locale = DEFAULT_LOCALE) {
  const t = getTranslatorForLocale(locale);
  const labelKeys = {
    [BACKEND_OPENALEX]: "providers.names.openalex",
    [BACKEND_SEMANTIC_SCHOLAR]: "providers.names.semanticScholar",
    [BACKEND_CORE]: "providers.names.core",
    [BACKEND_CROSSREF]: "providers.names.crossref",
    [BACKEND_PUBMED]: "providers.names.pubmed",
    [BACKEND_YOKTEZ]: "providers.names.yoktez",
  };

  return BACKEND_OPTIONS.map((option) => {
    const translated = t(labelKeys[option.id]);

    return {
      ...option,
      label: translated === labelKeys[option.id] ? option.label : translated,
    };
  });
}

const OPENALEX_API_URL = (
  import.meta.env.VITE_OPENALEX_API_URL ??
  "https://api.openalex.org/works"
).trim();

const CROSSREF_API_URL = (
  import.meta.env.VITE_CROSSREF_API_URL ??
  "https://api.crossref.org/works"
).trim();

const CROSSREF_TYPES_URL = (
  import.meta.env.VITE_CROSSREF_TYPES_URL ??
  "https://api.crossref.org/types"
).trim();

const SEMANTIC_SCHOLAR_API_URL = (
  import.meta.env.VITE_SEMANTIC_SCHOLAR_API_URL ??
  "https://api.semanticscholar.org/graph/v1/paper/search"
).trim();

const CORE_API_URL = (
  import.meta.env.VITE_CORE_API_URL ??
  "https://api.core.ac.uk/v3/search/works/"
).trim();

const PUBMED_EUTILS_BASE_URL = (
  import.meta.env.VITE_PUBMED_EUTILS_BASE_URL ??
  "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
).trim().replace(/\/$/, "");
const PUBMED_MESH_SPARQL_URL = (
  import.meta.env.VITE_PUBMED_MESH_SPARQL_URL ??
  "https://id.nlm.nih.gov/mesh/sparql"
).trim();
const UNSPLASH_ACCESS_KEY = (
  import.meta.env.VITE_UNSPLASH_ACCESS_KEY ??
  ""
).trim();
const IMAGE_CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const IMAGE_NEGATIVE_CACHE_TTL_MS = 1000 * 60 * 15;
const COMMONS_COOLDOWN_MS = 1000 * 60 * 10;
const UNSPLASH_COOLDOWN_MS = 1000 * 60 * 10;
const imageCache = new Map();
let commonsCooldownUntil = 0;
let unsplashCooldownUntil = 0;

const CROSSREF_MAX_OFFSET = 10_000;
const CROSSREF_RANDOM_OFFSET_WINDOW = 5_000;

// A fresh random seed each time the app is loaded.
// OpenAlex uses it as a shuffle seed; other backends use it as a random base offset.
const SESSION_SEED = Math.floor(Math.random() * 1_000_000);
const SESSION_BASE_OFFSET = Math.floor(Math.random() * 50_000);

const OPENALEX_FILTER_OPTIONS = [
  { id: "all", labelKey: "providers.openalex.all", fallbackLabel: "Tüm OpenAlex", search: "", filter: "" },
  { id: "computer-science", labelKey: "providers.common.computerScience", fallbackLabel: "Bilgisayar Bilimi", search: "", filter: "primary_topic.field.id:17" },
  { id: "ai", labelKey: "providers.common.ai", fallbackLabel: "Yapay Zeka", search: "", filter: "primary_topic.subfield.id:1702" },
  { id: "ml", labelKey: "providers.common.ml", fallbackLabel: "Makine Öğrenmesi", search: "machine learning", filter: "primary_topic.subfield.id:1702" },
  { id: "nlp", labelKey: "providers.common.nlp", fallbackLabel: "Doğal Dil İşleme", search: "", filter: "primary_topic.id:T10181" },
  { id: "cv", labelKey: "providers.common.cv", fallbackLabel: "Bilgisayarlı Görü", search: "", filter: "primary_topic.subfield.id:1707" },
  { id: "biology", labelKey: "providers.common.biology", fallbackLabel: "Biyoloji", search: "", filter: "primary_topic.domain.id:1" },
  { id: "economics", labelKey: "providers.common.economics", fallbackLabel: "Ekonomi", search: "", filter: "primary_topic.field.id:20" },
];

const CROSSREF_FILTER_OPTIONS = [
  { id: "all", labelKey: "providers.crossref.all", fallbackLabel: "Tüm Crossref", query: "", type: "" },
];

const SEMANTIC_SCHOLAR_FILTER_OPTIONS = [
  { id: "all", labelKey: "providers.semanticScholar.all", fallbackLabel: "Tüm Semantic Scholar", query: "research" },
  { id: "ai", labelKey: "providers.common.ai", fallbackLabel: "Yapay Zeka", query: "\"artificial intelligence\"" },
  { id: "ml", labelKey: "providers.common.ml", fallbackLabel: "Makine Öğrenmesi", query: "\"machine learning\"" },
  { id: "nlp", labelKey: "providers.common.nlp", fallbackLabel: "Doğal Dil İşleme", query: "\"natural language processing\"" },
  { id: "cv", labelKey: "providers.common.cv", fallbackLabel: "Bilgisayarlı Görü", query: "\"computer vision\"" },
  { id: "biology", labelKey: "providers.common.biology", fallbackLabel: "Biyoloji", query: "biology" },
  { id: "economics", labelKey: "providers.common.economics", fallbackLabel: "Ekonomi", query: "economics" },
];

const CORE_FILTER_OPTIONS = [
  { id: "all", labelKey: "providers.core.all", fallbackLabel: "Tüm CORE", query: "research" },
  { id: "ai", labelKey: "providers.common.ai", fallbackLabel: "Yapay Zeka", query: "\"artificial intelligence\"" },
  { id: "ml", labelKey: "providers.common.ml", fallbackLabel: "Makine Öğrenmesi", query: "\"machine learning\"" },
  { id: "nlp", labelKey: "providers.common.nlp", fallbackLabel: "Doğal Dil İşleme", query: "\"natural language processing\"" },
  { id: "cv", labelKey: "providers.common.cv", fallbackLabel: "Bilgisayarlı Görü", query: "\"computer vision\"" },
  { id: "biology", labelKey: "providers.common.biology", fallbackLabel: "Biyoloji", query: "biology" },
  { id: "economics", labelKey: "providers.common.economics", fallbackLabel: "Ekonomi", query: "economics" },
];

const PUBMED_FILTER_OPTIONS = [
  { id: "all", labelKey: "providers.pubmed.all", fallbackLabel: "Tüm PubMed", term: "" },
];

function getTranslatorForLocale(locale) {
  return createTranslator(locale ?? DEFAULT_LOCALE);
}

function localizeOption(option, locale) {
  const t = getTranslatorForLocale(locale);
  const label = t(option.labelKey);

  return {
    ...option,
    label: label === option.labelKey ? option.fallbackLabel : label,
  };
}

function localizeOptions(options, locale) {
  return options.map((option) => localizeOption(option, locale));
}

const OPENALEX_LABEL_KEY_BY_NAME = {
  "artificial intelligence": "providers.common.ai",
  "machine learning": "providers.common.ml",
  "natural language processing": "providers.common.nlp",
  "computer vision": "providers.common.cv",
  "computer science": "providers.common.computerScience",
  robotics: "providers.common.robotics",
  mathematics: "providers.common.math",
  statistics: "providers.common.statistics",
  physics: "providers.common.physics",
  medicine: "providers.common.medicine",
  "public health": "providers.common.publicHealth",
  neuroscience: "providers.common.neuroscience",
  genetics: "providers.common.genetics",
  oncology: "providers.common.oncology",
  cardiology: "providers.common.cardiology",
  immunology: "providers.common.immunology",
  psychiatry: "providers.common.psychiatry",
  pharmacology: "providers.common.pharmacology",
  bioinformatics: "providers.common.bioinformatics",
  epidemiology: "providers.common.epidemiology",
  microbiology: "providers.common.microbiology",
  virology: "providers.common.virology",
  pediatrics: "providers.common.pediatrics",
  surgery: "providers.common.surgery",
  radiology: "providers.common.radiology",
  dermatology: "providers.common.dermatology",
  endocrinology: "providers.common.endocrinology",
  ophthalmology: "providers.common.ophthalmology",
  nursing: "providers.common.nursing",
  dentistry: "providers.common.dentistry",
  "quantitative biology": "providers.common.quantBiology",
  economics: "providers.common.economics",
  biology: "providers.common.biology",
  chemistry: "providers.openalex.labels.chemistry",
  engineering: "providers.openalex.labels.engineering",
  "social sciences": "providers.openalex.labels.socialSciences",
  "arts and humanities": "providers.openalex.labels.artsHumanities",
  "physics and astronomy": "providers.openalex.labels.physicsAstronomy",
  "agricultural and biological sciences": "providers.openalex.labels.agriculturalBiologicalSciences",
  "biochemistry, genetics and molecular biology": "providers.openalex.labels.biochemistryGeneticsMolecularBiology",
  "materials science": "providers.openalex.labels.materialsScience",
  "environmental science": "providers.openalex.labels.environmentalScience",
  "economics, econometrics and finance": "providers.openalex.labels.economicsEconometricsFinance",
  geology: "providers.openalex.labels.geology",
  geography: "providers.openalex.labels.geography",
  psychology: "providers.openalex.labels.psychology",
  sociology: "providers.openalex.labels.sociology",
  "political science": "providers.openalex.labels.politicalScience",
  "business, management and accounting": "providers.openalex.labels.businessManagementAccounting",
  "health professions": "providers.openalex.labels.healthProfessions",
  "earth and planetary sciences": "providers.openalex.labels.earthPlanetarySciences",
  "decision sciences": "providers.openalex.labels.decisionSciences",
  "immunology and microbiology": "providers.openalex.labels.immunologyMicrobiology",
  energy: "providers.openalex.labels.energy",
  "pharmacology, toxicology and pharmaceutics": "providers.openalex.labels.pharmacologyToxicologyPharmaceutics",
  "chemical engineering": "providers.openalex.labels.chemicalEngineering",
  business: "providers.openalex.labels.business",
  philosophy: "providers.openalex.labels.philosophy",
  history: "providers.openalex.labels.history",
  art: "providers.openalex.labels.art",
  linguistics: "providers.openalex.labels.linguistics",
  "biomedical engineering": "providers.openalex.labels.biomedicalEngineering",
  "applied mathematics": "providers.openalex.labels.appliedMathematics",
  "statistics and probability": "providers.openalex.labels.statisticsProbability",
  "cognitive neuroscience": "providers.openalex.labels.cognitiveNeuroscience",
  veterinary: "providers.openalex.labels.veterinary",
  "aerospace engineering": "providers.openalex.labels.aerospaceEngineering",
  "sociology and political science": "providers.openalex.labels.sociologyPoliticalScience",
  "nuclear and high energy physics": "providers.openalex.labels.nuclearHighEnergyPhysics",
  "molecular biology": "providers.openalex.labels.molecularBiology",
  "economics and econometrics": "providers.openalex.labels.economicsEconometrics",
  "plant science": "providers.openalex.labels.plantScience",
  "electrical and electronic engineering": "providers.openalex.labels.electricalElectronicEngineering",
  "political science and international relations": "providers.openalex.labels.politicalScienceInternationalRelations",
  education: "providers.openalex.labels.education",
  "materials chemistry": "providers.openalex.labels.materialsChemistry",
  "astronomy and astrophysics": "providers.openalex.labels.astronomyAstrophysics",
  "literature and literary theory": "providers.openalex.labels.literatureLiteraryTheory",
  "general health professions": "providers.openalex.labels.generalHealthProfessions",
  "information systems": "providers.openalex.labels.informationSystems",
  "atomic and molecular physics, and optics": "providers.openalex.labels.atomicMolecularPhysicsOptics",
  "mechanical engineering": "providers.openalex.labels.mechanicalEngineering",
  "public health, environmental and occupational health": "providers.openalex.labels.publicHealthEnvironmentalOccupationalHealth",
  "ecology, evolution, behavior and systematics": "providers.openalex.labels.ecologyEvolutionBehaviorSystematics",
  "pediatrics, perinatology and child health": "providers.openalex.labels.pediatricsPerinatologyChildHealth",
  "pulmonary and respiratory medicine": "providers.openalex.labels.pulmonaryRespiratoryMedicine",
  ecology: "providers.openalex.labels.ecology",
  "organic chemistry": "providers.openalex.labels.organicChemistry",
  archeology: "providers.openalex.labels.archeology",
  "clinical psychology": "providers.openalex.labels.clinicalPsychology",
  "civil and structural engineering": "providers.openalex.labels.civilStructuralEngineering",
  "computer networks and communications": "providers.openalex.labels.computerNetworksCommunications",
  "strategy and management": "providers.openalex.labels.strategyManagement",
  "control and systems engineering": "providers.openalex.labels.controlSystemsEngineering",
  law: "providers.openalex.labels.law",
  "social psychology": "providers.openalex.labels.socialPsychology",
  "language and linguistics": "providers.openalex.labels.languageLinguistics",
  anthropology: "providers.openalex.labels.anthropology",
  "management, monitoring, policy and law": "providers.openalex.labels.managementMonitoringPolicyLaw",
  physiology: "providers.openalex.labels.physiology",
  "cultural studies": "providers.openalex.labels.culturalStudies",
  "computer vision and pattern recognition": "providers.openalex.labels.computerVisionPatternRecognition",
  "cardiology and cardiovascular medicine": "providers.openalex.labels.cardiologyCardiovascularMedicine",
  "global and planetary change": "providers.openalex.labels.globalPlanetaryChange",
  "radiology, nuclear medicine and imaging": "providers.openalex.labels.radiologyNuclearMedicineImaging",
  "computational mechanics": "providers.openalex.labels.computationalMechanics",
  "mechanics of materials": "providers.openalex.labels.mechanicsMaterials",
  "food science": "providers.openalex.labels.foodScience",
  accounting: "providers.openalex.labels.accounting",
  geophysics: "providers.openalex.labels.geophysics",
  "atmospheric science": "providers.openalex.labels.atmosphericScience",
  "ocean engineering": "providers.openalex.labels.oceanEngineering",
  "infectious diseases": "providers.openalex.labels.infectiousDiseases",
  demography: "providers.openalex.labels.demography",
  "history and philosophy of science": "providers.openalex.labels.historyPhilosophyScience",
  "water science and technology": "providers.openalex.labels.waterScienceTechnology",
  "renewable energy, sustainability and the environment": "providers.openalex.labels.renewableEnergySustainabilityEnvironment",
  "religious studies": "providers.openalex.labels.religiousStudies",
  "computational theory and mathematics": "providers.openalex.labels.computationalTheoryMathematics",
  biophysics: "providers.openalex.labels.biophysics",
  "ecological modeling": "providers.openalex.labels.ecologicalModeling",
  "management science and operations research": "providers.openalex.labels.managementScienceOperationsResearch",
  paleontology: "providers.openalex.labels.paleontology",
  "endocrinology, diabetes and metabolism": "providers.openalex.labels.endocrinologyDiabetesMetabolism",
  "organizational behavior and human resource management": "providers.openalex.labels.organizationalBehaviorHumanResourceManagement",
  "pathology and forensic medicine": "providers.openalex.labels.pathologyForensicMedicine",
  oceanography: "providers.openalex.labels.oceanography",
  "visual arts and performing arts": "providers.openalex.labels.visualArtsPerformingArts",
  "experimental and cognitive psychology": "providers.openalex.labels.experimentalCognitivePsychology",
  "environmental engineering": "providers.openalex.labels.environmentalEngineering",
  "condensed matter physics": "providers.openalex.labels.condensedMatterPhysics",
  "information systems and management": "providers.openalex.labels.informationSystemsManagement",
  finance: "providers.openalex.labels.finance",
  neurology: "providers.openalex.labels.neurology",
  "building and construction": "providers.openalex.labels.buildingConstruction",
  "reproductive medicine": "providers.openalex.labels.reproductiveMedicine",
  "urban studies": "providers.openalex.labels.urbanStudies",
  "nature and landscape conservation": "providers.openalex.labels.natureLandscapeConservation",
  "psychiatry and mental health": "providers.openalex.labels.psychiatryMentalHealth",
  "insect science": "providers.openalex.labels.insectScience",
};

const OPENALEX_PHRASE_REPLACEMENTS_BY_LOCALE = {
  tr: [
  ["developmental and educational psychology", "gelişimsel ve eğitim psikolojisi"],
  ["health, toxicology and mutagenesis", "sağlık, toksikoloji ve mutagenez"],
  ["industrial and manufacturing engineering", "endüstri ve üretim mühendisliği"],
  ["general agricultural and biological sciences", "genel tarımsal ve biyolojik bilimler"],
  ["statistical and nonlinear physics", "istatistiksel ve doğrusal olmayan fizik"],
  ["management information systems", "yönetim bilişim sistemleri"],
  ["cellular and molecular neuroscience", "hücresel ve moleküler nörobilim"],
  ["electronic, optical and magnetic materials", "elektronik, optik ve manyetik malzemeler"],
  ["general economics, econometrics and finance", "genel ekonomi, ekonometri ve finans"],
  ["complementary and alternative medicine", "tamamlayıcı ve alternatif tıp"],
  ["physical and theoretical chemistry", "fiziksel ve teorik kimya"],
  ["management of technology and innovation", "teknoloji ve inovasyon yönetimi"],
  ["computer science applications", "bilgisayar bilimi uygulamaları"],
  ["agronomy and crop science", "agronomi ve bitki bilimi"],
  ["obstetrics and gynecology", "kadın hastalıkları ve doğum"],
  ["safety, risk, reliability and quality", "güvenlik, risk, güvenilirlik ve kalite"],
  ["animal science and zoology", "hayvan bilimi ve zooloji"],
  ["general social sciences", "genel sosyal bilimler"],
  ["orthopedics and sports medicine", "ortopedi ve spor hekimliği"],
  ["health information management", "sağlık bilgi yönetimi"],
  ["linguistics and language", "dilbilim ve dil"],
  ["physical therapy, sports therapy and rehabilitation", "fizik tedavi, spor terapisi ve rehabilitasyon"],
  ["surfaces, coatings and films", "yüzeyler, kaplamalar ve filmler"],
  ["anesthesiology and pain medicine", "anesteziyoloji ve ağrı tıbbı"],
  ["immunology and allergy", "immünoloji ve alerji"],
  ["theoretical computer science", "kuramsal bilgisayar bilimi"],
  ["fluid flow and transfer processes", "akışkan akışı ve transfer süreçleri"],
  ["radiological and ultrasound technology", "radyolojik ve ultrason teknolojisi"],
  ["computer graphics and computer-aided design", "bilgisayar grafikleri ve bilgisayar destekli tasarım"],
  ["critical care and intensive care medicine", "kritik bakım ve yoğun bakım tıbbı"],
  ["general arts and humanities", "genel sanat ve beşeri bilimler"],
  ["earth-surface processes", "yer yüzeyi süreçleri"],
  ["human-computer interaction", "insan-bilgisayar etkileşimi"],
  ["library and information sciences", "kütüphane ve bilgi bilimleri"],
  ["health information management", "sağlık bilgi yönetimi"],
  ["mental health", "ruh sağlığı"],
  ["reproductive medicine", "üreme tıbbı"],
  ["urban studies", "kent çalışmaları"],
  ["landscape conservation", "peyzaj koruma"],
  ["nature conservation", "doğa koruma"],
  ["insect science", "böcek bilimi"],
  ["political science", "siyaset bilimi"],
  ["international relations", "uluslararası ilişkiler"],
  ["computer science", "bilgisayar bilimi"],
  ["information systems", "bilgi sistemleri"],
  ["public health", "halk sağlığı"],
  ["health professions", "sağlık meslekleri"],
  ["social sciences", "sosyal bilimler"],
  ["arts and humanities", "sanat ve beşeri bilimler"],
  ["materials science", "malzeme bilimi"],
  ["environmental science", "çevre bilimi"],
  ["decision sciences", "karar bilimleri"],
  ["earth and planetary sciences", "yer ve gezegen bilimleri"],
  ["chemical engineering", "kimya mühendisliği"],
  ["mechanical engineering", "makine mühendisliği"],
  ["aerospace engineering", "havacılık ve uzay mühendisliği"],
  ["electrical and electronic engineering", "elektrik ve elektronik mühendisliği"],
  ["civil and structural engineering", "inşaat ve yapı mühendisliği"],
  ["control and systems engineering", "kontrol ve sistem mühendisliği"],
  ["environmental engineering", "çevre mühendisliği"],
  ["ocean engineering", "okyanus mühendisliği"],
  ["biomedical engineering", "biyomedikal mühendisliği"],
  ["computer vision", "bilgisayarlı görü"],
  ["pattern recognition", "örüntü tanıma"],
  ["machine learning", "makine öğrenmesi"],
  ["artificial intelligence", "yapay zeka"],
  ["natural language processing", "doğal dil işleme"],
  ["cognitive neuroscience", "bilişsel nörobilim"],
  ["molecular biology", "moleküler biyoloji"],
  ["organic chemistry", "organik kimya"],
  ["materials chemistry", "malzeme kimyası"],
  ["clinical psychology", "klinik psikoloji"],
  ["social psychology", "sosyal psikoloji"],
  ["cultural studies", "kültürel çalışmalar"],
  ["language and linguistics", "dil ve dilbilim"],
  ["religious studies", "din çalışmaları"],
  ["visual arts", "görsel sanatlar"],
  ["performing arts", "sahne sanatları"],
  ["analytical chemistry", "analitik kimya"],
  ["cell biology", "hücre biyolojisi"],
  ["biomaterials", "biyomalzemeler"],
  ["museology", "müzecilik"],
  ["rheumatology", "romatoloji"],
  ["gender studies", "toplumsal cinsiyet çalışmaları"],
  ["spectroscopy", "spektroskopi"],
  ["nutrition and dietetics", "beslenme ve diyetetik"],
  ["marketing", "pazarlama"],
  ["environmental chemistry", "çevre kimyası"],
  ["cancer research", "kanser araştırmaları"],
  ["classics", "klasikler"],
  ["communication", "iletişim"],
  ["transportation", "ulaştırma"],
  ["inorganic chemistry", "inorganik kimya"],
  ["polymers and plastics", "polimerler ve plastikler"],
  ["geometry and topology", "geometri ve topoloji"],
  ["hematology", "hematoloji"],
  ["automotive engineering", "otomotiv mühendisliği"],
  ["pollution", "kirlilik"],
  ["soil science", "toprak bilimi"],
  ["radiation", "radyasyon"],
  ["health", "sağlık"],
  ["media technology", "medya teknolojisi"],
  ["mathematical physics", "matematiksel fizik"],
  ["emergency medicine", "acil tıp"],
  ["signal processing", "sinyal işleme"],
  ["speech and hearing", "konuşma ve işitme"],
  ["conservation", "koruma"],
  ["aquatic science", "su bilimleri"],
  ["emergency medical services", "acil sağlık hizmetleri"],
  ["biotechnology", "biyoteknoloji"],
  ["nephrology", "nefroloji"],
  ["hepatology", "hepatoloji"],
  ["geochemistry and petrology", "jeokimya ve petroloji"],
  ["parasitology", "parazitoloji"],
  ["hardware and architecture", "donanım ve mimari"],
  ["small animals", "küçük hayvanlar"],
  ["forestry", "ormancılık"],
  ["development", "gelişim"],
  ["rehabilitation", "rehabilitasyon"],
  ["biochemistry", "biyokimya"],
  ["occupational therapy", "ergoterapi"],
  ["oral surgery", "ağız cerrahisi"],
  ["instrumentation", "enstrümantasyon"],
  ["public administration", "kamu yönetimi"],
  ["pharmaceutical science", "farmasötik bilimler"],
  ["urology", "üroloji"],
  ["general materials science", "genel malzeme bilimi"],
  ["pharmacy", "eczacılık"],
  ["architecture", "mimarlık"],
  ["clinical biochemistry", "klinik biyokimya"],
  ["gastroenterology", "gastroenteroloji"],
  ["periodontics", "periodontoloji"],
  ["applied psychology", "uygulamalı psikoloji"],
  ["modeling and simulation", "modelleme ve simülasyon"],
  ["algebra and number theory", "cebir ve sayı kuramı"],
  ["otorhinolaryngology", "kulak burun boğaz"],
  ["ceramics and composites", "seramikler ve kompozitler"],
  ["catalysis", "kataliz"],
  ["endocrine and autonomic systems", "endokrin ve otonom sistemler"],
  ["software", "yazılım"],
  ["numerical analysis", "sayısal analiz"],
  ["orthodontics", "ortodonti"],
  ["reproductive", "üreme"],
  ["medicine", "tıp"],
  ["urban", "kentsel"],
  ["studies", "çalışmaları"],
  ["nature", "doğa"],
  ["landscape", "peyzaj"],
  ["conservation", "koruma"],
  ["psychiatry", "psikiyatri"],
  ["insect", "böcek"],
  ["science", "bilimi"],
  ["engineering", "mühendisliği"],
  ["management", "yönetim"],
  ["information", "bilgi"],
  ["systems", "sistemleri"],
  ["cellular", "hücresel"],
  ["molecular", "moleküler"],
  ["materials", "malzemeler"],
  ["electronic", "elektronik"],
  ["optical", "optik"],
  ["magnetic", "manyetik"],
  ["general", "genel"],
  ["econometrics", "ekonometri"],
  ["finance", "finans"],
  ["quality", "kalite"],
  ["reliability", "güvenilirlik"],
  ["risk", "risk"],
  ["probability", "olasılık"],
  ["uncertainty", "belirsizlik"],
  ["statistics", "istatistik"],
  ["animal", "hayvan"],
  ["zoology", "zooloji"],
  ["services", "hizmetleri"],
  ["language", "dil"],
  ["analytics", "analitik"],
  ["physical therapy", "fizik tedavi"],
  ["sports therapy", "spor terapisi"],
  ["ultrasound", "ultrason"],
  ["technology", "teknoloji"],
  ["innovation", "inovasyon"],
  ["applications", "uygulamaları"],
  ["research", "araştırmaları"],
  ["processing", "işleme"],
  ["hearing", "işitme"],
  ["speech", "konuşma"],
  ["orthopedics", "ortopedi"],
  ["sports", "spor"],
  ["emergency", "acil"],
  ["medical", "tıbbi"],
  ["services", "hizmetleri"],
  ["small", "küçük"],
  ["animals", "hayvanlar"],
  ["hardware", "donanım"],
  ["architecture", "mimari"],
  ["surfaces", "yüzeyler"],
  ["coatings", "kaplamalar"],
  ["films", "filmler"],
  ["pharmaceutical", "farmasötik"],
  ["clinical", "klinik"],
  ["library", "kütüphane"],
  ["simulation", "simülasyon"],
  ["theoretical", "teorik"],
  ["theory", "kuramı"],
  ["number", "sayı"],
  ["ceramics", "seramikler"],
  ["composites", "kompozitler"],
  ["critical care", "kritik bakım"],
  ["intensive care", "yoğun bakım"],
  ["numerical", "sayısal"],
    ["analysis", "analiz"],
    ["and", "ve"],
  ],
  fr: [
    ["artificial intelligence", "intelligence artificielle"],
    ["machine learning", "apprentissage automatique"],
    ["natural language processing", "traitement du langage naturel"],
    ["computer vision", "vision par ordinateur"],
    ["computer science", "informatique"],
    ["information systems", "systèmes d'information"],
    ["public health", "santé publique"],
    ["social sciences", "sciences sociales"],
    ["arts and humanities", "arts et sciences humaines"],
    ["materials science", "science des matériaux"],
    ["environmental science", "sciences de l'environnement"],
    ["mechanical engineering", "génie mécanique"],
    ["chemical engineering", "génie chimique"],
    ["electrical and electronic engineering", "génie électrique et électronique"],
    ["civil and structural engineering", "génie civil et structurel"],
    ["biomedical engineering", "génie biomédical"],
    ["molecular biology", "biologie moléculaire"],
    ["cell biology", "biologie cellulaire"],
    ["clinical psychology", "psychologie clinique"],
    ["cognitive neuroscience", "neurosciences cognitives"],
    ["environmental engineering", "génie environnemental"],
    ["emergency medicine", "médecine d'urgence"],
    ["analytical chemistry", "chimie analytique"],
    ["management information systems", "systèmes d'information de gestion"],
    ["orthopedics and sports medicine", "orthopédie et médecine du sport"],
    ["health information management", "gestion de l'information en santé"],
    ["engineering", "ingénierie"],
    ["medicine", "médecine"],
    ["science", "science"],
    ["studies", "études"],
    ["health", "santé"],
    ["and", "et"],
  ],
  es: [
    ["artificial intelligence", "inteligencia artificial"],
    ["machine learning", "aprendizaje automático"],
    ["natural language processing", "procesamiento del lenguaje natural"],
    ["computer vision", "visión por computadora"],
    ["computer science", "informática"],
    ["information systems", "sistemas de información"],
    ["public health", "salud pública"],
    ["social sciences", "ciencias sociales"],
    ["arts and humanities", "artes y humanidades"],
    ["materials science", "ciencia de materiales"],
    ["environmental science", "ciencias ambientales"],
    ["mechanical engineering", "ingeniería mecánica"],
    ["chemical engineering", "ingeniería química"],
    ["electrical and electronic engineering", "ingeniería eléctrica y electrónica"],
    ["civil and structural engineering", "ingeniería civil y estructural"],
    ["biomedical engineering", "ingeniería biomédica"],
    ["molecular biology", "biología molecular"],
    ["cell biology", "biología celular"],
    ["clinical psychology", "psicología clínica"],
    ["cognitive neuroscience", "neurociencia cognitiva"],
    ["environmental engineering", "ingeniería ambiental"],
    ["emergency medicine", "medicina de urgencias"],
    ["analytical chemistry", "química analítica"],
    ["management information systems", "sistemas de información gerencial"],
    ["orthopedics and sports medicine", "ortopedia y medicina deportiva"],
    ["health information management", "gestión de la información en salud"],
    ["engineering", "ingeniería"],
    ["medicine", "medicina"],
    ["science", "ciencia"],
    ["studies", "estudios"],
    ["health", "salud"],
    ["and", "y"],
  ],
  de: [
    ["artificial intelligence", "künstliche intelligenz"],
    ["machine learning", "maschinelles lernen"],
    ["natural language processing", "verarbeitung natürlicher sprache"],
    ["computer vision", "computer vision"],
    ["computer science", "informatik"],
    ["information systems", "informationssysteme"],
    ["public health", "öffentliches gesundheitswesen"],
    ["social sciences", "sozialwissenschaften"],
    ["arts and humanities", "kunst und geisteswissenschaften"],
    ["materials science", "materialwissenschaft"],
    ["environmental science", "umweltwissenschaften"],
    ["mechanical engineering", "maschinenbau"],
    ["chemical engineering", "chemieingenieurwesen"],
    ["electrical and electronic engineering", "elektro- und elektroniktechnik"],
    ["civil and structural engineering", "bau- und konstruktionsingenieurwesen"],
    ["biomedical engineering", "biomedizintechnik"],
    ["molecular biology", "molekularbiologie"],
    ["cell biology", "zellbiologie"],
    ["clinical psychology", "klinische psychologie"],
    ["cognitive neuroscience", "kognitive neurowissenschaften"],
    ["environmental engineering", "umweltingenieurwesen"],
    ["emergency medicine", "notfallmedizin"],
    ["analytical chemistry", "analytische chemie"],
    ["management information systems", "managementinformationssysteme"],
    ["orthopedics and sports medicine", "orthopädie und sportmedizin"],
    ["health information management", "gesundheitsinformationsmanagement"],
    ["engineering", "ingenieurwesen"],
    ["medicine", "medizin"],
    ["science", "wissenschaft"],
    ["studies", "studien"],
    ["health", "gesundheit"],
    ["and", "und"],
  ],
  it: [
    ["artificial intelligence", "intelligenza artificiale"],
    ["machine learning", "apprendimento automatico"],
    ["natural language processing", "elaborazione del linguaggio naturale"],
    ["computer vision", "visione artificiale"],
    ["computer science", "informatica"],
    ["information systems", "sistemi informativi"],
    ["public health", "salute pubblica"],
    ["social sciences", "scienze sociali"],
    ["arts and humanities", "arti e scienze umane"],
    ["materials science", "scienza dei materiali"],
    ["environmental science", "scienze ambientali"],
    ["mechanical engineering", "ingegneria meccanica"],
    ["chemical engineering", "ingegneria chimica"],
    ["electrical and electronic engineering", "ingegneria elettrica ed elettronica"],
    ["civil and structural engineering", "ingegneria civile e strutturale"],
    ["biomedical engineering", "ingegneria biomedica"],
    ["molecular biology", "biologia molecolare"],
    ["cell biology", "biologia cellulare"],
    ["clinical psychology", "psicologia clinica"],
    ["cognitive neuroscience", "neuroscienze cognitive"],
    ["environmental engineering", "ingegneria ambientale"],
    ["emergency medicine", "medicina d'urgenza"],
    ["analytical chemistry", "chimica analitica"],
    ["management information systems", "sistemi informativi gestionali"],
    ["orthopedics and sports medicine", "ortopedia e medicina dello sport"],
    ["health information management", "gestione delle informazioni sanitarie"],
    ["engineering", "ingegneria"],
    ["medicine", "medicina"],
    ["science", "scienza"],
    ["studies", "studi"],
    ["health", "salute"],
    ["and", "e"],
  ],
};

function titleCaseLocalizedLabel(value = "", locale = DEFAULT_LOCALE) {
  return String(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLocaleLowerCase(locale);
      return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
    })
    .join(" ");
}

function heuristicTranslateOpenAlexLabel(label, locale) {
  const normalized = normalizeWhitespace(label);
  const replacements = OPENALEX_PHRASE_REPLACEMENTS_BY_LOCALE[locale] ?? [];

  if (!normalized || replacements.length === 0) {
    return normalized;
  }

  let translated = normalized.toLocaleLowerCase("en");

  replacements.forEach(([source, target]) => {
    translated = translated.replaceAll(source, target);
  });

  if (translated === normalized.toLocaleLowerCase("en")) {
    return normalized;
  }

  return titleCaseLocalizedLabel(translated, locale);
}

function localizeOpenAlexLabel(label, locale) {
  const normalized = normalizeWhitespace(label);

  if (!normalized || locale === "en") {
    return normalized;
  }

  const t = getTranslatorForLocale(locale);
  const key = OPENALEX_LABEL_KEY_BY_NAME[normalized.toLocaleLowerCase("en")];

  if (!key) {
    return heuristicTranslateOpenAlexLabel(normalized, locale);
  }

  const translated = t(key);

  if (translated !== key) {
    return translated;
  }

  return heuristicTranslateOpenAlexLabel(normalized, locale);
}

function getClientProviderMetadata(id, label, locale = DEFAULT_LOCALE) {
  const t = getTranslatorForLocale(locale);

  return {
    id,
    label,
    filterLabel: t("providers.client.filterLabel"),
    filterLabelPlural: t("providers.client.filterLabelPlural"),
    filterSearchPlaceholder: t("providers.client.filterSearchPlaceholder"),
    filterEmptyMessage: t("providers.client.filterEmptyMessage", { label }),
    allFilterLabel: t("providers.client.all"),
    feedErrorHint: t("providers.client.feedErrorHint", { label }),
    supportsBackgroundImages: true,
    requiresCustomServer: false,
    clientOnly: true,
  };
}

export function getBackendMetadata(backend, locale = DEFAULT_LOCALE) {
  const t = getTranslatorForLocale(locale);

  if (backend === BACKEND_YOKTEZ) {
    return {
      id: BACKEND_YOKTEZ,
      label: t("providers.names.yoktez"),
      filterLabel: t("providers.yoktez.filterLabel"),
      filterLabelPlural: t("providers.yoktez.filterLabelPlural"),
      filterSearchPlaceholder: t("providers.yoktez.filterSearchPlaceholder"),
      filterEmptyMessage: t("providers.yoktez.filterEmptyMessage"),
      allFilterLabel: t("providers.yoktez.all"),
      feedErrorHint: t("providers.yoktez.feedErrorHint"),
      supportsBackgroundImages: true,
      requiresCustomServer: true,
      clientOnly: false,
    };
  }
  if (backend === BACKEND_CROSSREF) {
    return {
      id: BACKEND_CROSSREF,
      label: t("providers.names.crossref"),
      filterLabel: t("providers.crossref.filterLabel"),
      filterLabelPlural: t("providers.crossref.filterLabelPlural"),
      filterSearchPlaceholder: t("providers.crossref.filterSearchPlaceholder"),
      filterEmptyMessage: t("providers.crossref.filterEmptyMessage"),
      allFilterLabel: t("providers.crossref.all"),
      feedErrorHint: t("providers.client.feedErrorHint", { label: t("providers.names.crossref") }),
      supportsBackgroundImages: true,
      requiresCustomServer: false,
      clientOnly: true,
    };
  }

  if (backend === BACKEND_PUBMED) {
    return getClientProviderMetadata(BACKEND_PUBMED, t("providers.names.pubmed"), locale);
  }

  if (backend === BACKEND_SEMANTIC_SCHOLAR) {
    return getClientProviderMetadata(
      BACKEND_SEMANTIC_SCHOLAR,
      t("providers.names.semanticScholar"),
      locale,
    );
  }

  if (backend === BACKEND_CORE) {
    return getClientProviderMetadata(BACKEND_CORE, t("providers.names.core"), locale);
  }

  return getClientProviderMetadata(BACKEND_OPENALEX, t("providers.names.openalex"), locale);
}

function normalizeBaseUrl(value) {
  return String(value ?? "").trim().replace(/\/$/, "");
}

function buildImageKey(query) {
  return query.trim().toLocaleLowerCase("tr");
}

function getCachedImage(key) {
  const hit = imageCache.get(key);

  if (!hit) {
    return undefined;
  }

  if (Date.now() > hit.expiresAt) {
    imageCache.delete(key);
    return undefined;
  }

  return hit.value;
}

function setCachedImage(key, value, ttlMs = IMAGE_CACHE_TTL_MS) {
  imageCache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

function buildCandidateImageQueries({ title = "", keywords = [] }) {
  const cleanKeywords = keywords.filter(Boolean).slice(0, 3);

  return [
    cleanKeywords.join(" "),
    cleanKeywords[0] ?? "",
    title.split(":")[0]?.trim() ?? "",
    title.split(" ").slice(0, 4).join(" "),
  ].filter(Boolean);
}

function addUnsplashUtm(rawUrl) {
  if (!rawUrl) {
    return null;
  }

  const url = new URL(rawUrl);
  url.searchParams.set("utm_source", "teztok");
  url.searchParams.set("utm_medium", "referral");
  return url.toString();
}

async function fetchCommonsImage(query) {
  if (Date.now() < commonsCooldownUntil) {
    return null;
  }

  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "6");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|extmetadata");
  url.searchParams.set("iiurlwidth", "1600");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const response = await fetch(url);

  if (response.status === 429) {
    commonsCooldownUntil = Date.now() + COMMONS_COOLDOWN_MS;
    return null;
  }

  if (!response.ok) {
    throw new Error(`Wikimedia image search failed: ${response.status}`);
  }

  const payload = await response.json();
  const pages = Object.values(payload?.query?.pages ?? {});

  return (
    pages
      .map((page) => {
        const info = page.imageinfo?.[0];

        if (!info?.thumburl || !info.mime?.startsWith("image/")) {
          return null;
        }

        return {
          source: "wikimedia-commons",
          query,
          title: page.title?.replace(/^File:/, "") ?? query,
          imageUrl: info.thumburl,
          pageUrl: info.descriptionurl ?? null,
          license: info.extmetadata?.LicenseShortName?.value ?? null,
        };
      })
      .find(Boolean) ?? null
  );
}

async function fetchUnsplashImage(query) {
  if (!UNSPLASH_ACCESS_KEY || Date.now() < unsplashCooldownUntil) {
    return null;
  }

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "8");
  url.searchParams.set("orientation", "portrait");
  url.searchParams.set("content_filter", "high");
  url.searchParams.set("client_id", UNSPLASH_ACCESS_KEY);

  const response = await fetch(url, {
    headers: {
      "Accept-Version": "v1",
    },
  });

  if (response.status === 429) {
    unsplashCooldownUntil = Date.now() + UNSPLASH_COOLDOWN_MS;
    return null;
  }

  if (response.status === 401 || response.status === 403) {
    unsplashCooldownUntil = Date.now() + UNSPLASH_COOLDOWN_MS;
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unsplash image search failed: ${response.status}`);
  }

  const payload = await response.json();
  const photo =
    payload?.results?.find((item) => item?.urls?.regular && item?.user?.name) ?? null;

  if (!photo) {
    return null;
  }

  return {
    source: "unsplash",
    query,
    title: photo.alt_description ?? photo.description ?? query,
    imageUrl: photo.urls.regular,
    pageUrl: addUnsplashUtm(photo.links?.html),
    attributionLabel: `${photo.user.name} / Unsplash`,
    attributionUrl: addUnsplashUtm(photo.user.links?.html ?? photo.links?.html),
    license: "Unsplash",
  };
}

function normalizeWhitespace(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value = "") {
  const input = String(value ?? "");

  if (!input.includes("&")) {
    return input;
  }

  if (typeof document !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = input;
    return textarea.value;
  }

  return input
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'");
}

function humanizeTypeLabel(value = "") {
  const normalized = normalizeWhitespace(value).replace(/[-_]+/g, " ");

  if (!normalized) {
    return "";
  }

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

function stripHtml(value = "") {
  return normalizeWhitespace(
    decodeHtmlEntities(String(value).replace(/<[^>]+>/g, " ")),
  );
}

function normalizeTitle(value = "") {
  return stripHtml(value);
}

function normalizeAbstract(value = "") {
  return stripHtml(value);
}

function resolveYear(...candidates) {
  const currentYear = new Date().getFullYear() + 1;

  for (const candidate of candidates) {
    const match = String(candidate ?? "").match(/\d{4}/);
    const year = Number(match?.[0] ?? "");

    if (year >= 1900 && year <= currentYear) {
      return String(year);
    }
  }

  return "----";
}

function resolveBaseUrl(config = {}) {
  return normalizeBaseUrl(config.customApiBaseUrl);
}

function buildUrl(path, params, config) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = resolveBaseUrl(config);
  const absoluteUrl = baseUrl
    ? `${baseUrl}${normalizedPath}`
    : normalizedPath;
  const url = new URL(absoluteUrl, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return baseUrl ? url.toString() : `${url.pathname}${url.search}`;
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

async function requestJson(path, params, config) {
  if (config?.backend === BACKEND_YOKTEZ && !resolveBaseUrl(config)) {
    throw new Error("YÖK Tez server URL is required.");
  }

  return fetchJson(buildUrl(path, params, config));
}

function getOpenAlexFilterById(filterId = "all") {
  const matched = OPENALEX_FILTER_OPTIONS.find((option) => option.id === filterId);

  if (matched) {
    return matched;
  }

  if (filterId && String(filterId).includes(":")) {
    return {
      id: filterId,
      labelKey: "",
      fallbackLabel: filterId,
      search: "",
      filter: String(filterId),
    };
  }

  return OPENALEX_FILTER_OPTIONS[0];
}

function getCrossrefFilterById(filterId = "all") {
  const matched = CROSSREF_FILTER_OPTIONS.find((option) => option.id === filterId);

  if (matched) {
    return matched;
  }

  if (filterId && filterId !== "all") {
    return {
      id: filterId,
      labelKey: "",
      fallbackLabel: filterId,
      query: "",
      type: filterId,
    };
  }

  return CROSSREF_FILTER_OPTIONS[0];
}

function getSemanticScholarFilterById(filterId = "all") {
  return (
    SEMANTIC_SCHOLAR_FILTER_OPTIONS.find((option) => option.id === filterId) ??
    SEMANTIC_SCHOLAR_FILTER_OPTIONS[0]
  );
}

function getCoreFilterById(filterId = "all") {
  return (
    CORE_FILTER_OPTIONS.find((option) => option.id === filterId) ??
    CORE_FILTER_OPTIONS[0]
  );
}

function getPubMedFilterById(filterId = "all") {
  const matched = PUBMED_FILTER_OPTIONS.find((option) => option.id === filterId);

  if (matched) {
    return matched;
  }

  if (String(filterId).startsWith("mesh:")) {
    const label = decodeURIComponent(String(filterId).slice(5));

    return {
      id: filterId,
      labelKey: "",
      fallbackLabel: label,
      term: `"${label.replace(/"/g, '\\"')}"[MeSH Terms]`,
    };
  }

  return PUBMED_FILTER_OPTIONS[0];
}

function readText(parent, namespace, tagName) {
  return normalizeWhitespace(
    parent.getElementsByTagNameNS(namespace, tagName)[0]?.textContent ?? "",
  );
}


function buildAuthorLabel(names = []) {
  return names.filter(Boolean).join(", ");
}

function rebuildOpenAlexAbstract(index = {}) {
  if (!index || typeof index !== "object" || Array.isArray(index)) {
    return "";
  }

  const entries = Object.entries(index);
  if (entries.length === 0) {
    return "";
  }

  const words = [];

  entries.forEach(([word, positions]) => {
    positions.forEach((position) => {
      words[position] = word;
    });
  });

  return normalizeWhitespace(words.filter(Boolean).join(" "));
}

function pickKeywords(values = []) {
  return values
    .map((value) => normalizeWhitespace(value))
    .filter(Boolean)
    .slice(0, 5);
}

function dedupeItemsById(items = []) {
  const seen = new Set();

  return items.filter((item) => {
    const id = item?.id;

    if (!id || seen.has(id)) {
      return false;
    }

    seen.add(id);
    return true;
  });
}

function normalizePdfUrl(
  value = "",
  { allowCoreDownloadProxy = true, requirePdfLikePath = true } = {},
) {
  const url = normalizeWhitespace(value);

  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();
    const looksLikePdf =
      pathname.endsWith(".pdf") ||
      pathname.includes("/pdf/") ||
      pathname.includes("/download/pdf/");

    if (requirePdfLikePath && !looksLikePdf) {
      return "";
    }

    if (!allowCoreDownloadProxy && hostname.endsWith("core.ac.uk")) {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}

function buildHeaders(extraHeaders = {}) {
  return Object.fromEntries(
    Object.entries(extraHeaders).filter(([, value]) => Boolean(value)),
  );
}

function buildPubMedUrl(path, params = {}) {
  const url = new URL(`${PUBMED_EUTILS_BASE_URL}/${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

function buildSearchTerms(criteria = {}) {
  return [
    normalizeWhitespace(criteria.query),
    normalizeWhitespace(criteria.title),
    normalizeWhitespace(criteria.author),
    normalizeWhitespace(criteria.source),
  ].filter(Boolean);
}

function buildPubMedDateTerm(year) {
  const normalized = normalizeWhitespace(year);

  if (!normalized || normalized === "all") {
    return "";
  }

  if (/^\d{4}:\d{4}$/.test(normalized)) {
    const [startYear, endYear] = normalized.split(":");
    return `(${startYear}/01/01:${endYear}/12/31[Date - Publication])`;
  }

  if (/^\d{4}$/.test(normalized)) {
    return `(${normalized}/01/01:${normalized}/12/31[Date - Publication])`;
  }

  return normalized;
}

function buildPubMedTerm({ query = "", title = "", author = "", source = "", year = "", filterId = "all", contentLang = "all", requireAbstract = false } = {}) {
  const terms = [];
  const filter = getPubMedFilterById(filterId);

  if (normalizeWhitespace(query)) {
    terms.push(`(${normalizeWhitespace(query)}[Title/Abstract])`);
  }

  if (normalizeWhitespace(title)) {
    terms.push(`(${normalizeWhitespace(title)}[Title])`);
  }

  if (normalizeWhitespace(author)) {
    terms.push(`(${normalizeWhitespace(author)}[Author - Full])`);
  }

  if (normalizeWhitespace(source)) {
    terms.push(`(${normalizeWhitespace(source)}[Journal])`);
  }

  if (filter.term) {
    terms.push(`(${filter.term})`);
  }

  if (contentLang === "english") {
    terms.push("english[Language]");
  }

  const yearTerm = buildPubMedDateTerm(year);

  if (yearTerm) {
    terms.push(yearTerm);
  }

  terms.push("\"journal article\"[Publication Type]");

  if (requireAbstract) {
    terms.push("hasabstract[text]");
  }

  return terms.join(" AND ");
}

async function fetchPubMed(url, parseResponse, retries = 2) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(url);

    if (response.ok) {
      return parseResponse(response);
    }

    const shouldRetry =
      response.status === 429 ||
      (response.status >= 500 && response.status <= 599);

    if (!shouldRetry || attempt === retries) {
      throw new Error(`PubMed request failed: ${response.status}`);
    }

    lastError = new Error(`PubMed request failed: ${response.status}`);
    await new Promise((resolve) => {
      window.setTimeout(resolve, 350 * (attempt + 1));
    });
  }

  throw lastError ?? new Error("PubMed request failed.");
}

async function requestPubMedIds({
  term = "",
  retmax = 20,
  retstart = 0,
  sort = "relevance",
} = {}) {
  const data = await fetchPubMed(buildPubMedUrl("esearch.fcgi", {
    db: "pubmed",
    retmode: "json",
    term,
    retmax,
    retstart,
    sort,
  }), (response) => response.json());
  const result = data.esearchresult ?? {};

  return {
    ids: result.idlist ?? [],
    total: Number(result.count ?? 0),
  };
}

async function requestPubMedArticles(ids = []) {
  if (!ids.length) {
    return [];
  }

  const xmlText = await fetchPubMed(buildPubMedUrl("efetch.fcgi", {
    db: "pubmed",
    id: ids.join(","),
    retmode: "xml",
  }), (response) => response.text());
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "text/xml");

  if (xml.getElementsByTagName("parsererror").length > 0) {
    throw new Error("PubMed response could not be parsed.");
  }

  const items = Array.from(xml.getElementsByTagName("PubmedArticle")).map(normalizePubMedArticle);

  if (items.length > 0) {
    return items;
  }

  return requestPubMedSummaries(ids);
}

function readPubMedText(parent, tagName) {
  return normalizeWhitespace(parent?.getElementsByTagName(tagName)[0]?.textContent ?? "");
}

function buildPubMedAbstract(articleNode) {
  const abstractNodes = Array.from(articleNode?.getElementsByTagName("AbstractText") ?? []);

  return normalizeAbstract(
    abstractNodes
      .map((node) => {
        const label = normalizeWhitespace(node.getAttribute("Label") ?? "");
        const text = normalizeWhitespace(node.textContent ?? "");

        if (!text) {
          return "";
        }

        return label ? `${label}: ${text}` : text;
      })
      .filter(Boolean)
      .join(" "),
  );
}

function buildPubMedAuthors(articleNode) {
  return buildAuthorLabel(
    Array.from(articleNode?.getElementsByTagName("Author") ?? [])
      .map((authorNode) => {
        const collectiveName = readPubMedText(authorNode, "CollectiveName");

        if (collectiveName) {
          return collectiveName;
        }

        return normalizeWhitespace(
          [
            readPubMedText(authorNode, "ForeName"),
            readPubMedText(authorNode, "LastName"),
          ].filter(Boolean).join(" "),
        );
      })
      .filter(Boolean),
  );
}

function buildPubMedKeywords(citationNode, articleNode) {
  return pickKeywords([
    ...Array.from(citationNode?.getElementsByTagName("Keyword") ?? []).map((node) => node.textContent ?? ""),
    ...Array.from(citationNode?.getElementsByTagName("DescriptorName") ?? []).map((node) => node.textContent ?? ""),
    ...Array.from(articleNode?.getElementsByTagName("PublicationType") ?? []).map((node) => node.textContent ?? ""),
  ]);
}

function extractPubMedIds(pubmedDataNode) {
  return Array.from(pubmedDataNode?.getElementsByTagName("ArticleId") ?? []).reduce(
    (accumulator, node) => {
      const type = normalizeWhitespace(node.getAttribute("IdType") ?? "").toLowerCase();
      const value = normalizeWhitespace(node.textContent ?? "");

      if (type && value) {
        accumulator[type] = value;
      }

      return accumulator;
    },
    {},
  );
}

function normalizePubMedArticle(articleRoot) {
  const citationNode = articleRoot.getElementsByTagName("MedlineCitation")[0];
  const articleNode = citationNode?.getElementsByTagName("Article")[0];
  const pubmedDataNode = articleRoot.getElementsByTagName("PubmedData")[0];
  const pmid = readPubMedText(citationNode, "PMID");
  const articleIds = extractPubMedIds(pubmedDataNode);
  const journalTitle =
    readPubMedText(articleNode, "Title") ||
    readPubMedText(citationNode, "MedlineTA") ||
    "PubMed";
  const primaryTopic =
    readPubMedText(citationNode, "DescriptorName") ||
    readPubMedText(citationNode, "Keyword") ||
    readPubMedText(articleNode, "PublicationType") ||
    "PubMed";
  const pmcId = normalizeWhitespace(articleIds.pmc ?? "");

  return {
    id: pmid || articleIds.doi || readPubMedText(articleNode, "ArticleTitle"),
    title: normalizeTitle(readPubMedText(articleNode, "ArticleTitle")),
    abstract: buildPubMedAbstract(articleNode),
    author: buildPubMedAuthors(articleNode),
    university: journalTitle,
    department: normalizeWhitespace(primaryTopic) || "PubMed",
    year: resolveYear(
      readPubMedText(articleNode, "Year"),
      readPubMedText(citationNode, "Year"),
      readPubMedText(pubmedDataNode, "Year"),
    ),
    pdfUrl: pmcId ? `https://pmc.ncbi.nlm.nih.gov/articles/${pmcId}/pdf/` : "",
    detailPageUrl: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : "",
    keywords: buildPubMedKeywords(citationNode, articleNode),
  };
}

function extractPubMedSummaryIds(summary = {}) {
  return Array.isArray(summary.articleids)
    ? summary.articleids.reduce((accumulator, item) => {
      const type = normalizeWhitespace(item?.idtype ?? "").toLowerCase();
      const value = normalizeWhitespace(item?.value ?? "");

      if (type && value) {
        accumulator[type] = value;
      }

      return accumulator;
    }, {})
    : {};
}

function normalizePubMedSummary(summary = {}) {
  const articleIds = extractPubMedSummaryIds(summary);
  const pmid = normalizeWhitespace(summary.uid ?? "");
  const pmcId = normalizeWhitespace(articleIds.pmc ?? "");

  return {
    id: pmid || articleIds.doi || normalizeTitle(summary.title ?? ""),
    title: normalizeTitle(summary.title ?? ""),
    abstract: "",
    author: buildAuthorLabel((summary.authors ?? []).map((author) => author?.name)),
    university:
      normalizeWhitespace(summary.fulljournalname ?? summary.source ?? "PubMed") || "PubMed",
    department:
      normalizeWhitespace((summary.pubtype ?? [])[0] ?? "PubMed") || "PubMed",
    year: resolveYear(summary.pubdate, summary.epubdate, summary.sortpubdate),
    pdfUrl: pmcId ? `https://pmc.ncbi.nlm.nih.gov/articles/${pmcId}/pdf/` : "",
    detailPageUrl: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : "",
    keywords: pickKeywords(summary.pubtype ?? []),
  };
}

async function requestPubMedSummaries(ids = []) {
  if (!ids.length) {
    return [];
  }

  const data = await fetchPubMed(buildPubMedUrl("esummary.fcgi", {
    db: "pubmed",
    id: ids.join(","),
    retmode: "json",
  }), (response) => response.json());
  const result = data.result ?? {};
  const orderedIds = Array.isArray(result.uids) ? result.uids : ids;

  return orderedIds
    .map((id) => normalizePubMedSummary(result[id] ?? {}))
    .filter((item) => item.id && item.title);
}

async function requestPubMedDisciplines() {
  const query = [
    "PREFIX meshv: <http://id.nlm.nih.gov/mesh/vocab#>",
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
    "SELECT DISTINCT ?label ?tree WHERE {",
    "  ?d a meshv:TopicalDescriptor .",
    "  ?d meshv:active 1 .",
    "  ?d rdfs:label ?label .",
    "  ?d meshv:treeNumber ?tn .",
    "  ?tn rdfs:label ?tree .",
    "  FILTER(LANG(?label) = 'en') .",
    "  FILTER(REGEX(STR(?tree), '^[A-Z][0-9][0-9]$')) .",
    "}",
    "ORDER BY ?label",
  ].join("\n");
  const url = new URL(PUBMED_MESH_SPARQL_URL);

  url.searchParams.set("query", query);
  url.searchParams.set("format", "application/sparql-results+json");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/sparql-results+json",
    },
  });

  if (!response.ok) {
    throw new Error(`PubMed MeSH disciplines failed: ${response.status}`);
  }

  const data = await response.json();
  const items = (data?.results?.bindings ?? [])
    .map((item) => normalizeWhitespace(item?.label?.value ?? ""))
    .filter(Boolean)
    .map((label) => ({
      id: `mesh:${encodeURIComponent(label)}`,
      label,
      query: label,
    }));

  return {
    items: dedupeItemsById(items),
  };
}

function mergePubMedItems(summaryItems = [], detailedItems = []) {
  const detailsById = new Map(detailedItems.map((item) => [item.id, item]));

  return summaryItems.map((item) => {
    const detail = detailsById.get(item.id);

    if (!detail) {
      return item;
    }

    return {
      ...item,
      abstract: detail.abstract || item.abstract,
      pdfUrl: detail.pdfUrl || item.pdfUrl,
      keywords: detail.keywords?.length ? detail.keywords : item.keywords,
      department: detail.department || item.department,
      university: detail.university || item.university,
      author: detail.author || item.author,
      year: detail.year || item.year,
      detailPageUrl: detail.detailPageUrl || item.detailPageUrl,
    };
  });
}

async function requestPubMedSearch(criteria = {}, config = {}) {
  const limit = Math.min(Math.max(Number(criteria.limit) || 20, 1), 20);
  const year = criteria.year ?? config.year;
  const term = buildPubMedTerm({
    query: criteria.query,
    title: criteria.title,
    author: criteria.author,
    source: criteria.source,
    year,
    contentLang: config.contentLang,
    requireAbstract: false,
  });
  const { ids } = await requestPubMedIds({
    term,
    retmax: limit,
    retstart: 0,
    sort: "relevance",
  });
  const summaryItems = await requestPubMedSummaries(ids);
  const detailedItems = await requestPubMedArticles(ids).catch(() => []);

  return {
    items: dedupeItemsById(mergePubMedItems(summaryItems, detailedItems)),
  };
}

async function requestOpenAlexSearch(criteria = {}, config = {}) {
  const url = new URL(OPENALEX_API_URL);
  const limit = Math.min(Math.max(Number(criteria.limit) || 20, 1), 50);
  const searchTerms = buildSearchTerms(criteria);

  url.searchParams.set("per-page", String(limit));
  url.searchParams.set("sort", "relevance_score:desc");

  if (searchTerms.length > 0) {
    url.searchParams.set("search", searchTerms.join(" "));
  }

  const filters = [];
  if (normalizeWhitespace(criteria.title)) {
    filters.push(`title.search:${normalizeWhitespace(criteria.title)}`);
  }
  if (config.contentLang === "english") {
    filters.push("language:en");
  }

  const year = criteria.year ?? config.year;
  if (year && year !== "all") {
    filters.push(`publication_year:${year}`);
  }

  if (filters.length > 0) {
    url.searchParams.set("filter", filters.join(","));
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`OpenAlex search failed: ${response.status}`);
  }

  const data = await response.json();
  const queryAuthor = normalizeWhitespace(criteria.author).toLocaleLowerCase("en");
  const querySource = normalizeWhitespace(criteria.source).toLocaleLowerCase("en");

  const items = (data.results ?? [])
    .filter((item) => item.type !== "dataset")
    .map((item) => {
      const authors = (item.authorships ?? [])
        .map((authorship) => authorship.author?.display_name)
        .filter(Boolean);
      const primaryLocation = item.best_oa_location ?? item.primary_location ?? {};
      const primaryTopic = item.primary_topic;
      const venue = normalizeWhitespace(
        primaryLocation.source?.display_name ??
        primaryLocation.landing_page_url ??
        "OpenAlex",
      ) || "OpenAlex";

      return {
        id: item.id ?? item.ids?.openalex ?? item.doi ?? item.display_name,
        title: normalizeTitle(item.display_name ?? item.title ?? ""),
        abstract: normalizeAbstract(rebuildOpenAlexAbstract(item.abstract_inverted_index)),
        author: buildAuthorLabel(authors),
        university: venue,
        department:
          normalizeWhitespace(
            primaryTopic?.field?.display_name ??
            primaryTopic?.subfield?.display_name ??
            primaryTopic?.display_name ??
            item.type,
          ) || "OpenAlex",
        year: resolveYear(
          item.publication_year,
          item.publication_date,
          item.updated_date,
          item.created_date,
        ),
        pdfUrl: normalizePdfUrl(primaryLocation.pdf_url ?? item.open_access?.oa_url ?? "", {
          requirePdfLikePath: false,
        }),
        detailPageUrl: primaryLocation.landing_page_url ?? item.id ?? "",
        keywords: pickKeywords([
          ...(item.keywords ?? []).map((keyword) => keyword.display_name),
          ...(item.topics ?? []).map((topic) => topic.display_name),
          ...(item.concepts ?? []).map((concept) => concept.display_name),
        ]),
      };
    })
    .filter((item) =>
      !queryAuthor || item.author.toLocaleLowerCase("en").includes(queryAuthor),
    )
    .filter((item) =>
      !querySource || item.university.toLocaleLowerCase("en").includes(querySource),
    );

  return { items };
}

async function requestCrossrefSearch(criteria = {}, config = {}) {
  const url = new URL(CROSSREF_API_URL);
  const requestedRows = Math.min(Math.max(Number(criteria.limit) || 20, 1), 50);
  const effectiveRows =
    config.contentLang === "english"
      ? Math.min(Math.max(requestedRows * 3, requestedRows), 50)
      : requestedRows;

  url.searchParams.set("rows", String(effectiveRows));
  url.searchParams.set("sort", "relevance");
  url.searchParams.set("order", "desc");

  if (normalizeWhitespace(criteria.query)) {
    url.searchParams.set("query.bibliographic", normalizeWhitespace(criteria.query));
  }
  if (normalizeWhitespace(criteria.title)) {
    url.searchParams.set("query.title", normalizeWhitespace(criteria.title));
  }
  if (normalizeWhitespace(criteria.author)) {
    url.searchParams.set("query.author", normalizeWhitespace(criteria.author));
  }
  if (normalizeWhitespace(criteria.source)) {
    url.searchParams.set("query.container-title", normalizeWhitespace(criteria.source));
  }

  const filters = [];
  const year = criteria.year ?? config.year;
  if (year && year !== "all") {
    filters.push(`from-pub-date:${year}-01-01,until-pub-date:${year}-12-31`);
  }

  if (filters.length > 0) {
    url.searchParams.set("filter", filters.join(","));
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Crossref search failed: ${response.status}`);
  }

  const data = await response.json();
  const items = (data.message?.items ?? [])
    .filter((item) => (config.contentLang === "english" ? item.language === "en" : true))
    .slice(0, requestedRows)
    .map((item) => {
      const authors = (item.author ?? [])
        .map((author) =>
          normalizeWhitespace([author.given, author.family].filter(Boolean).join(" ")),
        )
        .filter(Boolean);
      const links = item.link ?? [];
      const pdfUrl =
        links.find((link) => String(link["content-type"] ?? "").includes("pdf"))?.URL ?? "";
      const title = normalizeWhitespace((item.title ?? [])[0] ?? "");
      const abstract = stripHtml(item.abstract ?? "");
      const subjects = pickKeywords([
        ...(item.subject ?? []),
        item.type,
        ...(item["container-title"] ?? []),
      ]);

      return {
        id: item.DOI ?? item.URL ?? title,
        title: normalizeTitle(title),
        abstract,
        author: buildAuthorLabel(authors),
        university:
          normalizeWhitespace((item["container-title"] ?? [])[0] ?? item.publisher ?? "Crossref") ||
          "Crossref",
        department:
          normalizeWhitespace((item.subject ?? [])[0] || humanizeTypeLabel(item.type) || "Crossref") ||
          "Crossref",
        year: resolveYear(
          item.issued?.["date-parts"]?.[0]?.[0],
          item.published?.["date-parts"]?.[0]?.[0],
          item.created?.["date-time"],
          item.indexed?.["date-time"],
        ),
        pdfUrl: normalizePdfUrl(pdfUrl),
        detailPageUrl: item.URL ?? item.resource?.primary?.URL ?? "",
        keywords: subjects,
      };
    });

  return { items };
}

async function requestCrossrefTypes() {
  const response = await fetch(CROSSREF_TYPES_URL, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Crossref types failed: ${response.status}`);
  }

  const data = await response.json();
  const items = (data.message?.items ?? [])
    .map((item) => ({
      id: normalizeWhitespace(item.id ?? ""),
      label: normalizeWhitespace(item.label ?? item.id ?? ""),
      query: normalizeWhitespace(item.label ?? item.id ?? ""),
    }))
    .filter((item) => item.id && item.label)
    .sort((a, b) => a.label.localeCompare(b.label, "en"));

  return {
    items,
  };
}

async function requestYoktezSearch(criteria = {}, config = {}) {
  const year = criteria.year ?? config.year;

  const data = await requestJson("/api/search", {
    q: criteria.query,
    title: criteria.title,
    author: criteria.author,
    source: criteria.source,
    year: year === "all" ? undefined : year,
    limit: criteria.limit ?? 20,
  }, config);

  return {
    items: dedupeItemsById(data.items ?? []),
  };
}



async function requestOpenAlexFeed({ page = 1, perPage = 4, filterId = "all", contentLang = "all", year = null } = {}) {
  const filter = getOpenAlexFilterById(filterId);
  const url = new URL(OPENALEX_API_URL);

  // Use OpenAlex's native sample/seed to shuffle results on every new session
  url.searchParams.set("sample", String(perPage));
  url.searchParams.set("seed", String(SESSION_SEED + page)); // seed shifts per page so cards don't repeat

  if (filter.search) {
    url.searchParams.set("search", filter.search);
  }

  const filters = [];
  if (filter.filter) {
    filters.push(filter.filter);
  }
  if (contentLang === "english") {
    filters.push("language:en");
  }
  if (year && year !== "all") {
    filters.push(`publication_year:${year}`);
  }

  if (filters.length > 0) {
    url.searchParams.set("filter", filters.join(","));
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`OpenAlex request failed: ${response.status}`);
  }

  const data = await response.json();
  const results = (data.results ?? []).filter((item) => item.type !== "dataset");
  const items = results.map((item) => {
    const authors = (item.authorships ?? [])
      .map((authorship) => authorship.author?.display_name)
      .filter(Boolean);
    const primaryLocation = item.best_oa_location ?? item.primary_location ?? {};
    const primaryTopic = item.primary_topic;
    const keywords = pickKeywords([
      ...(item.keywords ?? []).map((keyword) => keyword.display_name),
      ...(item.topics ?? []).map((topic) => topic.display_name),
      ...(item.concepts ?? []).map((concept) => concept.display_name),
    ]);

    return {
      id: item.id ?? item.ids?.openalex ?? item.doi ?? item.display_name,
      title: normalizeTitle(item.display_name ?? item.title ?? ""),
      abstract: normalizeAbstract(rebuildOpenAlexAbstract(item.abstract_inverted_index)),
      author: buildAuthorLabel(authors),
      university:
        normalizeWhitespace(
          primaryLocation.source?.display_name ??
          primaryLocation.landing_page_url ??
          "OpenAlex",
        ) || "OpenAlex",
      department:
        normalizeWhitespace(
          primaryTopic?.field?.display_name ??
          primaryTopic?.subfield?.display_name ??
          primaryTopic?.display_name ??
          item.type,
        ) || "OpenAlex",
      year: resolveYear(
        item.publication_year,
        item.publication_date,
        item.updated_date,
        item.created_date,
      ),
      pdfUrl: normalizePdfUrl(primaryLocation.pdf_url ?? item.open_access?.oa_url ?? "", {
        requirePdfLikePath: false,
      }),
      detailPageUrl: primaryLocation.landing_page_url ?? item.id ?? "",
      keywords,
    };
  });

  return {
    items,
    nextCursor: (data.results ?? []).length === perPage ? page + 1 : page,
  };
}

async function requestOpenAlexDisciplines(locale = DEFAULT_LOCALE) {
  const [fieldsResponse, subfieldsResponse] = await Promise.all([
    fetch("https://api.openalex.org/fields?per-page=50&sort=works_count:desc"),
    fetch("https://api.openalex.org/subfields?per-page=200&sort=works_count:desc"),
  ]);

  if (!fieldsResponse.ok || !subfieldsResponse.ok) {
    throw new Error("OpenAlex disciplines could not be loaded.");
  }

  const fieldsData = await fieldsResponse.json();
  const subfieldsData = await subfieldsResponse.json();

  const fieldItems = (fieldsData.results ?? []).map((item) => ({
    id: `primary_topic.field.id:${String(item.id ?? "").split("/").pop()}`,
    label: localizeOpenAlexLabel(item.display_name ?? "", locale),
    query: normalizeWhitespace(item.display_name ?? ""),
  }));

  const subfieldItems = (subfieldsData.results ?? []).map((item) => ({
    id: `primary_topic.subfield.id:${String(item.id ?? "").split("/").pop()}`,
    label: localizeOpenAlexLabel(item.display_name ?? "", locale),
    query: normalizeWhitespace(
      [item.display_name, item.field?.display_name].filter(Boolean).join(" "),
    ),
  }));

  return {
    items: dedupeItemsById([...fieldItems, ...subfieldItems]).filter((item) => item.label),
  };
}

async function requestCrossrefFeed({ offset = 0, rows = 4, filterId = "all", contentLang = "all", year = null } = {}) {
  const filter = getCrossrefFilterById(filterId);
  const url = new URL(CROSSREF_API_URL);
  const requestedRows = Math.max(Number(rows) || 4, 1);
  const effectiveRows =
    contentLang === "english"
      ? Math.min(Math.max(requestedRows * 3, requestedRows), 20)
      : requestedRows;
  const baseOffset = SESSION_BASE_OFFSET % CROSSREF_RANDOM_OFFSET_WINDOW;
  const safeOffset = (baseOffset + Math.max(Number(offset) || 0, 0)) % CROSSREF_MAX_OFFSET;

  url.searchParams.set("rows", String(effectiveRows));
  // Crossref rejects offsets above 10k, so keep paging in a safe window.
  url.searchParams.set("offset", String(safeOffset));
  // Remove deterministic sort so results vary
  url.searchParams.set("sort", "relevance");
  url.searchParams.set("order", "desc");

  if (filter.query) {
    url.searchParams.set("query.bibliographic", filter.query);
  }

  const filters = [];
  if (filter.type) {
    filters.push(`type:${filter.type}`);
  }
  if (year && year !== "all") {
    filters.push(`from-pub-date:${year}-01-01,until-pub-date:${year}-12-31`);
  }

  if (filters.length > 0) {
    url.searchParams.set("filter", filters.join(","));
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Crossref request failed: ${response.status}`);
  }

  const data = await response.json();
  const filteredResults = (data.message?.items ?? []).filter((item) =>
    contentLang === "english" ? item.language === "en" : true,
  );
  const items = filteredResults.slice(0, requestedRows).map((item) => {
    const authors = (item.author ?? [])
      .map((author) =>
        normalizeWhitespace([author.given, author.family].filter(Boolean).join(" ")),
      )
      .filter(Boolean);
    const links = item.link ?? [];
    const pdfUrl =
      links.find((link) => String(link["content-type"] ?? "").includes("pdf"))?.URL ?? "";
    const title = normalizeWhitespace((item.title ?? [])[0] ?? "");
    const abstract = stripHtml(item.abstract ?? "");
    const subjects = pickKeywords([
      ...(item.subject ?? []),
      item.type,
      ...(item["container-title"] ?? []),
    ]);

    return {
      id: item.DOI ?? item.URL ?? title,
      title: normalizeTitle(title),
      abstract,
      author: buildAuthorLabel(authors),
      university:
        normalizeWhitespace((item["container-title"] ?? [])[0] ?? item.publisher ?? "Crossref") ||
        "Crossref",
      department:
        normalizeWhitespace((item.subject ?? [])[0] || humanizeTypeLabel(item.type) || "Crossref") ||
        "Crossref",
      year: resolveYear(
        item.issued?.["date-parts"]?.[0]?.[0],
        item.published?.["date-parts"]?.[0]?.[0],
        item.created?.["date-time"],
        item.indexed?.["date-time"],
      ),
      pdfUrl: normalizePdfUrl(pdfUrl),
      detailPageUrl: item.URL ?? item.resource?.primary?.URL ?? "",
      keywords: subjects,
    };
  });

  return {
    items,
    nextCursor: filteredResults.length > 0 ? offset + effectiveRows : offset,
  };
}

async function requestSemanticScholarFeed({
  offset = 0,
  limit = 4,
  filterId = "all",
  apiKey = "",
  contentLang = "all",
  year = null,
} = {}) {
  const filter = getSemanticScholarFilterById(filterId);
  const url = new URL(SEMANTIC_SCHOLAR_API_URL);
  url.searchParams.set("query", filter.query);
  if (year && year !== "all") {
    url.searchParams.set("year", String(year));
  }
  // Randomise starting position so each session shows different papers
  url.searchParams.set("offset", String(SESSION_BASE_OFFSET + offset));
  url.searchParams.set("limit", String(limit));
  url.searchParams.set(
    "fields",
    [
      "title",
      "abstract",
      "year",
      "authors",
      "url",
      "openAccessPdf",
      "fieldsOfStudy",
      "publicationTypes",
      "venue",
    ].join(","),
  );

  const response = await fetch(url.toString(), {
    headers: buildHeaders({
      "x-api-key": apiKey.trim(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Semantic Scholar request failed: ${response.status}`);
  }

  const data = await response.json();
  const items = (data.data ?? []).map((item) => ({
    id: item.paperId ?? item.url ?? item.title,
    title: normalizeTitle(item.title ?? ""),
    abstract: normalizeAbstract(item.abstract ?? ""),
    author: buildAuthorLabel((item.authors ?? []).map((author) => author.name)),
    university: normalizeWhitespace(item.venue ?? "Semantic Scholar") || "Semantic Scholar",
    department:
      normalizeWhitespace((item.fieldsOfStudy ?? [])[0] ?? (item.publicationTypes ?? [])[0] ?? "Semantic Scholar") ||
      "Semantic Scholar",
    year: resolveYear(item.year),
    pdfUrl: normalizePdfUrl(item.openAccessPdf?.url ?? "", {
      requirePdfLikePath: false,
    }),
    detailPageUrl: item.url ?? "",
    keywords: pickKeywords([...(item.fieldsOfStudy ?? []), ...(item.publicationTypes ?? [])]),
  }));

  return {
    items,
    nextCursor: items.length === limit ? offset + limit : offset,
  };
}

async function requestCoreFeed({
  offset = 0,
  limit = 4,
  filterId = "all",
  apiKey = "",
  contentLang = "all",
  year = null,
} = {}) {
  const filter = getCoreFilterById(filterId);
  const url = new URL(CORE_API_URL);

  let query = filter.query;
  if (contentLang === "english") {
    query = `(${query}) AND language.name:English`;
  }
  if (year && year !== "all") {
    query = `(${query}) AND yearPublished:${year}`;
  }

  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));
  // Randomise starting position so each session shows different papers
  url.searchParams.set("offset", String(SESSION_BASE_OFFSET + offset));

  const response = await fetch(url.toString(), {
    headers: buildHeaders({
      Authorization: apiKey.trim() ? `Bearer ${apiKey.trim()}` : "",
    }),
  });

  if (!response.ok) {
    throw new Error(`CORE request failed: ${response.status}`);
  }

  const data = await response.json();
  const items = (data.results ?? data.data ?? []).map((item) => {
    const authors = Array.isArray(item.authors)
      ? item.authors.map((author) =>
        typeof author === "string"
          ? author
          : normalizeWhitespace(
            [author.name, author.given, author.family].filter(Boolean).join(" "),
          ),
      )
      : [];

    return {
      id: item.id ?? item.doi ?? item.oaiPmhUrl ?? item.downloadUrl ?? item.title,
      title: normalizeTitle(item.title ?? ""),
      abstract: normalizeAbstract(item.abstract ?? item.description ?? ""),
      author: buildAuthorLabel(authors),
      university:
        normalizeWhitespace(
          item.publisher ??
          item.journal ??
          item.dataProvider?.name ??
          item.repositoryDocument?.repositoryName ??
          "CORE",
        ) || "CORE",
      department:
        normalizeWhitespace(
          (item.topics ?? [])[0] ??
          (item.subjects ?? [])[0] ??
          (item.fields ?? [])[0] ??
          "CORE",
        ) || "CORE",
      year: resolveYear(item.yearPublished, item.publishedDate, item.createdDate),
      pdfUrl: normalizePdfUrl(item.downloadUrl ?? item.fullTextIdentifier ?? "", {
        allowCoreDownloadProxy: false,
      }),
      detailPageUrl: item.oaiPmhUrl ?? item.fullTextIdentifier ?? item.downloadUrl ?? "",
      keywords: pickKeywords([
        ...(item.topics ?? []),
        ...(item.subjects ?? []),
        ...(item.fields ?? []),
      ]),
    };
  });

  return {
    items,
    nextCursor: items.length === limit ? offset + limit : offset,
  };
}

async function requestPubMedFeed({
  offset = 0,
  limit = 4,
  filterId = "all",
  contentLang = "all",
  year = null,
} = {}) {
  const currentYear = new Date().getFullYear();
  const effectiveYear =
    year && year !== "all"
      ? year
      : `${currentYear - 1}:${currentYear + 1}`;
  const term = buildPubMedTerm({
    filterId,
    year: effectiveYear,
    contentLang,
    requireAbstract: true,
  });
  const { ids, total } = await requestPubMedIds({
    term,
    retmax: Math.max(Number(limit) || 4, 1),
    retstart: Math.max(Number(offset) || 0, 0),
    sort: "pub date",
  });
  const items = await requestPubMedArticles(ids);

  return {
    items,
    nextCursor: total > offset + ids.length ? offset + ids.length : offset,
  };
}

export function fetchDisciplines(config) {

  if (config?.backend === BACKEND_OPENALEX) {
    return requestOpenAlexDisciplines(config?.locale).catch(() => ({
      items: localizeOptions(OPENALEX_FILTER_OPTIONS, config?.locale)
        .filter((option) => option.id !== "all")
        .map((option) => ({
          id: option.filter || option.id,
          label: option.label,
          query: option.search || option.filter || option.id,
        })),
    }));
  }

  if (config?.backend === BACKEND_CROSSREF) {
    return requestCrossrefTypes();
  }

  if (config?.backend === BACKEND_SEMANTIC_SCHOLAR) {
    return Promise.resolve({
      items: localizeOptions(SEMANTIC_SCHOLAR_FILTER_OPTIONS, config?.locale)
        .filter((option) => option.id !== "all")
        .map((option) => ({
          id: option.id,
          label: option.label,
          query: option.query,
        })),
    });
  }

  if (config?.backend === BACKEND_CORE) {
    return Promise.resolve({
      items: localizeOptions(CORE_FILTER_OPTIONS, config?.locale)
        .filter((option) => option.id !== "all")
        .map((option) => ({
          id: option.id,
          label: option.label,
          query: option.query,
        })),
    });
  }

  if (config?.backend === BACKEND_PUBMED) {
    return requestPubMedDisciplines();
  }

  return requestJson("/api/disciplines", undefined, config);
}

export function fetchFeedPage(cursor, limit, config) {

  if (config?.backend === BACKEND_OPENALEX) {
    return requestOpenAlexFeed({
      page: Number(cursor ?? 1) || 1,
      perPage: Number(limit ?? 4),
      contentLang: config.contentLang,
      year: config.year,
    });
  }

  if (config?.backend === BACKEND_CROSSREF) {
    return requestCrossrefFeed({
      offset: Number(cursor ?? 0),
      rows: Number(limit ?? 4),
      contentLang: config.contentLang,
      year: config.year,
    });
  }

  if (config?.backend === BACKEND_SEMANTIC_SCHOLAR) {
    return requestSemanticScholarFeed({
      offset: Number(cursor ?? 0),
      limit: Number(limit ?? 4),
      apiKey: config.semanticScholarApiKey,
      contentLang: config.contentLang,
      year: config.year,
    });
  }

  if (config?.backend === BACKEND_CORE) {
    return requestCoreFeed({
      offset: Number(cursor ?? 0),
      limit: Number(limit ?? 4),
      apiKey: config.coreApiKey,
      contentLang: config.contentLang,
      year: config.year,
    });
  }

  if (config?.backend === BACKEND_PUBMED) {
    return requestPubMedFeed({
      offset: Number(cursor ?? 0),
      limit: Number(limit ?? 4),
      contentLang: config.contentLang,
      year: config.year,
    });
  }

  return requestJson("/api/feed", { cursor, limit, year: config.year }, config);
}

export function fetchDisciplineFeed(discipline, config) {

  if (config?.backend === BACKEND_OPENALEX) {
    return requestOpenAlexFeed({
      page: 1,
      perPage: 20,
      filterId: discipline,
      contentLang: config.contentLang,
      year: config.year,
    });
  }

  if (config?.backend === BACKEND_CROSSREF) {
    return requestCrossrefFeed({
      offset: 0,
      rows: 20,
      filterId: discipline,
      contentLang: config.contentLang,
      year: config.year,
    });
  }

  if (config?.backend === BACKEND_SEMANTIC_SCHOLAR) {
    return requestSemanticScholarFeed({
      offset: 0,
      limit: 20,
      filterId: discipline,
      apiKey: config.semanticScholarApiKey,
      contentLang: config.contentLang,
      year: config.year,
    });
  }

  if (config?.backend === BACKEND_CORE) {
    return requestCoreFeed({
      offset: 0,
      limit: 20,
      filterId: discipline,
      apiKey: config.coreApiKey,
      contentLang: config.contentLang,
      year: config.year,
    });
  }

  if (config?.backend === BACKEND_PUBMED) {
    return requestPubMedFeed({
      offset: 0,
      limit: 20,
      filterId: discipline,
      contentLang: config.contentLang,
      year: config.year,
    });
  }

  return requestJson("/api/discipline-feed", { discipline, year: config.year }, config);
}

export function fetchBackgroundImage({ title, keywords }, config) {
  const candidates = buildCandidateImageQueries({ title, keywords });

  return (async () => {
    for (const query of candidates) {
      const cacheKey = buildImageKey(query);
      const cached = getCachedImage(cacheKey);

      if (cached !== undefined) {
        return { item: cached };
      }

      try {
        const commonsResult = await fetchCommonsImage(query);

        if (commonsResult) {
          return { item: setCachedImage(cacheKey, commonsResult) };
        }

        const unsplashResult = await fetchUnsplashImage(query);

        if (unsplashResult) {
          return { item: setCachedImage(cacheKey, unsplashResult) };
        }
      } catch {
        // Ignore provider errors so the feed can continue without artwork.
      }

      setCachedImage(cacheKey, null, IMAGE_NEGATIVE_CACHE_TTL_MS);
    }

    return { item: null };
  })();
}

export function searchArticles(criteria, config) {
  if (config?.backend === BACKEND_OPENALEX) {
    return requestOpenAlexSearch(criteria, config);
  }

  if (config?.backend === BACKEND_CROSSREF) {
    return requestCrossrefSearch(criteria, config);
  }

  if (config?.backend === BACKEND_PUBMED) {
    return requestPubMedSearch(criteria, config);
  }

  return requestYoktezSearch(criteria, config);
}
