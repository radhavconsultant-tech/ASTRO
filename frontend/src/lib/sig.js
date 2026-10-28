export const planetHouses = (chart, lord, method = "cusp_based", agency = true) => {
  const s = chart?.significators?.[method]?.planets?.[lord];
  if (!s) return [];
  const hs = [...s.L1, ...s.L2, ...s.L3, ...s.L4, ...(agency && s.agency ? s.agency.houses : [])];
  return [...new Set(hs)].sort((a, b) => a - b);
};

export const houseSignificators = (chart, house, method = "cusp_based", agency = true) => {
  const h = chart?.significators?.[method]?.houses?.[String(house)];
  if (!h) return [];
  const all = ["A", "B", "C", "D"].flatMap((k) => [...h[k], ...(agency ? h.agency?.[k] || [] : [])]);
  return [...new Set(all)];
};

export const TOPICS = [
  { id: "job", label: "Job / career", house: 10, group: [2, 6, 10, 11] },
  { id: "marriage", label: "Marriage", house: 7, group: [2, 7, 11] },
  { id: "property", label: "Property / house", house: 4, group: [4, 11, 12] },
  { id: "finance", label: "Money / gains", house: 11, group: [2, 6, 11] },
  { id: "children", label: "Children", house: 5, group: [2, 5, 11] },
  { id: "travel", label: "Travel abroad", house: 12, group: [3, 9, 12] },
  { id: "health", label: "Recovery from illness", house: 6, group: [1, 5, 11] },
  { id: "education", label: "Education", house: 4, group: [4, 9, 11] },
  { id: "litigation", label: "Litigation", house: 6, group: [1, 6, 11] },
];
