function formatUomValue(value: any, uom: string, fallback: string = '0') {
  if (uom === 'WeightRatio') {
    return value ? `${value} mg/g` : '0 mg/g';
  } else if (uom === 'Percentage') {
    return value !== undefined && value !== null ? `${value}%` : '0%';
  }
  return fallback;
}

export function mapTHCCBDColumns(data: any[]) {
  return data.map((row) => {
    const thc_total_uom = row.thc_total_uom === 'WeightRatio' || row.weightratio ? 'WeightRatio' : row.thc_total_uom;
    const cbd_total_uom = row.cbd_total_uom === 'WeightRatio' || row.weightage ? 'WeightRatio' : row.cbd_total_uom;

    return {
      ...row,
      thc_total_uom,
      thc_value: formatUomValue(row.thc_value, thc_total_uom),
      cbd_total_uom,
      cbd_value: formatUomValue(row.cbd_value, cbd_total_uom),
    };
  });
}
