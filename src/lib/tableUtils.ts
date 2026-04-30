export type WorldFlavor = 'Classic' | 'Heroic' | 'Gritty';

/**
 * Resolves a table name based on the requested world flavor.
 * Mitigates issues where not all tables have different variants for world types.
 * 
 * E.g., If looking for "Potions" with worldType "Heroic":
 * 1. Checks if "Potions (Heroic)" exists.
 * 2. Checks if "Potions (Classic)" exists (as a generic fallback).
 * 3. Checks if "Potions" exists.
 * 4. Returns the original name as a last resort.
 */
export function resolveTableName(
  baseName: string, 
  worldType: WorldFlavor | string, 
  availableTables: string[]
): string {
  // If it's classic, try the base name or an explicit Classic one.
  if (worldType === 'Classic') {
    const classicName = `${baseName} (Classic)`;
    if (availableTables.includes(classicName)) return classicName;
    if (availableTables.includes(baseName)) return baseName;
  } else {
    // For non-classic types, try the specific version first
    const variantName = `${baseName} (${worldType})`;
    if (availableTables.includes(variantName)) return variantName;
    
    // Fallbacks
    const classicName = `${baseName} (Classic)`;
    if (availableTables.includes(classicName)) return classicName;
    if (availableTables.includes(baseName)) return baseName;
  }
  
  // Last resort, just return the base
  return baseName;
}

/**
 * Convenience function to grab an entry from a dictionary mapping table names to values.
 */
export function selectWorldVariant<T>(
  dictionary: Record<string, T>, 
  baseKey: string, 
  worldType: WorldFlavor | string
): T {
  const availableTables = Object.keys(dictionary);
  const resolvedKey = resolveTableName(baseKey, worldType, availableTables);
  
  const result = dictionary[resolvedKey];
  
  if (result === undefined) {
    console.error(`[tableUtils] Table "${baseKey}" not found in dictionary for any flavor. Available tables:`, availableTables);
    throw new Error(`Table ${baseKey} not found.`);
  }
  
  return result;
}
