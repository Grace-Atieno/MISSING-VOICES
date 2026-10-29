export const STORAGE_KEY = "missing-voices.demo-records.v1";

export const COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa",
  "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
  "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu",
  "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa",
  "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua",
  "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
];

export const CATEGORIES = ["Child", "Woman/Girl", "Adult", "Elderly", "Person with Disability"];

export const STATUSES = ["Missing", "Found - Alive", "Found - Deceased", "Deceased", "Under Investigation"];

export const DEMO_RECORDS = [
  {
    id: "DEMO-001",
    firstName: "Sample",
    lastName: "Child",
    age: 12,
    gender: "Not specified",
    category: "Child",
    county: "Nairobi",
    status: "Missing",
    reportDate: "2025-01-15",
    description: "Fictional example record for demonstrating search and case details.",
    reportedBy: "Demo reporter",
    contact: "",
    linkedHospital: "",
    linkedMorgue: "",
  },
  {
    id: "DEMO-002",
    firstName: "Example",
    lastName: "Adult",
    age: 34,
    gender: "Not specified",
    category: "Adult",
    county: "Kisumu",
    status: "Found - Alive",
    reportDate: "2025-02-02",
    description: "Fictional example record showing a resolved case status.",
    reportedBy: "Demo reporter",
    contact: "",
    linkedHospital: "",
    linkedMorgue: "",
  },
  {
    id: "DEMO-003",
    firstName: "Demo",
    lastName: "Elder",
    age: 68,
    gender: "Not specified",
    category: "Elderly",
    county: "Mombasa",
    status: "Under Investigation",
    reportDate: "2025-03-10",
    description: "Fictional example record for demonstrating county and status filters.",
    reportedBy: "Demo reporter",
    contact: "",
    linkedHospital: "",
    linkedMorgue: "",
  },
];

const isDateString = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const isStoredRecord = (record) => (
  record !== null
  && typeof record === "object"
  && typeof record.id === "string"
  && record.id.length > 0
  && typeof record.firstName === "string"
  && record.firstName.trim().length > 0
  && typeof record.lastName === "string"
  && record.lastName.trim().length > 0
  && Number.isInteger(record.age)
  && record.age >= 0
  && record.age <= 130
  && ["Female", "Male", "Not specified"].includes(record.gender)
  && CATEGORIES.includes(record.category)
  && COUNTIES.includes(record.county)
  && STATUSES.includes(record.status)
  && isDateString(record.reportDate)
  && typeof record.description === "string"
  && typeof record.reportedBy === "string"
  && typeof record.contact === "string"
  && typeof record.linkedHospital === "string"
  && typeof record.linkedMorgue === "string"
);

const isRecordList = (records) => (
  Array.isArray(records)
  && records.every(isStoredRecord)
  && new Set(records.map((record) => record.id)).size === records.length
);

export function loadRecords(storage) {
  try {
    const stored = (storage ?? globalThis.localStorage).getItem(STORAGE_KEY);
    if (stored === null) return { records: DEMO_RECORDS, error: "" };

    const records = JSON.parse(stored);
    if (!isRecordList(records)) {
      throw new Error("Saved browser data has an invalid format.");
    }
    return { records, error: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "The browser storage operation failed.";
    return { records: [], error: `Saved records could not be loaded. ${message}` };
  }
}

export function saveRecords(records, storage) {
  if (!isRecordList(records)) {
    throw new TypeError("Refusing to save invalid case records.");
  }
  (storage ?? globalThis.localStorage).setItem(STORAGE_KEY, JSON.stringify(records));
}

export function createCaseId(records, date = new Date()) {
  const existingIds = new Set(records.map((record) => record.id));
  const year = date.getFullYear();
  let suffix = Date.now().toString().slice(-8);
  let id = `MP-${year}-${suffix}`;
  while (existingIds.has(id)) {
    suffix = String(Number(suffix) + 1).padStart(8, "0").slice(-8);
    id = `MP-${year}-${suffix}`;
  }
  return id;
}
