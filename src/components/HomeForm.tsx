import { t, type Lang } from '@/lib/translations';
import type { FormData } from '@/pages/Index';

interface HomeFormProps {
  lang: Lang;
  formData: FormData;
  setFormData: (d: FormData) => void;
  onNext: () => void;
}

const ageOptions = ['5','6','7','8','9','10','11','12','13','14','15','16','17','18-34','35+'];
const towerOptions = ['T1', 'T2', 'T5', 'T6', 'T7', 'T8', 'Plot'];

export default function HomeForm({ lang, formData, setFormData, onNext }: HomeFormProps) {
  const update = (key: keyof FormData, val: string) => setFormData({ ...formData, [key]: val });

  return (
    <div className="space-y-6 py-4">
      <header className="text-center space-y-2">
        <span className="text-5xl block">🏆</span>
        <h2 className="text-2xl md:text-3xl font-black text-primary leading-tight text-balance">
          {t('heroTitle', lang)}
        </h2>
        <p className="text-muted-foreground text-sm">{t('heroSub', lang)}</p>
      </header>

      <div className="bg-card p-5 md:p-6 rounded-3xl shadow-lg border border-border space-y-4">
        {/* Name */}
        <FieldInput label={t('fullName', lang)} value={formData.name} onChange={v => update('name', v)} placeholder={lang === 'EN' ? 'e.g. Rahul Sharma' : 'जैसे राहुल शर्मा'} />

        {/* Phone */}
        <FieldInput label={t('contactNumber', lang)} value={formData.phone} onChange={v => update('phone', v.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit" type="tel" inputMode="numeric" />

        {/* Tower & Flat */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground ml-1">{t('tower', lang)}</label>
            <select
              value={formData.tower}
              onChange={e => update('tower', e.target.value)}
              className="w-full bg-background border-2 border-border rounded-xl px-3 py-3 text-sm font-medium focus:border-primary outline-none transition-colors appearance-none"
            >
              <option value="">{t('selectTower', lang)}</option>
              {towerOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <FieldInput label={t('flatNo', lang)} value={formData.flat} onChange={v => update('flat', v)} placeholder="101" />
        </div>

        {/* Age */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground ml-1">{t('age', lang)}</label>
          <select
            value={formData.age}
            onChange={e => update('age', e.target.value)}
            className="w-full bg-background border-2 border-border rounded-xl px-3 py-3 text-sm font-medium focus:border-primary outline-none transition-colors appearance-none"
          >
            <option value="">{t('selectAge', lang)}</option>
            {ageOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground ml-1">{t('gender', lang)}</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Male', 'Female', 'Other'] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => update('gender', g)}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  formData.gender === g
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background'
                }`}
              >
                {t(g.toLowerCase(), lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Marital Status - only for females aged 18+ */}
        {formData.gender === 'Female' && (formData.age === '18-34' || formData.age === '35+') && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="text-xs font-bold text-muted-foreground ml-1">{t('maritalStatus', lang)}</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Unmarried', 'Married'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => update('maritalStatus', m)}
                  className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                    formData.maritalStatus === m
                      ? 'border-secondary bg-secondary text-secondary-foreground'
                      : 'border-border bg-background'
                  }`}
                >
                  {t(m.toLowerCase(), lang)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-extrabold text-lg shadow-primary active:scale-[0.98] transition-transform"
      >
        {t('next', lang)}
      </button>
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder, type = 'text', inputMode }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; inputMode?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-muted-foreground ml-1">{label}</label>
      <input
        type={type}
        inputMode={inputMode as any}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-background border-2 border-border rounded-xl px-3 py-3 text-sm font-medium focus:border-primary outline-none transition-colors"
      />
    </div>
  );
}
