import ci from "ci-info"

const CI_DEFINITIONS = [
  envFromCIandCIName,
  getEnvDetect({ key: `NOW_BUILDER_ANNOTATE`, name: `ZEIT Now` }),
  getEnvDetect({ key: `NOW_REGION`, name: `ZEIT Now v1` }),
  getEnvDetect({ key: `VERCEL_URL`, name: `Vercel Now` }),
  getEnvDetect({ key: `NOW_BUILDER`, name: `Vercel Now` }),
  herokuDetect,
  getEnvFromCIInfo,
  envFromCIWithNoName,
]

function lookupCI(): string | null {
  for (const fn of CI_DEFINITIONS) {
    try {
      const res = fn()
      if (res) {
        return res
      }
    } catch (e) {
      // ignore
    }
  }
  return null
}
const CIName = lookupCI()

/**
 * Determines whether the environment where the code is running is in CI
 * @return true if the environment is in CI, false otherwise
 */

export function isCI(): boolean {
  return !!CIName
}

/**
 * Gets the name of the CI environment (e.g. "ZEIT Now", "Heroku", etc.)
 * @return The name of the CI if available. Defaults to null if not in CI
 */

export function getCIName(): string | null {
  if (!isCI()) {
    return null
  }
  return CIName
}

function getEnvFromCIInfo(): string | null {
  if (ci.isCI) return ci.name || `ci-info detected w/o name`
  return null
}

function getEnvDetect({
  key,
  name,
}: {
  key: string
  name: string
}): () => string | null {
  return function (): string | null {
    if (process.env[key]) {
      return name
    }
    return null
  }
}

function herokuDetect(): false | "Heroku" {
  return (
    typeof process.env.NODE === `string` &&
    /\.heroku\/node\/bin\/node/.test(process.env.NODE) &&
    `Heroku`
  )
}

function envFromCIandCIName(): string | null {
  if (process.env.CI_NAME && process.env.CI) {
    return process.env.CI_NAME
  }
  return null
}

function envFromCIWithNoName(): "CI detected without name" | null {
  if (process.env.CI) {
    return `CI detected without name`
  }
  return null
}
