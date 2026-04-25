import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  AuthModeToggle,
  CommonAuthFields,
  RegisterFields,
} from "@/components/AuthModalSections";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const { login, register, isLoading, error, clearError } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [pfp, setPfp] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    clearError();
    setFormError(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, clearError]);

  if (!open) return null;

  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedNickname = nickname.trim();
    const trimmedPfp = pfp.trim();

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setFormError("Ingresa un email valido.");
      return;
    }
    if (trimmedPassword.length < 8) {
      setFormError("La contrasena debe tener al menos 8 caracteres.");
      return;
    }
    if (mode === "register") {
      if (trimmedNickname.length < 3) {
        setFormError("El nickname debe tener al menos 3 caracteres.");
        return;
      }
      if (trimmedPfp) {
        try {
          const parsed = new URL(trimmedPfp);
          if (!/^https?:$/.test(parsed.protocol)) {
            setFormError("La URL del avatar debe usar http o https.");
            return;
          }
        } catch {
          setFormError("La URL del avatar no es valida.");
          return;
        }
      }
    }

    setFormError(null);
    try {
      if (mode === "login") {
        await login(trimmedEmail, trimmedPassword);
      } else {
        await register(trimmedEmail, trimmedPassword, trimmedNickname, trimmedPfp);
      }
      onClose();
    } catch {}
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-background/80 backdrop-blur-sm p-0 sm:p-4 touch-manipulation"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="border border-border bg-card w-full max-w-md max-h-[min(100dvh,720px)] overflow-y-auto relative sm:max-h-[90vh] shadow-[0_0_40px_hsl(110_100%_55%/0.08)] pb-[max(0px,env(safe-area-inset-bottom,0px))]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="font-mono text-[11px] text-muted-foreground px-4 pt-1.5 pb-[3px] border-b border-border bg-surface flex items-center justify-between gap-2">
          <span className="text-neon-dim shrink-0" aria-hidden>
            ●
          </span>
        </div>
        <div className="flex items-center justify-between pl-[26px] pr-[15px] min-h-[44px]">
          <div className="min-w-0 pr-2">
            <span id="auth-modal-title" className="font-mono text-sm text-foreground">
              {mode === "login" ? "Log in" : "Create account"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground font-mono text-sm min-h-[44px] min-w-[44px] inline-flex items-center justify-center transition-interact focus-ring-terminal"
            aria-label="Close"
          >
            [×]
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 pt-2 sm:p-6 sm:pt-2 space-y-4">
          <AuthModeToggle mode={mode} onChangeMode={setMode} />

          {mode === "register" && (
            <RegisterFields
              nickname={nickname}
              pfp={pfp}
              setNickname={setNickname}
              setPfp={setPfp}
            />
          )}

          <CommonAuthFields
            mode={mode}
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
          />

          {(formError || error) && (
            <p className="font-mono text-xs text-destructive" role="alert">
              {formError ?? error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[48px] bg-primary text-primary-foreground py-2.5 font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-[opacity,box-shadow] duration-200 ease-out disabled:opacity-50 border border-primary focus-ring-terminal"
          >
            {isLoading
              ? mode === "login"
                ? "Signing in…"
                : "Creating account…"
              : mode === "login"
                ? "Log in"
                : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
