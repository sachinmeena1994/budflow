
/**
 * Returns a CSS class for styling rows based on product category
 * @param category The product category string
 * @returns CSS class string or undefined if no match
 */
export function getCategoryColorClass(category?: string): string | undefined {
  if (!category) return undefined;
  
  const normalizedCategory = category.toLowerCase();
  
  // Define color mapping for product categories
  if (normalizedCategory.includes('flower')) return 'border-l-4 border-green-500';
  if (normalizedCategory.includes('vape')) return 'border-l-4 border-blue-500';
  if (normalizedCategory.includes('edible')) return 'border-l-4 border-orange-500';
  if (normalizedCategory.includes('concentrate')) return 'border-l-4 border-purple-500';
  if (normalizedCategory.includes('tincture')) return 'border-l-4 border-yellow-500';
  if (normalizedCategory.includes('topical')) return 'border-l-4 border-pink-500';
  if (normalizedCategory.includes('pre-roll') || normalizedCategory.includes('preroll')) return 'border-l-4 border-emerald-500';
  if (normalizedCategory.includes('beverage')) return 'border-l-4 border-cyan-500';
  if (normalizedCategory.includes('capsule')) return 'border-l-4 border-amber-500';
  if (normalizedCategory.includes('wax')) return 'border-l-4 border-indigo-500';
  if (normalizedCategory.includes('shatter')) return 'border-l-4 border-violet-500';
  if (normalizedCategory.includes('resin') || normalizedCategory.includes('rosin')) return 'border-l-4 border-fuchsia-500';
  if (normalizedCategory.includes('accessory') || normalizedCategory.includes('accessories')) return 'border-l-4 border-slate-500';
  
  return undefined;
}
