import { useState } from 'react';
import { t, type Lang } from '@/lib/translations';
import { toast } from 'sonner';

interface AdminLoginProps {
  lang: Lang;
  onSuccess: () => void;
}

const ADMIN_EMAIL = 'thdsports0@gmail.com';
const ADMIN_PASSWORD = 'RoyalCourt01';

export default function AdminLogin({ lang, onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      onSuccess();
    } else {
      toast.error(t('invalidCreds', lang));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-card p-6 md:p-8 rounded-3xl shadow-lg border border-border w-full max-w-sm space-y-5">
        <div className="text-center">
          <span className="text-4xl block mb-2">🔐</span>
          <h2 className="text-xl font-black">{t('adminLogin', lang)}</h2>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground ml-1">{t('email', lang)}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-background border-2 border-border rounded-xl px-3 py-3 text-sm font-medium focus:border-primary outline-none transition-colors"
              placeholder="admin@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground ml-1">{t('password', lang)}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full bg-background border-2 border-border rounded-xl px-3 py-3 text-sm font-medium focus:border-primary outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold active:scale-[0.98] transition-transform"
        >
          {t('login', lang)}
        </button>
      </div>
    </div>
  );
}
