export const SETTINGS_KEY = "resumeai_settings"

export const DEFAULT_SETTINGS = {
  defaultLocation: "India",
  jobSite: "linkedin",      // "linkedin" | "indeed" | "naukri"
  minMatch: 0,              // 0 | 60 | 80
  emailAlerts: true,        // "New job alerts" (in-app for now)
  showSkillGaps: true,
  useAiAnalysis: true,      // use Gemini when available
  fallbackToBasic: true,    // show basic analysis if AI fails
}

export function getSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")
    return { ...DEFAULT_SETTINGS, ...stored }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}