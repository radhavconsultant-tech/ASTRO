import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;
const client = BASE ? axios.create({ baseURL: `${BASE}/api`, timeout: 15000 }) : null;

const need = () => {
  if (!client) throw new Error("Backend not configured");
  return client;
};

export const fetchChart = async (c) => {
  const body = { name: c.name, date: c.date, time: c.time, latitude: Number(c.latitude), longitude: Number(c.longitude) };
  if (c.tz) body.tz = c.tz;
  else body.utc_offset = Number(c.utc_offset);
  const { data } = await need().post("/chart", body);
  return data;
};

export const fetchSky = async (iso) => {
  const { data } = await need().get("/sky", { params: { utc: iso } });
  return data;
};

export const searchCities = async (q) => {
  const { data } = await need().get("/cities", { params: { q } });
  return Array.isArray(data?.results) ? data.results : [];
};
