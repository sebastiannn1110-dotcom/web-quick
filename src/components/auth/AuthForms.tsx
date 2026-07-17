import Link from "next/link";
import {
  forgotPasswordAction,
  loginAction,
  registerAction,
  resetPasswordAction,
} from "@/lib/auth/actions";
import type { Locale } from "@/lib/constants";
import { localizedPath } from "@/lib/dictionary";

const labels = {
  en: {
    email: "Email",
    password: "Password",
    fullName: "Full name",
    company: "Company",
    country: "Country",
    terms: "I accept the terms",
    login: "Sign in",
    register: "Create account",
    forgot: "Forgot password?",
    reset: "Update password",
    send: "Send reset email",
  },
  es: {
    email: "Correo",
    password: "Contraseña",
    fullName: "Nombre completo",
    company: "Empresa",
    country: "País",
    terms: "Acepto los términos",
    login: "Iniciar sesión",
    register: "Crear cuenta",
    forgot: "¿Olvidaste tu contraseña?",
    reset: "Actualizar contraseña",
    send: "Enviar correo de recuperación",
  },
  zh: {
    email: "邮箱",
    password: "密码",
    fullName: "姓名",
    company: "公司",
    country: "国家",
    terms: "我接受条款",
    login: "登录",
    register: "创建账户",
    forgot: "忘记密码？",
    reset: "更新密码",
    send: "发送重置邮件",
  },
  fr: {
    email: "E-mail",
    password: "Mot de passe",
    fullName: "Nom complet",
    company: "Entreprise",
    country: "Pays",
    terms: "J'accepte les conditions",
    login: "Se connecter",
    register: "Créer un compte",
    forgot: "Mot de passe oublié ?",
    reset: "Mettre à jour le mot de passe",
    send: "Envoyer l'e-mail",
  },
  de: {
    email: "E-Mail",
    password: "Passwort",
    fullName: "Vollständiger Name",
    company: "Unternehmen",
    country: "Land",
    terms: "Ich akzeptiere die Bedingungen",
    login: "Anmelden",
    register: "Konto erstellen",
    forgot: "Passwort vergessen?",
    reset: "Passwort aktualisieren",
    send: "E-Mail senden",
  },
  ja: {
    email: "メール",
    password: "パスワード",
    fullName: "氏名",
    company: "会社",
    country: "国",
    terms: "規約に同意します",
    login: "ログイン",
    register: "アカウント作成",
    forgot: "パスワードを忘れましたか？",
    reset: "パスワード更新",
    send: "再設定メールを送信",
  },
  ko: {
    email: "이메일",
    password: "비밀번호",
    fullName: "이름",
    company: "회사",
    country: "국가",
    terms: "약관에 동의합니다",
    login: "로그인",
    register: "계정 만들기",
    forgot: "비밀번호를 잊으셨나요?",
    reset: "비밀번호 업데이트",
    send: "재설정 이메일 보내기",
  },
} satisfies Record<Locale, Record<string, string>>;

function Field({
  label,
  name,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="focus-ring h-12 rounded-md border border-slate-200 px-3 font-normal"
      />
    </label>
  );
}

export function LoginForm({
  locale,
  message,
}: {
  locale: Locale;
  message?: string;
}) {
  const t = labels[locale];

  return (
    <form action={loginAction} className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="locale" value={locale} />
      <Field label={t.email} name="email" type="email" />
      <Field label={t.password} name="password" type="password" />
      <button className="focus-ring min-h-12 rounded-md bg-orange-600 px-5 py-3 text-sm font-semibold text-white">
        {t.login}
      </button>
      {message ? <p className="rounded-md bg-cyan-50 p-3 text-sm text-cyan-900">{message}</p> : null}
      <Link href={localizedPath(locale, "/forgot-password")} className="text-sm font-semibold text-orange-700">
        {t.forgot}
      </Link>
    </form>
  );
}

export function RegisterForm({ locale }: { locale: Locale }) {
  const t = labels[locale];

  return (
    <form action={registerAction} className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="locale" value={locale} />
      <Field label={t.fullName} name="fullName" />
      <Field label={t.email} name="email" type="email" />
      <Field label={t.password} name="password" type="password" />
      <Field label={t.company} name="companyName" required={false} />
      <Field label={t.country} name="country" required={false} />
      <label className="flex items-start gap-3 text-sm text-slate-700">
        <input required type="checkbox" name="terms" className="mt-1" />
        {t.terms}
      </label>
      <button className="focus-ring min-h-12 rounded-md bg-orange-600 px-5 py-3 text-sm font-semibold text-white">
        {t.register}
      </button>
    </form>
  );
}

export function ForgotPasswordForm({ locale }: { locale: Locale }) {
  const t = labels[locale];

  return (
    <form action={forgotPasswordAction} className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="locale" value={locale} />
      <Field label={t.email} name="email" type="email" />
      <button className="focus-ring min-h-12 rounded-md bg-orange-600 px-5 py-3 text-sm font-semibold text-white">
        {t.send}
      </button>
    </form>
  );
}

export function ResetPasswordForm({ locale }: { locale: Locale }) {
  const t = labels[locale];

  return (
    <form action={resetPasswordAction} className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="locale" value={locale} />
      <Field label={t.password} name="password" type="password" />
      <button className="focus-ring min-h-12 rounded-md bg-orange-600 px-5 py-3 text-sm font-semibold text-white">
        {t.reset}
      </button>
    </form>
  );
}
