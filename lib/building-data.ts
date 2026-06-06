export type FloorUse =
  | 'Oficinas'
  | 'Lobby + Visitas'
  | 'Parqueo estructurado'
  | 'Parqueo subterráneo'
  | 'Crown / Eventos'

export type Floor = {
  id: string
  label: string
  use: FloorUse
  grossArea: number   // m² brutos
  netArea: number     // m² rentables
  spaces?: number     // plazas de parqueo
  isGroundLevel?: boolean
  isBelowGrade?: boolean
}

// ── Real project constants ──────────────────────────────────────
export const REAL = {
  // Per level
  M2_SOTANO:       2316,   // m² brutos por nivel soterrado
  M2_RASANTE:      1900,   // m² brutos por nivel sobre rasante
  M2_OFICINA_BRUTO:1380,   // m² brutos por piso tipo oficinas
  M2_OFICINA_NETO: 1140,   // m² netos rentables por piso tipo
  M2_CROWN_BRUTO:  1380,   // m² brutos crown N13
  M2_CROWN_NETO:   337,    // m² rentables crown N13 (eventos + terraza)
  M2_LOBBY:        2316,   // m² brutos planta baja
  PLAZAS_SOTANO:   51,     // plazas por nivel soterrado
  PLAZAS_RASANTE:  41,     // plazas por nivel rasante
  PLAZAS_VISITA:   35,     // plazas visita en PB (no comercializables)
  RESTITUTION:     160,    // plazas restituidas al edificio vecino (obligación)
} as const

export type LevelCounts = {
  officeLevels:              number
  structuredParkingLevels:   number
  undergroundParkingLevels:  number
}

export const DEFAULT_LEVELS: LevelCounts = {
  officeLevels:             6,
  structuredParkingLevels:  5,
  undergroundParkingLevels: 3,
}

export function isParking(use: FloorUse): boolean {
  return use === 'Parqueo estructurado' || use === 'Parqueo subterráneo'
}

export function generateFloors(counts: LevelCounts): Floor[] {
  const floors: Floor[] = []

  // ── Crown N13 (top) ──────────────────────────────────────────
  floors.push({
    id: 'crown',
    label: 'N13 Crown',
    use: 'Crown / Eventos',
    grossArea: REAL.M2_CROWN_BRUTO,
    netArea:   REAL.M2_CROWN_NETO,
  })

  // ── Office floors N12 down ────────────────────────────────────
  const topOfficeLevel = 12
  for (let i = 0; i < counts.officeLevels; i++) {
    const lvl = topOfficeLevel - i
    floors.push({
      id: `office-${lvl}`,
      label: `N${String(lvl).padStart(2, '0')}`,
      use: 'Oficinas',
      grossArea: REAL.M2_OFICINA_BRUTO,
      netArea:   REAL.M2_OFICINA_NETO,
    })
  }

  // ── Structured parking above grade ───────────────────────────
  for (let i = counts.structuredParkingLevels; i >= 1; i--) {
    floors.push({
      id: `pk-${i}`,
      label: `N${String(i + 1).padStart(2, '0')}`,
      use: 'Parqueo estructurado',
      grossArea: REAL.M2_RASANTE,
      netArea:   0,
      spaces:    REAL.PLAZAS_RASANTE,
    })
  }

  // ── Ground floor N01 ─────────────────────────────────────────
  floors.push({
    id: 'pb',
    label: 'N01',
    use: 'Lobby + Visitas',
    grossArea: REAL.M2_LOBBY,
    netArea:   0,
    spaces:    REAL.PLAZAS_VISITA,
    isGroundLevel: true,
  })

  // ── Underground parking ───────────────────────────────────────
  for (let i = 1; i <= counts.undergroundParkingLevels; i++) {
    floors.push({
      id: `s-${i}`,
      label: `N-${String(i).padStart(2, '0')}`,
      use: 'Parqueo subterráneo',
      grossArea: REAL.M2_SOTANO,
      netArea:   0,
      spaces:    REAL.PLAZAS_SOTANO,
      isBelowGrade: true,
    })
  }

  return floors
}

// ── Derived totals from floors ────────────────────────────────
export function calcTotals(floors: Floor[], counts: LevelCounts) {
  const totalSpaces =
    counts.structuredParkingLevels * REAL.PLAZAS_RASANTE +
    counts.undergroundParkingLevels * REAL.PLAZAS_SOTANO

  const commercializable = Math.max(0, totalSpaces - REAL.RESTITUTION)
  const rentable = floors.reduce((s, f) => s + f.netArea, 0)
  const gross    = floors.reduce((s, f) => s + f.grossArea, 0)
  const ratio    = commercializable > 0 ? Math.round(rentable / commercializable) : 0

  return {
    totalSpaces,
    restitution:      REAL.RESTITUTION,
    commercializable,
    visitSpaces:      REAL.PLAZAS_VISITA,
    rentable,
    gross,
    ratio,
    efficiency: rentable > 0 && gross > 0 ? (rentable / gross) * 100 : 0,
  }
}
