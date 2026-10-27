// Open-Meteo weather service (free, no API key)
import { WeatherData } from '@/types';

const WMO: Record<number, string> = {
  0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',
  45:'Fog',48:'Icy fog',51:'Light drizzle',53:'Moderate drizzle',55:'Dense drizzle',
  61:'Slight rain',63:'Moderate rain',65:'Heavy rain',71:'Slight snow',73:'Moderate snow',
  75:'Heavy snow',80:'Slight showers',81:'Moderate showers',82:'Violent showers',
  95:'Thunderstorm',96:'Thunderstorm with hail',99:'Thunderstorm with heavy hail',
};

function dir(deg: number) {
  return ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(deg/22.5)%16];
}

function alerts(code: number, wind: number, precip: number): string[] {
  const a: string[] = [];
  if (code >= 95) a.push('⚡ Thunderstorm warning — outdoor ops hazardous');
  if (code >= 65) a.push('🌧️ Heavy rain — flooding risk elevated');
  if (wind > 50) a.push('💨 Strong winds — aerial/marine ops restricted');
  if (wind > 30) a.push('💨 Moderate winds — monitor rescue conditions');
  if (precip > 10) a.push('🌊 High precipitation — flash flood risk');
  return a;
}

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,weathercode,visibility&timezone=auto&forecast_days=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error('API error');
    const d = await res.json();
    const c = d.current;
    const code = c.weathercode ?? 0;
    const wind = c.wind_speed_10m ?? 0;
    const precip = c.precipitation ?? 0;
    return {
      temperature: c.temperature_2m ?? 25,
      conditions: WMO[code] ?? 'Unknown',
      humidity: c.relative_humidity_2m ?? 60,
      windSpeed: wind,
      windDirection: dir(c.wind_direction_10m ?? 0),
      precipitation: precip,
      visibility: (c.visibility ?? 10000) / 1000,
      alerts: alerts(code, wind, precip),
      source: 'Open-Meteo',
      observedAt: new Date().toISOString(),
      isDemo: false,
    };
  } catch {
    return {
      temperature: 25, conditions: 'Data unavailable (demo)', humidity: 65,
      windSpeed: 15, windDirection: 'N', precipitation: 0, visibility: 10,
      alerts: [], source: 'Demo — weather API unavailable',
      observedAt: new Date().toISOString(), isDemo: true,
    };
  }
}

export async function getWeatherHealthStatus() {
  try {
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.6&longitude=77.2&current=temperature_2m', { signal: AbortSignal.timeout(5000) });
    return { ok: r.ok, demo: false };
  } catch { return { ok: false, demo: true }; }
}

