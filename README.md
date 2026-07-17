# Training Log

PWA personal de entrenamiento adaptativo — Next.js + Supabase, un solo usuario fijo, sin login.
Implementa la Semana 1 (modificador de layoff activo) del split upper/lower 4x/semana descrito en
`v1_training_engine_spec.md`.

## Setup

1. **Supabase**: en el SQL editor de tu proyecto, corre en orden:
   - `supabase/migrations/0001_init.sql` (schema — Sección 17 del spec, casi directo, con algunos
     campos mínimos extra documentados inline: `slots.target_sets/rep_range_*/rir_target/starting_weight`
     son decisiones de programa, igual que `mesocycles.volume_compression_factor` en el spec original —
     nunca se recalculan).
   - `supabase/migrations/0002_seed.sql` (usuario fijo, Goal Profile, Challenge, Mesociclo Semana 1,
     las 4 plantillas de sesión y los 22 ejercicios/slots con tus pesos de trabajo).

   Si el proyecto ya tenía tablas con estos nombres de una corrida anterior, hay que dropearlas primero
   (`drop schema public cascade; create schema public;` en un proyecto nuevo sin otros datos) o avisarme
   qué schema quedó para reconciliar el código contra ese en vez de este.

2. **Variables de entorno**: copia `.env.local.example` a `.env.local` y llena `SUPABASE_URL` /
   `SUPABASE_ANON_KEY` (Project Settings → API). El proyecto tiene RLS activado con políticas
   permisivas por ahora (sin auth real, Sección 18) — la anon key solo se usa desde Server Actions,
   nunca llega al navegador.

3. **Instalar y correr**:
   ```
   npm install
   npm run dev
   ```

4. **Instalar como PWA**: abre la URL en el navegador del teléfono → "Agregar a pantalla de inicio"
   (Safari/iOS) o el prompt de instalación (Chrome/Android). `public/manifest.json` + `public/sw.js`
   habilitan esto; el service worker no cachea nada (conectividad asumida confiable, sin lógica
   offline-first todavía).

## Qué implementa

- **Vista de hoy** (`components/training/TodayScreen.tsx` + `SlotCard.tsx`): slots en el orden de
  demanda técnica ya sembrado (compuesto pesado primero), colapsados con checkmark al completarse,
  badges HEAVY COMPOUND / ACCESSORY.
- **Loguear un set**: peso/reps por stepper, RIR solo en la última serie de trabajo de cada ejercicio.
- **Fallo de reps a media sesión**: si una serie cae por debajo del mínimo del rango, aparece una
  tarjeta con acento de color sugiriendo ~5-10% menos de peso para las series restantes — nunca se
  aplica sin el tap en "Aceptar".
- **Ruteo de razón de parada** (`StopScreen.tsx`): sin tiempo / dolor / fatiga / otro. "Dolor" dispara
  el guardrail (Sección 8): marca el ejercicio en `pain_flags`, no se le vuelve a subir peso hasta
  que se confirme que ya no molesta (no se limpia solo).
- **Resumen de sesión** (`SummaryScreen.tsx`): Progresó / Se mantuvo / Marcado para revisar, usando
  reps-vs-rango + RIR juntos (`lib/engine.ts::classifySlotOutcome`), nunca solo RIR.
- **Cuerpo** (`BodyScreen.tsx`): peso diario con promedio móvil de 7 días calculado en cada lectura,
  cintura opcional cada ~4 semanas.

Todo lo computable (peso de trabajo actual, promedios, clasificación de progresión) se calcula en
`lib/engine.ts` y `app/actions.ts` a partir del historial de `sets` / `bodyweight_logs` en tiempo de
lectura — nada de eso se guarda como columna aparte (Sección 2 / apéndice de la Sección 17).

## Limitación conocida de este entorno

Esta sesión de Claude Code corre en un sandbox cuya política de red bloquea la salida directa a
`*.supabase.co`, así que no pude ejecutar el SQL ni probar lecturas/escrituras reales contra tu
proyecto desde aquí. Sí verifiqué: `tsc --noEmit` limpio, `next build` limpio, y cada pantalla
renderizada con datos de prueba (capturas locales, sin tocar tu base). Esa restricción es de este
sandbox — no debería aplicar quede donde despliegues la app de verdad (Vercel, etc.).
