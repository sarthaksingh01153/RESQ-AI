'use client'

import React, { useEffect, useState } from 'react'
import { Cloud, Wind, Thermometer, Droplets, AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeatherData {
  temperature: number
  windSpeed: number
  humidity: number
  weatherCode: number
  description: string
  alerts: string[]
  isDemo: boolean
}

interface WeatherWidgetProps {
  lat?: number
  lon?: number
  className?: string
}

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear Sky'
  if (code <= 3) return 'Partly Cloudy'
  if (code <= 49) return 'Foggy'
  if (code <= 69) return 'Drizzle / Rain'
  if (code <= 79) return 'Snow'
  if (code <= 99) return 'Thunderstorm'
  return 'Unknown'
}

export function WeatherWidget({ lat = 28.6139, lon = 77.209, className }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}`)
      if (!res.ok) throw new Error('Failed to fetch weather')
      const data = await res.json()
      setWeather(data)
    } catch {
      setError('Unable to load weather data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
  }, [lat, lon])

  if (loading) {
    return (
      <div className={cn('rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm', className)}>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-slate-100 rounded w-1/3" />
          <div className="h-8 bg-slate-100 rounded w-1/2" />
          <div className="h-3 bg-slate-100 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className={cn('rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm', className)}>
        <p className="text-sm text-slate-400">{error || 'No weather data'}</p>
        <button onClick={fetchWeather} className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1">
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className={cn('rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-slate-700">Weather Conditions</span>
        </div>
        <div className="flex items-center gap-2">
          {weather.isDemo && (
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
              Demo
            </span>
          )}
          <button onClick={fetchWeather} className="text-slate-400 hover:text-slate-700">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="flex flex-col items-center">
          <Thermometer className="h-4 w-4 text-orange-500 mb-1" />
          <span className="text-lg font-bold text-slate-900">{weather.temperature}°C</span>
          <span className="text-xs text-slate-400">Temp</span>
        </div>
        <div className="flex flex-col items-center">
          <Wind className="h-4 w-4 text-cyan-500 mb-1" />
          <span className="text-lg font-bold text-slate-900">{weather.windSpeed}</span>
          <span className="text-xs text-slate-400">km/h</span>
        </div>
        <div className="flex flex-col items-center">
          <Droplets className="h-4 w-4 text-blue-500 mb-1" />
          <span className="text-lg font-bold text-slate-900">{weather.humidity}%</span>
          <span className="text-xs text-slate-400">Humidity</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-2">{weather.description || getWeatherDescription(weather.weatherCode)}</p>

      {weather.alerts && weather.alerts.length > 0 && (
        <div className="mt-2 space-y-1">
          {weather.alerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
              <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-amber-800">{alert}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
