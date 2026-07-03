import { newId, type CriteriaGroup, type CriteriaRule } from "~/data";

/**
 * Eligibility — the domain + presentation layer for a programme's criteria.
 *
 * Picking an education level in the Create Programme wizard auto-configures a set
 * of eligibility criteria. Junior College carries the full agreed set (the one
 * shown in the design); every other level gets a sensible generic default
 * (nationality + education level) until its own set is agreed. The criteria are
 * plain {@link CriteriaGroup}s so they persist straight onto the programme.
 *
 * This module also owns the *reading* of those criteria — the natural-language
 * summary and the per-rule breakdown segments the slide-over renders — so the UI
 * never has to know a `criteriaType`'s wording.
 */

/**
 * The education levels a programme can open to (the wizard's Details step). A
 * product-wide constant — see `~/data` — so this list stays in step with the
 * project-request flow and the upload forms.
 */
export { EDUCATION_LEVELS, type EducationLevel } from "~/data";

// ── Default criteria per education level ──────────────────────────────────────

/** The A-Level subjects the JC set checks (each at H2). */
const JC_A_LEVEL_SUBJECTS = [
  "Mathematics (H2)",
  "Further Mathematics (H2)",
  "Physics (H2)",
  "Chemistry (H2)",
  "Biology (H2)",
  "Computing (H2)",
];

/**
 * The criteria a level loads by default. Groups are AND'd together; a group's
 * `matchType` says how its own rules combine. Fresh ids each call so the copy is
 * safe to mutate/persist.
 */
export function defaultCriteriaFor(level: string): CriteriaGroup[] {
  const identity: CriteriaGroup = {
    criteriaGroupId: newId(),
    matchType: "ALL",
    rules: [
      {
        criteriaRuleId: newId(),
        criteriaType: "nationality",
        operator: "any_of",
        value: ["Singapore Citizen"],
      },
      {
        criteriaRuleId: newId(),
        criteriaType: "education_level",
        operator: "is",
        value: level,
      },
    ],
  };

  // Only Junior College has its full academic set agreed for now; other levels
  // fall back to the identity group above (nationality + education level).
  if (level !== "Junior College") return [identity];

  const academic: CriteriaGroup = {
    criteriaGroupId: newId(),
    matchType: "ANY",
    rules: [
      {
        criteriaRuleId: newId(),
        criteriaType: "a_level_subject_grade",
        operator: "min_grade",
        value: JC_A_LEVEL_SUBJECTS,
        gradeValue: "B",
        optionId: "opt-a-level",
      },
      {
        criteriaRuleId: newId(),
        criteriaType: "ib_total_score",
        operator: "min",
        value: 40,
        optionId: "opt-ib",
      },
      {
        criteriaRuleId: newId(),
        criteriaType: "nus_high_cap",
        operator: "min",
        value: 4.5,
        optionId: "opt-nus-high",
      },
    ],
  };

  return [identity, academic];
}

/** Total number of rules across all groups — drives "N criteria configured". */
export function criteriaRuleCount(groups: CriteriaGroup[]): number {
  return groups.reduce((total, group) => total + group.rules.length, 0);
}

/** The application-form template a level maps to (Programme.formTemplate). */
export function applicationFormFor(level: string): string {
  switch (level) {
    case "Junior College":
      return "JC Intern Application Form";
    case "Polytechnic":
      return "Poly Intern Application Form";
    case "University":
      return "UG Intern Application Form";
    case "Post Junior College / Post Polytechnic":
      return "Post-JC / Post-Poly Application Form";
    case "Integrated Programme (IP)":
      return "IP Intern Application Form";
    default:
      return `${level} Application Form`;
  }
}

// ── Reading criteria: breakdown segments + natural-language summary ────────────

/** A run of text in a rule's description; `strong` renders as emphasised. */
export interface RuleSegment {
  text: string;
  strong?: boolean;
}

/** "a" / "an" for the following word — small touch for the grade phrasing. */
function article(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

/** Join a list with commas and a trailing "and": "A, B and C". */
function andList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (value == null) return [];
  return [String(value)];
}

/**
 * Describe one rule as emphasised/plain segments, e.g.
 * `[Nationality] is any of [Singapore Citizen]`. Unknown types degrade to a
 * readable "type operator value" so the model can grow without breaking the UI.
 */
export function describeRule(rule: CriteriaRule): RuleSegment[] {
  switch (rule.criteriaType) {
    case "nationality":
      return [
        { text: "Nationality", strong: true },
        { text: " is any of " },
        { text: andList(asStringArray(rule.value)), strong: true },
      ];
    case "education_level":
      return [
        { text: "Education Level", strong: true },
        { text: " is " },
        { text: String(rule.value), strong: true },
      ];
    case "a_level_subject_grade":
      return [
        { text: "A-Level Subject & Grade", strong: true },
        { text: " — " },
        { text: asStringArray(rule.value).join(", "), strong: true },
        { text: " min grade " },
        { text: String(rule.gradeValue ?? ""), strong: true },
      ];
    case "ib_total_score":
      return [
        { text: "IB Total Score (min)", strong: true },
        { text: " at least " },
        { text: String(rule.value), strong: true },
      ];
    case "nus_high_cap":
      return [
        { text: "NUS High CAP (min)", strong: true },
        { text: " at least " },
        { text: String(rule.value), strong: true },
      ];
    default:
      return [
        { text: humaniseType(rule.criteriaType), strong: true },
        { text: ` ${rule.operator} ` },
        { text: asStringArray(rule.value).join(", "), strong: true },
      ];
  }
}

/** "a_level_subject_grade" → "A Level Subject Grade" for unknown types. */
function humaniseType(type: string): string {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** One rule as a clause for the summary sentence, e.g. "be a Junior College student". */
function ruleClause(rule: CriteriaRule): string {
  switch (rule.criteriaType) {
    case "nationality": {
      const values = asStringArray(rule.value);
      return values.length ? `be a ${andList(values).replace(/ and /g, " or ")}` : "meet the nationality requirement";
    }
    case "education_level":
      return `be a ${String(rule.value)} student`;
    case "a_level_subject_grade": {
      const grade = String(rule.gradeValue ?? "");
      return `have achieved at least ${article(grade)} ${grade} in ${andList(asStringArray(rule.value))}`;
    }
    case "ib_total_score":
      return `have a minimum IB total score of ${String(rule.value)} points`;
    case "nus_high_cap":
      return `have a minimum NUS High CAP of ${String(rule.value)}`;
    default:
      return `satisfy ${humaniseType(rule.criteriaType).toLowerCase()}`;
  }
}

/** Distinct options within an ANY group, grouped by `optionId`. */
export function groupByOption(group: CriteriaGroup): CriteriaRule[][] {
  const byOption = new Map<string, CriteriaRule[]>();
  group.rules.forEach((rule, index) => {
    const key = rule.optionId ?? `option-${index}`;
    const bucket = byOption.get(key);
    if (bucket) bucket.push(rule);
    else byOption.set(key, [rule]);
  });
  return [...byOption.values()];
}

/**
 * A single readable sentence generated from the configured criteria, e.g.
 * "Applicants must be a Singapore Citizen and be a Junior College student, and
 * also have achieved at least a B in … or have a minimum IB total score of 40
 * points." Built from the groups so it stays true to whatever is configured.
 */
export function criteriaToSentence(groups: CriteriaGroup[]): string {
  if (groups.length === 0) return "No eligibility criteria configured yet.";

  const allGroups = groups.filter((g) => g.matchType === "ALL");
  const anyGroups = groups.filter((g) => g.matchType === "ANY");

  const mustClauses = allGroups.flatMap((g) => g.rules.map(ruleClause));
  let sentence = mustClauses.length
    ? `Applicants must ${andList(mustClauses)}`
    : "Applicants must meet the configured criteria";

  for (const group of anyGroups) {
    // Each ANY group is one distinct alternative set; options are OR'd.
    const options = groupByOption(group).map((rules) => rules.map(ruleClause).join(" and "));
    if (options.length) sentence += `, and also ${options.join(" or ")}`;
  }

  return `${sentence}.`;
}
