/**
 * Type definitions for Diputado (Chilean Congress Representative) data
 * Based on the API response from opendata.camara.cl
 */

/**
 * Political party information
 */
export interface Partido {
  /** Party ID code (e.g., "IND", "DEM", "PS") */
  Id: string;
  /** Full party name */
  Nombre: string;
  /** Party alias/abbreviation */
  Alias: string;
}

/**
 * Political party membership period
 */
export interface Militancia {
  /** Start date of membership (ISO 8601 format) */
  FechaInicio: string;
  /** End date of membership (ISO 8601 format) */
  FechaTermino: string;
  /** Party information */
  Partido: Partido;
}

/**
 * Container for party memberships
 * Note: Can be either a single Militancia object or an array
 */
export interface Militancias {
  Militancia: Militancia | Militancia[];
}

/**
 * Complete Diputado (Representative) information
 */
export interface Diputado {
  /** Unique identifier */
  Id: number;
  /** First name */
  Nombre: string;
  /** Second name (optional) */
  Nombre2: string;
  /** Paternal surname */
  ApellidoPaterno: string;
  /** Maternal surname */
  ApellidoMaterno: string;
  /** Birth date (ISO 8601 format) */
  FechaNacimiento: string;
  /** Chilean RUT (National ID) without verification digit */
  RUT: string;
  /** RUT verification digit */
  RUTDV: string;
  /** Gender */
  Sexo: "Masculino" | "Femenino" | string;
  /** Political party memberships */
  Militancias: Militancias;
}

/**
 * Helper type: Normalized Militancia array
 * Use this when you need to work with militancias as an array
 */
export type MilitanciaArray = Militancia[];

/**
 * Utility function to normalize Militancias to always be an array
 */
export function normalizeMilitancias(militancias: Militancias): Militancia[] {
  if (Array.isArray(militancias.Militancia)) {
    return militancias.Militancia;
  }
  return [militancias.Militancia];
}

/**
 * Utility function to get the current party membership
 */
export function getCurrentMilitancia(diputado: Diputado): Militancia | null {
  const militancias = normalizeMilitancias(diputado.Militancias);
  const now = new Date();

  return (
    militancias.find((m) => {
      const inicio = new Date(m.FechaInicio);
      const termino = new Date(m.FechaTermino);
      return now >= inicio && now <= termino;
    }) || null
  );
}

/**
 * Utility function to get the diputado's full name
 */
export function getFullName(diputado: Diputado): string {
  const parts = [
    diputado.Nombre,
    diputado.Nombre2,
    diputado.ApellidoPaterno,
    diputado.ApellidoMaterno,
  ].filter(Boolean);

  return parts.join(" ");
}

/**
 * Merged militancia type - represents one or more sequential periods with the same party
 */
export interface MergedMilitancia {
  /** Party information */
  Partido: Partido;
  /** Start date of the first period (ISO 8601 format) */
  FechaInicio: string;
  /** End date of the last period (ISO 8601 format) */
  FechaTermino: string;
  /** Number of periods merged */
  periodCount: number;
  /** Original militancias that were merged */
  originalMilitancias: Militancia[];
}

/**
 * Utility function to merge sequential militancias from the same party
 * This consolidates multiple consecutive periods with the same party into a single entry
 */
export function mergeSequentialMilitancias(
  militancias: Militancias
): MergedMilitancia[] {
  const normalized = normalizeMilitancias(militancias);

  // Sort by start date (oldest first)
  const sorted = [...normalized].sort(
    (a, b) =>
      new Date(a.FechaInicio).getTime() - new Date(b.FechaInicio).getTime()
  );

  const merged: MergedMilitancia[] = [];

  for (const militancia of sorted) {
    const lastMerged = merged[merged.length - 1];

    // Check if we can merge with the last entry
    if (
      lastMerged &&
      lastMerged.Partido.Id === militancia.Partido.Id &&
      arePeriodsSequential(lastMerged.FechaTermino, militancia.FechaInicio)
    ) {
      // Extend the last merged entry
      lastMerged.FechaTermino = militancia.FechaTermino;
      lastMerged.periodCount += 1;
      lastMerged.originalMilitancias.push(militancia);
    } else {
      // Create a new merged entry
      merged.push({
        Partido: militancia.Partido,
        FechaInicio: militancia.FechaInicio,
        FechaTermino: militancia.FechaTermino,
        periodCount: 1,
        originalMilitancias: [militancia],
      });
    }
  }

  return merged;
}

/**
 * Helper function to check if two periods are sequential (consecutive)
 * Allows for a small gap (up to 1 day) to account for timing differences
 */
function arePeriodsSequential(endDate: string, startDate: string): boolean {
  const end = new Date(endDate);
  const start = new Date(startDate);

  // Calculate difference in days
  const diffInMs = start.getTime() - end.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  // Consider sequential if start is within 1 day after end
  return diffInDays >= 0 && diffInDays <= 1;
}

/**
 * Region information
 */
export interface Region {
  /** Region ID */
  Id: string;
  /** Region name */
  Nombre: string;
}

/**
 * Electoral district information
 */
export interface Circunscripcion {
  /** District ID */
  Id: string;
  /** District name */
  Nombre: string;
}

/**
 * Diputado period information (what the API returns)
 */
export interface DiputadoPeriodo {
  /** Representative information */
  Diputado: Diputado;
  /** Region represented */
  Region?: Region;
  /** Electoral district */
  Circunscripcion?: Circunscripcion;
  /** Email address */
  Email?: string;
  /** Period ID */
  IdPeriodo?: number;
}
