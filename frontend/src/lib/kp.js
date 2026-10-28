export const KP_PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
export const ALL_PLANETS = [...KP_PLANETS, "Uranus", "Neptune"];

export const ABBR = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve",
  Saturn: "Sa", Rahu: "Ra", Ketu: "Ke", Uranus: "Ur", Neptune: "Ne", Earth: "Ea",
};

export const PLANET_COLOR = {
  Sun: "#F5B942", Moon: "#E2E8F0", Mars: "#EF6A4C", Mercury: "#B6C2CF", Jupiter: "#E0B07A",
  Venus: "#F3DDB0", Saturn: "#D9BF85", Rahu: "#22D3EE", Ketu: "#67E8F9", Uranus: "#7DD3FC",
  Neptune: "#7B93FA", Earth: "#5AB4FF",
};

export const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
export const SIGN_ABBR = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];

export const NAKSHATRAS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
  "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha",
  "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];

export const NAK_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

export const fmtLon = (lon) => {
  const d = Math.floor(lon);
  const m = Math.floor((lon - d) * 60);
  return `${String(d).padStart(3, "0")}°${String(m).padStart(2, "0")}′`;
};

export const angDiff = (a, b) => {
  let d = ((b - a) % 360 + 540) % 360 - 180;
  return d;
};

export const SAMPLE_CHART = {
  id: "sample", sample: true, name: "Sample chart", date: "1985-08-15", time: "10:30",
  place: "Hyderabad, Telangana, India", latitude: 17.385, longitude: 78.4867, tz: "Asia/Kolkata",
};
