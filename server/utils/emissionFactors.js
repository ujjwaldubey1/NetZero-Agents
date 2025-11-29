export const factors = {
  diesel_liters: 2.68, // kg CO2 per liter
  electricity_kwh: 0.4, // kg CO2 per kWh (example grid factor)
  refrigerant_kg: 1300, // kg CO2e per kg (example)
};

export const computeTotals = (records = []) => {
  const totals = { scope1: {}, scope2: {}, scope3: {} };
  const sumField = (obj, key, value) => {
    obj[key] = (obj[key] || 0) + (Number(value) || 0);
  };
  records.forEach((rec) => {
    const data = rec.extractedData || {};
    if (rec.scope === 1 && data.scope1) {
      Object.entries(data.scope1).forEach(([k, v]) => sumField(totals.scope1, k, v));
    }
    if (rec.scope === 2 && data.scope2) {
      Object.entries(data.scope2).forEach(([k, v]) => sumField(totals.scope2, k, v));
    }
    if (rec.scope === 3 && data.scope3) {
      Object.entries(data.scope3).forEach(([k, v]) => sumField(totals.scope3, k, v));
    }
  });
  return totals;
};

export const computeCo2e = (data) => {
  const co2e = {};
  Object.entries(data || {}).forEach(([key, value]) => {
    if (factors[key]) {
      co2e[`${key}_co2e_tons`] = ((Number(value) || 0) * factors[key]) / 1000;
    }
  });
  return co2e;
};
