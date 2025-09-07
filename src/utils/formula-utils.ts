
const OPTIONAL_DEFAULTS: Record<string, Record<string, number>> = {
Breakdown: {
  sample_bag_mass: 0,
  floor_extract_mass: 0,   // common
  total_as: 0,
  total_bs: 0,
  total_labor_mins: 0      // if you use this in labor_hours
}

};

// Converts camelCase to snake_case for compatibility
export  function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function populateAllCalculatedValues(
  workType: string,
  payload: Record<string, any>
): Record<string, any> {
  const calculatedCache: Record<string, number> = {};
  const enhancedPayload = { ...payload };

  // Loop over all formulaMap entries for this work type
  for (const key in formulaMap) {
    if (key.startsWith(`${workType}:`)) {
      const fieldKey = key.split(":")[1];
      //   const hasExisting =
      // enhancedPayload[fieldKey] !== undefined &&
      // enhancedPayload[fieldKey] !== null &&
      // !(typeof enhancedPayload[fieldKey] === "string" && enhancedPayload[fieldKey].trim() === "");

    // if (hasExisting) continue;
      const result = evaluateFormula(workType, fieldKey, enhancedPayload, calculatedCache);
      if (result !== null) {
        enhancedPayload[fieldKey] = result;
      }
    }
  }

  return enhancedPayload;
}

// Central formula registry (DB field_key names)
export const formulaMap: Record<string, string> = {
  // HARVEST
  "Harvest:labor_hours": "team_size * duration_hours",
  "Harvest:plants_per_hour": "number_of_plants / labor_hours",
  "Harvest:grams_per_labor_hour": "wet_weight_grams / labor_hours",

  // MACHINE
   // MACHINE
  "Machine:trimmed_percentage": "(output_weight / input_weight) * 100",
"Machine:grams_per_operator_hour": "(output_weight*60)/ total_labor_mins",


  // HAND TRIM (snake_case to match DB)
  "Hand Trim:total_untrimmed": "total_premium + total_b_material",
  "Hand Trim:total_grams_per_hour": "total_untrimmed / (total_time_minutes / 60)",
  "Hand Trim:premium_grams_per_hour": "total_premium / (total_time_minutes / 60)",
  "Hand Trim:premium_retention_percentage": "(total_premium / total_untrimmed) * 100",
  "Hand Trim:variance": "premium_grams_per_hour - target",
  "Hand Trim:retention_percentage": "(total_premium / total_untrimmed) * 100",


  // BREAKDOWN
  "Breakdown:a_percentage": "(total_as / (total_as + total_bs)) * 100",
  "Breakdown:b_percentage": "(total_bs / (total_as + total_bs)) * 100",
  "Breakdown:total_flower_mass":
    "total_as + total_bs  + sample_bag_mass + floor_extract_mass",
  "Breakdown:total_time": "stop_time - start_time",
  "Breakdown:labor_hours": "total_time / 60",               // if you track minutes
"Breakdown:grams_per_labor_hour": "total_flower_mass / labor_hours",
};

/**
 * Extracts field dependencies from a formula string.
 */
export function getFormulaDependencies(formula: string): string[] {
  const dependencies: string[] = [];
  const fieldPattern = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
  let match;

  while ((match = fieldPattern.exec(formula)) !== null) {
    const field = match[0];
    if (!["return", "function", "var", "let", "const", "if", "else", "for", "while"].includes(field)) {
      dependencies.push(field);
    }
  }

  return [...new Set(dependencies)];
}

/**
 * Checks if all dependencies have valid numeric values.
 */
function validateDependencies(dependencies: string[], payload: Record<string, any>): boolean {
  return dependencies.every(dep => {
    const snakeDep = toSnakeCase(dep);
    const value = payload[dep] ?? payload[snakeDep];
    const numericValue = Number(value);
      if ((dep === "sample_bag_mass" || dep === "sampleBagMass") && (value === 0 || value === "0")) {
      return true;
    }
    return (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !isNaN(numericValue) &&
      isFinite(numericValue)
    );
  });
}

/**
 * Evaluates a formula for a given work type & field key using entry payload.
 */
export function evaluateFormula(
  workType: string,
  fieldKey: string,
  payload: Record<string, any>,
  calculatedCache: Record<string, number> = {}
): number | null {
  try {
    const formulaKey = `${workType}:${fieldKey}`;
    const formula = formulaMap[formulaKey];
    if (!formula) return null;

    if (calculatedCache[fieldKey] !== undefined) {
      return calculatedCache[fieldKey];
    }

    const dependencies = getFormulaDependencies(formula);
    const enhancedPayload = { ...payload };

    // map camelCase→snake_case into enhancedPayload (existing code)
    for (const dep of dependencies) {
      const snakeDep = toSnakeCase(dep);
      if (enhancedPayload[dep] === undefined && enhancedPayload[snakeDep] !== undefined) {
        enhancedPayload[dep] = enhancedPayload[snakeDep];
      }
    }

    // evaluate calculated deps (existing code)
    for (const dep of dependencies) {
      if (
        enhancedPayload[dep] === undefined ||
        enhancedPayload[dep] === null ||
        enhancedPayload[dep] === ""
      ) {
        const depFormulaKey = `${workType}:${dep}`;
        if (formulaMap[depFormulaKey]) {
          const calculatedValue = evaluateFormula(workType, dep, payload, calculatedCache);
          if (calculatedValue !== null) {
            enhancedPayload[dep] = calculatedValue;
            calculatedCache[dep] = calculatedValue;
          }
        }
      }
    }

    // 2) Apply optional defaults (e.g., sample_bag_mass => 0 for Breakdown)
    const defaultsForType = OPTIONAL_DEFAULTS[workType] || {};
    for (const dep of dependencies) {
      if (
        (enhancedPayload[dep] === undefined || enhancedPayload[dep] === null || enhancedPayload[dep] === "") &&
        Object.prototype.hasOwnProperty.call(defaultsForType, dep)
      ) {
        enhancedPayload[dep] = defaultsForType[dep];
      }
    }

    // 3) Validate deps AFTER defaults are applied
    if (!validateDependencies(dependencies, enhancedPayload)) {
      return null;
    }

    // 4) Substitute & evaluate (existing code)
    const safeFormula = formula.replace(/\b\w+\b/g, match => {
      if (!isNaN(Number(match))) return match;
      if (!dependencies.includes(match)) return match;
      const val = enhancedPayload[match] ?? enhancedPayload[toSnakeCase(match)];
      const num = Number(val);
      return !isNaN(num) && isFinite(num) ? num : 0;
    });

    const result = Function(`"use strict"; return (${safeFormula})`)();
    if (!isFinite(result)) return null;

    calculatedCache[fieldKey] = result;
    return result;
  } catch {
    return null;
  }
}
