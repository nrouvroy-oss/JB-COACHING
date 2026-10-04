'use client'

// Wizard cr\u00e9ation objectif trail \u2014 7 \u00e9tapes + r\u00e9sum\u00e9
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { createRaceGoal } from '../actions'

// ── Types locaux pour le state du wizard ──────────────────────────────────────

interface WizardData {
  // \u00c9tape 1 \u2014 Ma course
  race_name: string
  race_date: string
  distance_km: string
  elevation_gain_m: string
  elevation_loss_m: string
  terrain_type: string
  max_altitude_m: string
  // \u00c9tape 2 \u2014 Mon objectif
  goal_type: string
  target_time_hours: string
  target_time_minutes: string
  // \u00c9tape 3 \u2014 Mon niveau
  declared_level: string
  running_experience: string
  trail_experience: string
  // \u00c9tape 4 \u2014 Mon entra\u00eenement
  sessions_per_week: string
  weekly_distance_km: string
  weekly_duration_minutes: string
  weekly_elevation_gain_m: string
  longest_trail_km: string
  longest_trail_elevation_m: string
  longest_trail_date: string
  // \u00c9tape 5 \u2014 Ma sortie longue
  longest_run_minutes: string
  longest_run_km: string
  longest_run_elevation_m: string
  // \u00c9tape 6 \u2014 Mes disponibilit\u00e9s
  availability: Record<string, { available: boolean; max_minutes: string }>
  preferred_long_run_day: string
  // \u00c9tape 7 \u2014 Terrain & contraintes
  terrain_access: string[]
  has_strength_access: boolean
  strength_location: string
  constraints_notes: string
}

// Jours de la semaine
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const
const JOURS_LABELS: Record<string, string> = {
  lundi: 'Lun', mardi: 'Mar', mercredi: 'Mer',
  jeudi: 'Jeu', vendredi: 'Ven', samedi: 'Sam', dimanche: 'Dim',
}

// Valeurs initiales des disponibilit\u00e9s
function initialAvailability() {
  const avail: Record<string, { available: boolean; max_minutes: string }> = {}
  for (const j of JOURS) avail[j] = { available: false, max_minutes: '' }
  return avail
}

// Nombre total d\u2019\u00e9tapes (7 + r\u00e9sum\u00e9)
const TOTAL_STEPS = 8

// ── Titre d\u2019\u00e9tape avec typo Bricolage Grotesque ─────────────────────────────

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-2xl font-bold text-white mb-6"
      style={{ fontFamily: 'Bricolage Grotesque' }}
    >
      {children}
    </h2>
  )
}

// ── Bouton radio custom ───────────────────────────────────────────────────────

function RadioOption({
  label,
  description,
  selected,
  onClick,
}: {
  label: string
  description?: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 min-h-[44px] rounded-lg border transition-all ${
        selected
          ? 'border-[#d4ff00] bg-[#d4ff00]/10 text-white'
          : 'border-[#2a2a2a] bg-[#1c1c1c] text-[#ccc] hover:border-[#444]'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      {description && (
        <span className="block text-xs text-[#888] mt-0.5">{description}</span>
      )}
    </button>
  )
}

// ── Case \u00e0 cocher custom ──────────────────────────────────────────────────────

function CheckboxOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`px-4 py-3 min-h-[44px] rounded-lg border text-sm font-medium transition-all ${
        checked
          ? 'border-[#d4ff00] bg-[#d4ff00]/10 text-white'
          : 'border-[#2a2a2a] bg-[#1c1c1c] text-[#ccc] hover:border-[#444]'
      }`}
    >
      {label}
    </button>
  )
}

// ── Toggle (interrupteur) ────────────────────────────────────────────────────

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-3 min-h-[44px]"
    >
      <span className="text-sm text-[#ccc]">{label}</span>
      <div
        className={`w-11 h-6 rounded-full transition-colors relative ${
          checked ? 'bg-[#d4ff00]' : 'bg-[#333]'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export function WizardForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)

  // State global du formulaire
  const [data, setData] = useState<WizardData>({
    race_name: '',
    race_date: '',
    distance_km: '',
    elevation_gain_m: '',
    elevation_loss_m: '',
    terrain_type: '',
    max_altitude_m: '',
    goal_type: 'finish',
    target_time_hours: '',
    target_time_minutes: '',
    declared_level: '',
    running_experience: '',
    trail_experience: '',
    sessions_per_week: '',
    weekly_distance_km: '',
    weekly_duration_minutes: '',
    weekly_elevation_gain_m: '',
    longest_trail_km: '',
    longest_trail_elevation_m: '',
    longest_trail_date: '',
    longest_run_minutes: '',
    longest_run_km: '',
    longest_run_elevation_m: '',
    availability: initialAvailability(),
    preferred_long_run_day: 'samedi',
    terrain_access: [],
    has_strength_access: false,
    strength_location: '',
    constraints_notes: '',
  })

  // Raccourci pour mettre \u00e0 jour un champ
  function set<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  // Mettre \u00e0 jour une disponibilit\u00e9
  function setAvail(day: string, field: 'available' | 'max_minutes', value: boolean | string) {
    setData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: { ...prev.availability[day], [field]: value },
      },
    }))
  }

  // Basculer un \u00e9l\u00e9ment terrain_access
  function toggleTerrain(val: string) {
    setData((prev) => ({
      ...prev,
      terrain_access: prev.terrain_access.includes(val)
        ? prev.terrain_access.filter((t) => t !== val)
        : [...prev.terrain_access, val],
    }))
  }

  // Navigation
  function next() {
    if (step < TOTAL_STEPS) setStep(step + 1)
  }
  function prev() {
    if (step > 1) setStep(step - 1)
  }

  // Validation simple par \u00e9tape (champs obligatoires)
  function canContinue(): boolean {
    switch (step) {
      case 1:
        return !!(data.race_name && data.race_date && data.distance_km && data.elevation_gain_m)
      case 2:
        return !!data.goal_type
      case 3:
        return !!(data.declared_level && data.running_experience && data.trail_experience)
      case 4:
        return !!(data.sessions_per_week && data.weekly_distance_km && data.weekly_duration_minutes && data.weekly_elevation_gain_m)
      case 5:
        return !!(data.longest_run_minutes && data.longest_run_km && data.longest_run_elevation_m)
      case 6:
        return Object.values(data.availability).some((d) => d.available)
      case 7:
        return true // Pas de champ obligatoire
      default:
        return true
    }
  }

  // Soumission finale
  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const fd = new FormData()

      // \u00c9tape 1
      fd.set('race_name', data.race_name)
      fd.set('race_date', data.race_date)
      fd.set('distance_km', data.distance_km)
      fd.set('elevation_gain_m', data.elevation_gain_m)
      if (data.elevation_loss_m) fd.set('elevation_loss_m', data.elevation_loss_m)
      if (data.terrain_type) fd.set('terrain_type', data.terrain_type)
      if (data.max_altitude_m) fd.set('max_altitude_m', data.max_altitude_m)

      // \u00c9tape 2
      fd.set('goal_type', data.goal_type)
      if (data.goal_type === 'target_time' && (data.target_time_hours || data.target_time_minutes)) {
        const totalMin = (parseInt(data.target_time_hours || '0') * 60) + parseInt(data.target_time_minutes || '0')
        if (totalMin > 0) fd.set('target_time_minutes', String(totalMin))
      }

      // \u00c9tape 3
      fd.set('declared_level', data.declared_level)
      fd.set('running_experience', data.running_experience)
      fd.set('trail_experience', data.trail_experience)

      // \u00c9tape 4
      fd.set('sessions_per_week', data.sessions_per_week)
      fd.set('weekly_distance_km', data.weekly_distance_km)
      fd.set('weekly_duration_minutes', data.weekly_duration_minutes)
      fd.set('weekly_elevation_gain_m', data.weekly_elevation_gain_m)
      if (data.longest_trail_km) fd.set('longest_trail_km', data.longest_trail_km)
      if (data.longest_trail_elevation_m) fd.set('longest_trail_elevation_m', data.longest_trail_elevation_m)
      if (data.longest_trail_date) fd.set('longest_trail_date', data.longest_trail_date)

      // \u00c9tape 5
      fd.set('longest_run_minutes', data.longest_run_minutes)
      fd.set('longest_run_km', data.longest_run_km)
      fd.set('longest_run_elevation_m', data.longest_run_elevation_m)

      // \u00c9tape 6 \u2014 Disponibilit\u00e9s
      for (const day of JOURS) {
        fd.set(`avail_${day}`, String(data.availability[day].available))
        if (data.availability[day].max_minutes) {
          fd.set(`minutes_${day}`, data.availability[day].max_minutes)
        }
      }
      fd.set('preferred_long_run_day', data.preferred_long_run_day)

      // \u00c9tape 7
      for (const t of data.terrain_access) {
        fd.append('terrain_access', t)
      }
      fd.set('has_strength_access', String(data.has_strength_access))
      if (data.strength_location) fd.set('strength_location', data.strength_location)
      if (data.constraints_notes) fd.set('constraints_notes', data.constraints_notes)

      const result = await createRaceGoal(fd)
      if (result.error) {
        setError(result.error)
      } else if (result.id) {
        router.push(`/client/goal/${result.id}`)
      }
    })
  }

  // Calculer le nombre de semaines avant la course
  function weeksUntilRace(): number | null {
    if (!data.race_date) return null
    const today = new Date()
    const race = new Date(data.race_date)
    const diff = race.getTime() - today.getTime()
    return Math.max(0, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)))
  }

  // Formater le temps cible en heures:minutes
  function formatTargetTime(): string {
    const h = parseInt(data.target_time_hours || '0')
    const m = parseInt(data.target_time_minutes || '0')
    if (h === 0 && m === 0) return '-'
    return `${h}h${m.toString().padStart(2, '0')}`
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDU DES \u00c9TAPES
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Barre de progression */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#888]">
            \u00c9tape {Math.min(step, 7)} / 7
          </span>
          {step <= 7 && (
            <span className="text-xs text-[#888]">
              {Math.round((step / TOTAL_STEPS) * 100)}%
            </span>
          )}
        </div>
        <ProgressBar percent={(step / TOTAL_STEPS) * 100} />
      </div>

      {/* Contenu de l\u2019\u00e9tape */}
      <div className="flex-1 py-6">
        {step === 1 && <StepRace data={data} set={set} />}
        {step === 2 && <StepGoal data={data} set={set} />}
        {step === 3 && <StepLevel data={data} set={set} />}
        {step === 4 && <StepTraining data={data} set={set} />}
        {step === 5 && <StepLongRun data={data} set={set} />}
        {step === 6 && (
          <StepAvailability
            data={data}
            set={set}
            setAvail={setAvail}
          />
        )}
        {step === 7 && (
          <StepConstraints
            data={data}
            set={set}
            toggleTerrain={toggleTerrain}
          />
        )}
        {step === 8 && (
          <StepSummary
            data={data}
            weeksUntilRace={weeksUntilRace()}
            formatTargetTime={formatTargetTime}
          />
        )}
      </div>

      {/* Erreur */}
      {error && (
        <p className="text-red-400 text-sm text-center mb-4">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pb-4">
        {step > 1 && (
          <Button
            variant="secondary"
            onClick={prev}
            className="flex-1 min-h-[48px] rounded-xl"
          >
            Pr\u00e9c\u00e9dent
          </Button>
        )}
        {step < TOTAL_STEPS ? (
          <Button
            onClick={next}
            disabled={!canContinue()}
            className="flex-1 min-h-[48px] rounded-xl"
          >
            Suivant
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 min-h-[48px] rounded-xl"
          >
            {isPending ? 'Cr\u00e9ation en cours...' : 'Cr\u00e9er ma pr\u00e9paration'}
          </Button>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// \u00c9TAPE 1 \u2014 MA COURSE
// ══════════════════════════════════════════════════════════════════════════════

function StepRace({
  data,
  set,
}: {
  data: WizardData
  set: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
}) {
  const terrainOptions = [
    { value: 'roulant', label: 'Roulant' },
    { value: 'vallonne', label: 'Vallonn\u00e9' },
    { value: 'montagne', label: 'Montagne' },
    { value: 'technique', label: 'Technique' },
    { value: 'tres_technique', label: 'Tr\u00e8s technique' },
  ]

  return (
    <div className="space-y-4">
      <StepTitle>Ma course</StepTitle>

      <Input
        label="Nom de la course"
        id="race_name"
        placeholder="Ex : UTMB, Trail du Mont-Blanc..."
        value={data.race_name}
        onChange={(e) => set('race_name', e.target.value)}
      />

      <Input
        label="Date de la course"
        id="race_date"
        type="date"
        value={data.race_date}
        onChange={(e) => set('race_date', e.target.value)}
      />

      <Input
        label="Distance (km)"
        id="distance_km"
        type="number"
        placeholder="42"
        min="1"
        value={data.distance_km}
        onChange={(e) => set('distance_km', e.target.value)}
      />

      <Input
        label="D\u00e9nivel\u00e9 positif (m)"
        id="elevation_gain_m"
        type="number"
        placeholder="2500"
        min="0"
        value={data.elevation_gain_m}
        onChange={(e) => set('elevation_gain_m', e.target.value)}
      />

      <Input
        label="D\u00e9nivel\u00e9 n\u00e9gatif (m) \u2014 optionnel"
        id="elevation_loss_m"
        type="number"
        placeholder="2500"
        min="0"
        value={data.elevation_loss_m}
        onChange={(e) => set('elevation_loss_m', e.target.value)}
      />

      {/* Select terrain */}
      <div>
        <label htmlFor="terrain_type" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
          Type de terrain
        </label>
        <select
          id="terrain_type"
          value={data.terrain_type}
          onChange={(e) => set('terrain_type', e.target.value)}
          className="w-full px-3 py-3 min-h-[44px] bg-[#222] border border-[#333] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00] text-white text-sm transition-colors"
        >
          <option value="">S\u00e9lectionner</option>
          {terrainOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <Input
        label="Altitude max (m) \u2014 optionnel"
        id="max_altitude_m"
        type="number"
        placeholder="3000"
        min="0"
        value={data.max_altitude_m}
        onChange={(e) => set('max_altitude_m', e.target.value)}
      />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// \u00c9TAPE 2 \u2014 MON OBJECTIF
// ══════════════════════════════════════════════════════════════════════════════

function StepGoal({
  data,
  set,
}: {
  data: WizardData
  set: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
}) {
  const goals = [
    { value: 'finish', label: 'Finir', description: 'Mon premier objectif est de franchir la ligne' },
    { value: 'comfortable', label: 'Confort', description: 'Finir en \u00e9tant bien, sans souffrir' },
    { value: 'target_time', label: 'Chrono', description: 'Viser un temps pr\u00e9cis' },
    { value: 'performance', label: 'Performance', description: 'Donner le maximum, classement' },
  ]

  return (
    <div className="space-y-4">
      <StepTitle>Mon objectif</StepTitle>
      <p className="text-sm text-[#888] -mt-2 mb-4">
        Qu\u2019est-ce que tu vises pour cette course ?
      </p>

      <div className="space-y-3">
        {goals.map((g) => (
          <RadioOption
            key={g.value}
            label={g.label}
            description={g.description}
            selected={data.goal_type === g.value}
            onClick={() => set('goal_type', g.value)}
          />
        ))}
      </div>

      {/* Temps cible affich\u00e9 uniquement si objectif chrono */}
      {data.goal_type === 'target_time' && (
        <div className="mt-6 p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg space-y-3">
          <p className="text-sm text-[#ccc] font-medium">Temps vis\u00e9</p>
          <div className="flex gap-3">
            <Input
              label="Heures"
              id="target_hours"
              type="number"
              placeholder="5"
              min="0"
              value={data.target_time_hours}
              onChange={(e) => set('target_time_hours', e.target.value)}
            />
            <Input
              label="Minutes"
              id="target_minutes"
              type="number"
              placeholder="30"
              min="0"
              max="59"
              value={data.target_time_minutes}
              onChange={(e) => set('target_time_minutes', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// \u00c9TAPE 3 \u2014 MON NIVEAU
// ══════════════════════════════════════════════════════════════════════════════

function StepLevel({
  data,
  set,
}: {
  data: WizardData
  set: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
}) {
  const levels = [
    { value: 'debutant', label: 'D\u00e9butant', description: 'Je d\u00e9bute la course \u00e0 pied' },
    { value: 'intermediaire', label: 'Interm\u00e9diaire', description: 'Je cours r\u00e9guli\u00e8rement' },
    { value: 'confirme', label: 'Confirm\u00e9', description: 'J\u2019ai de l\u2019exp\u00e9rience en comp\u00e9tition' },
    { value: 'avance', label: 'Avanc\u00e9', description: 'Je m\u2019entra\u00eene intensivement' },
  ]

  const runExp = [
    { value: '<1an', label: 'Moins d\u20191 an' },
    { value: '1-2ans', label: '1 \u00e0 2 ans' },
    { value: '2-5ans', label: '2 \u00e0 5 ans' },
    { value: '5+ans', label: 'Plus de 5 ans' },
  ]

  const trailExp = [
    { value: 'jamais', label: 'Jamais fait de trail' },
    { value: 'quelques_courts', label: 'Quelques courts trails' },
    { value: 'regulierement', label: 'Je fais des trails r\u00e9guli\u00e8rement' },
    { value: 'experimente', label: 'Exp\u00e9riment\u00e9 en trail' },
  ]

  return (
    <div className="space-y-6">
      <StepTitle>Mon niveau</StepTitle>

      {/* Niveau d\u00e9clar\u00e9 */}
      <div>
        <p className="text-sm text-[#888] mb-3 uppercase tracking-wide font-medium">Niveau g\u00e9n\u00e9ral</p>
        <div className="space-y-2">
          {levels.map((l) => (
            <RadioOption
              key={l.value}
              label={l.label}
              description={l.description}
              selected={data.declared_level === l.value}
              onClick={() => set('declared_level', l.value)}
            />
          ))}
        </div>
      </div>

      {/* Exp\u00e9rience course */}
      <div>
        <p className="text-sm text-[#888] mb-3 uppercase tracking-wide font-medium">Exp\u00e9rience en course \u00e0 pied</p>
        <div className="space-y-2">
          {runExp.map((r) => (
            <RadioOption
              key={r.value}
              label={r.label}
              selected={data.running_experience === r.value}
              onClick={() => set('running_experience', r.value)}
            />
          ))}
        </div>
      </div>

      {/* Exp\u00e9rience trail */}
      <div>
        <p className="text-sm text-[#888] mb-3 uppercase tracking-wide font-medium">Exp\u00e9rience en trail</p>
        <div className="space-y-2">
          {trailExp.map((t) => (
            <RadioOption
              key={t.value}
              label={t.label}
              selected={data.trail_experience === t.value}
              onClick={() => set('trail_experience', t.value)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// \u00c9TAPE 4 \u2014 MON ENTRA\u00ceNEMENT
// ══════════════════════════════════════════════════════════════════════════════

function StepTraining({
  data,
  set,
}: {
  data: WizardData
  set: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
}) {
  return (
    <div className="space-y-4">
      <StepTitle>Mon entra\u00eenement</StepTitle>
      <p className="text-sm text-[#888] -mt-2 mb-4">
        D\u00e9cris ton volume d\u2019entra\u00eenement actuel typique.
      </p>

      <Input
        label="S\u00e9ances par semaine"
        id="sessions_per_week"
        type="number"
        placeholder="4"
        min="1"
        max="14"
        value={data.sessions_per_week}
        onChange={(e) => set('sessions_per_week', e.target.value)}
      />

      <Input
        label="Distance hebdo (km)"
        id="weekly_distance_km"
        type="number"
        placeholder="40"
        min="0"
        value={data.weekly_distance_km}
        onChange={(e) => set('weekly_distance_km', e.target.value)}
      />

      <Input
        label="Dur\u00e9e hebdo (minutes)"
        id="weekly_duration_minutes"
        type="number"
        placeholder="300"
        min="0"
        value={data.weekly_duration_minutes}
        onChange={(e) => set('weekly_duration_minutes', e.target.value)}
      />

      <Input
        label="D+ hebdo (m)"
        id="weekly_elevation_gain_m"
        type="number"
        placeholder="1000"
        min="0"
        value={data.weekly_elevation_gain_m}
        onChange={(e) => set('weekly_elevation_gain_m', e.target.value)}
      />

      {/* Plus long trail r\u00e9alis\u00e9 \u2014 optionnel */}
      <div className="mt-6 pt-4 border-t border-[#2a2a2a]">
        <p className="text-sm text-[#888] mb-3 uppercase tracking-wide font-medium">
          Plus long trail r\u00e9alis\u00e9 (optionnel)
        </p>

        <div className="space-y-4">
          <Input
            label="Distance (km)"
            id="longest_trail_km"
            type="number"
            placeholder="30"
            min="0"
            value={data.longest_trail_km}
            onChange={(e) => set('longest_trail_km', e.target.value)}
          />

          <Input
            label="D\u00e9nivel\u00e9 positif (m)"
            id="longest_trail_elevation_m"
            type="number"
            placeholder="1500"
            min="0"
            value={data.longest_trail_elevation_m}
            onChange={(e) => set('longest_trail_elevation_m', e.target.value)}
          />

          <Input
            label="Date"
            id="longest_trail_date"
            type="date"
            value={data.longest_trail_date}
            onChange={(e) => set('longest_trail_date', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// \u00c9TAPE 5 \u2014 MA SORTIE LONGUE
// ══════════════════════════════════════════════════════════════════════════════

function StepLongRun({
  data,
  set,
}: {
  data: WizardData
  set: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
}) {
  return (
    <div className="space-y-4">
      <StepTitle>Ma sortie longue</StepTitle>
      <p className="text-sm text-[#888] -mt-2 mb-4">
        Ta sortie longue typique actuelle (ta plus longue sortie r\u00e9cente).
      </p>

      <Input
        label="Dur\u00e9e (minutes)"
        id="longest_run_minutes"
        type="number"
        placeholder="120"
        min="0"
        value={data.longest_run_minutes}
        onChange={(e) => set('longest_run_minutes', e.target.value)}
      />

      <Input
        label="Distance (km)"
        id="longest_run_km"
        type="number"
        placeholder="18"
        min="0"
        value={data.longest_run_km}
        onChange={(e) => set('longest_run_km', e.target.value)}
      />

      <Input
        label="D\u00e9nivel\u00e9 positif (m)"
        id="longest_run_elevation_m"
        type="number"
        placeholder="600"
        min="0"
        value={data.longest_run_elevation_m}
        onChange={(e) => set('longest_run_elevation_m', e.target.value)}
      />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// \u00c9TAPE 6 \u2014 MES DISPONIBILIT\u00c9S
// ══════════════════════════════════════════════════════════════════════════════

function StepAvailability({
  data,
  set,
  setAvail,
}: {
  data: WizardData
  set: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
  setAvail: (day: string, field: 'available' | 'max_minutes', value: boolean | string) => void
}) {
  return (
    <div className="space-y-4">
      <StepTitle>Mes disponibilit\u00e9s</StepTitle>
      <p className="text-sm text-[#888] -mt-2 mb-4">
        Quels jours peux-tu t\u2019entra\u00eener ? Et combien de temps max ?
      </p>

      {/* Grille des 7 jours */}
      <div className="space-y-2">
        {JOURS.map((jour) => (
          <div
            key={jour}
            className={`p-3 rounded-lg border transition-all ${
              data.availability[jour].available
                ? 'border-[#d4ff00]/30 bg-[#d4ff00]/5'
                : 'border-[#2a2a2a] bg-[#1c1c1c]'
            }`}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAvail(jour, 'available', !data.availability[jour].available)}
                className="flex items-center gap-3 min-h-[44px] flex-1"
              >
                {/* Indicateur on/off */}
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    data.availability[jour].available
                      ? 'border-[#d4ff00] bg-[#d4ff00]'
                      : 'border-[#444] bg-transparent'
                  }`}
                >
                  {data.availability[jour].available && (
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm font-medium capitalize ${
                  data.availability[jour].available ? 'text-white' : 'text-[#888]'
                }`}>
                  {jour}
                </span>
              </button>

              {/* Input dur\u00e9e max si disponible */}
              {data.availability[jour].available && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="min"
                    min="15"
                    step="15"
                    value={data.availability[jour].max_minutes}
                    onChange={(e) => setAvail(jour, 'max_minutes', e.target.value)}
                    className="w-20 px-2 py-1.5 bg-[#222] border border-[#333] rounded-lg text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00]"
                  />
                  <span className="text-xs text-[#888]">min</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Jour pr\u00e9f\u00e9r\u00e9 sortie longue */}
      <div className="mt-6">
        <label htmlFor="preferred_long_run_day" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
          Jour pr\u00e9f\u00e9r\u00e9 pour la sortie longue
        </label>
        <select
          id="preferred_long_run_day"
          value={data.preferred_long_run_day}
          onChange={(e) => set('preferred_long_run_day', e.target.value)}
          className="w-full px-3 py-3 min-h-[44px] bg-[#222] border border-[#333] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00] text-white text-sm transition-colors capitalize"
        >
          {JOURS.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// \u00c9TAPE 7 \u2014 TERRAIN & CONTRAINTES
// ══════════════════════════════════════════════════════════════════════════════

function StepConstraints({
  data,
  set,
  toggleTerrain,
}: {
  data: WizardData
  set: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
  toggleTerrain: (val: string) => void
}) {
  const terrainOptions = [
    { value: 'plat', label: 'Plat' },
    { value: 'petites_cotes', label: 'Petites c\u00f4tes' },
    { value: 'vallonne', label: 'Vallonn\u00e9' },
    { value: 'montagne', label: 'Montagne' },
    { value: 'escaliers', label: 'Escaliers' },
    { value: 'tapis_incline', label: 'Tapis inclinable' },
  ]

  return (
    <div className="space-y-6">
      <StepTitle>Terrain & contraintes</StepTitle>

      {/* Acc\u00e8s terrain */}
      <div>
        <p className="text-sm text-[#888] mb-3 uppercase tracking-wide font-medium">
          \u00c0 quels terrains as-tu acc\u00e8s pour t\u2019entra\u00eener ?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {terrainOptions.map((t) => (
            <CheckboxOption
              key={t.value}
              label={t.label}
              checked={data.terrain_access.includes(t.value)}
              onChange={() => toggleTerrain(t.value)}
            />
          ))}
        </div>
      </div>

      {/* Acc\u00e8s renforcement */}
      <div className="border-t border-[#2a2a2a] pt-4">
        <Toggle
          label="Acc\u00e8s \u00e0 du mat\u00e9riel de renforcement ?"
          checked={data.has_strength_access}
          onChange={(v) => set('has_strength_access', v)}
        />

        {data.has_strength_access && (
          <div className="mt-3 space-y-2">
            <RadioOption
              label="Maison"
              selected={data.strength_location === 'maison'}
              onClick={() => set('strength_location', 'maison')}
            />
            <RadioOption
              label="Salle de sport"
              selected={data.strength_location === 'salle'}
              onClick={() => set('strength_location', 'salle')}
            />
            <RadioOption
              label="Les deux"
              selected={data.strength_location === 'les_deux'}
              onClick={() => set('strength_location', 'les_deux')}
            />
          </div>
        )}
      </div>

      {/* Contraintes / notes */}
      <div>
        <label htmlFor="constraints_notes" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
          Contraintes ou informations suppl\u00e9mentaires
        </label>
        <textarea
          id="constraints_notes"
          rows={4}
          placeholder="Blessures, pathologies, mat\u00e9riel disponible, pr\u00e9f\u00e9rences..."
          value={data.constraints_notes}
          onChange={(e) => set('constraints_notes', e.target.value)}
          className="w-full px-3 py-3 min-h-[44px] bg-[#222] border border-[#333] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00] text-white placeholder:text-[#777] text-sm transition-colors resize-none"
        />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// R\u00c9SUM\u00c9
// ══════════════════════════════════════════════════════════════════════════════

function StepSummary({
  data,
  weeksUntilRace,
  formatTargetTime,
}: {
  data: WizardData
  weeksUntilRace: number | null
  formatTargetTime: () => string
}) {
  // Labels lisibles
  const terrainLabels: Record<string, string> = {
    roulant: 'Roulant', vallonne: 'Vallonn\u00e9', montagne: 'Montagne',
    technique: 'Technique', tres_technique: 'Tr\u00e8s technique',
  }
  const goalLabels: Record<string, string> = {
    finish: 'Finir', comfortable: 'Confort', target_time: 'Chrono', performance: 'Performance',
  }
  const levelLabels: Record<string, string> = {
    debutant: 'D\u00e9butant', intermediaire: 'Interm\u00e9diaire', confirme: 'Confirm\u00e9', avance: 'Avanc\u00e9',
  }
  const runExpLabels: Record<string, string> = {
    '<1an': 'Moins d\u20191 an', '1-2ans': '1-2 ans', '2-5ans': '2-5 ans', '5+ans': '5+ ans',
  }
  const trailExpLabels: Record<string, string> = {
    jamais: 'Jamais', quelques_courts: 'Quelques courts', regulierement: 'R\u00e9guli\u00e8rement', experimente: 'Exp\u00e9riment\u00e9',
  }
  const terrainAccessLabels: Record<string, string> = {
    plat: 'Plat', petites_cotes: 'Petites c\u00f4tes', vallonne: 'Vallonn\u00e9',
    montagne: 'Montagne', escaliers: 'Escaliers', tapis_incline: 'Tapis inclinable',
  }
  const strengthLabels: Record<string, string> = {
    maison: 'Maison', salle: 'Salle', les_deux: 'Maison + Salle',
  }

  // Jours dispo
  const joursDispos = JOURS.filter((j) => data.availability[j].available)

  return (
    <div className="space-y-5">
      <StepTitle>R\u00e9sum\u00e9</StepTitle>

      {/* Semaines restantes */}
      {weeksUntilRace !== null && (
        <div className="p-4 bg-[#d4ff00]/10 border border-[#d4ff00]/30 rounded-xl text-center">
          <p className="text-3xl font-bold text-[#d4ff00]" style={{ fontFamily: 'Bricolage Grotesque' }}>
            {weeksUntilRace}
          </p>
          <p className="text-sm text-[#ccc]">semaines avant la course</p>
        </div>
      )}

      {/* Section course */}
      <SummarySection title="Ma course">
        <SummaryRow label="Course" value={data.race_name} />
        <SummaryRow label="Date" value={data.race_date ? new Date(data.race_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
        <SummaryRow label="Distance" value={`${data.distance_km} km`} />
        <SummaryRow label="D+" value={`${data.elevation_gain_m} m`} />
        {data.elevation_loss_m && <SummaryRow label="D-" value={`${data.elevation_loss_m} m`} />}
        {data.terrain_type && <SummaryRow label="Terrain" value={terrainLabels[data.terrain_type] || data.terrain_type} />}
        {data.max_altitude_m && <SummaryRow label="Alt. max" value={`${data.max_altitude_m} m`} />}
      </SummarySection>

      {/* Section objectif */}
      <SummarySection title="Mon objectif">
        <SummaryRow label="Objectif" value={goalLabels[data.goal_type] || data.goal_type} />
        {data.goal_type === 'target_time' && (
          <SummaryRow label="Temps vis\u00e9" value={formatTargetTime()} />
        )}
      </SummarySection>

      {/* Section niveau */}
      <SummarySection title="Mon niveau">
        <SummaryRow label="Niveau" value={levelLabels[data.declared_level] || '-'} />
        <SummaryRow label="Course \u00e0 pied" value={runExpLabels[data.running_experience] || '-'} />
        <SummaryRow label="Trail" value={trailExpLabels[data.trail_experience] || '-'} />
      </SummarySection>

      {/* Section entra\u00eenement */}
      <SummarySection title="Mon entra\u00eenement">
        <SummaryRow label="S\u00e9ances/sem" value={`${data.sessions_per_week}`} />
        <SummaryRow label="Distance/sem" value={`${data.weekly_distance_km} km`} />
        <SummaryRow label="Dur\u00e9e/sem" value={`${data.weekly_duration_minutes} min`} />
        <SummaryRow label="D+/sem" value={`${data.weekly_elevation_gain_m} m`} />
        {data.longest_trail_km && (
          <SummaryRow label="Plus long trail" value={`${data.longest_trail_km} km / ${data.longest_trail_elevation_m || 0} m D+`} />
        )}
      </SummarySection>

      {/* Section sortie longue */}
      <SummarySection title="Ma sortie longue">
        <SummaryRow label="Dur\u00e9e" value={`${data.longest_run_minutes} min`} />
        <SummaryRow label="Distance" value={`${data.longest_run_km} km`} />
        <SummaryRow label="D+" value={`${data.longest_run_elevation_m} m`} />
      </SummarySection>

      {/* Section disponibilit\u00e9s */}
      <SummarySection title="Mes disponibilit\u00e9s">
        <SummaryRow
          label="Jours"
          value={joursDispos.length > 0 ? joursDispos.map((j) => JOURS_LABELS[j]).join(', ') : 'Aucun'}
        />
        {joursDispos.map((j) =>
          data.availability[j].max_minutes ? (
            <SummaryRow
              key={j}
              label={`${JOURS_LABELS[j]} max`}
              value={`${data.availability[j].max_minutes} min`}
            />
          ) : null
        )}
        <SummaryRow label="Sortie longue" value={data.preferred_long_run_day} />
      </SummarySection>

      {/* Section terrain & contraintes */}
      <SummarySection title="Terrain & contraintes">
        {data.terrain_access.length > 0 && (
          <SummaryRow
            label="Terrain"
            value={data.terrain_access.map((t) => terrainAccessLabels[t] || t).join(', ')}
          />
        )}
        <SummaryRow
          label="Renforcement"
          value={data.has_strength_access ? (strengthLabels[data.strength_location] || 'Oui') : 'Non'}
        />
        {data.constraints_notes && (
          <div className="mt-2">
            <p className="text-xs text-[#888] uppercase tracking-wide">Notes</p>
            <p className="text-sm text-[#ccc] mt-1">{data.constraints_notes}</p>
          </div>
        )}
      </SummarySection>
    </div>
  )
}

// ── Composants utilitaires pour le r\u00e9sum\u00e9 ─────────────────────────────────────

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl">
      <h3
        className="text-sm font-bold text-[#d4ff00] mb-3 uppercase tracking-wide"
        style={{ fontFamily: 'Bricolage Grotesque' }}
      >
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#888]">{label}</span>
      <span className="text-white font-medium capitalize">{value}</span>
    </div>
  )
}
