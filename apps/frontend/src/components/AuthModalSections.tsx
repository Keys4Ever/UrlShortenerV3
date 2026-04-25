type AuthMode = "login" | "register";

type AuthModeToggleProps = {
  mode: AuthMode;
  onChangeMode: (mode: AuthMode) => void;
};

export function AuthModeToggle({ mode, onChangeMode }: AuthModeToggleProps) {
  return (
    <div className="flex gap-0 border border-border mb-6">
      <button
        type="button"
        onClick={() => onChangeMode("login")}
        className={`flex-1 min-h-[44px] py-2 font-mono text-xs uppercase tracking-widest transition-interact focus-ring-terminal focus:z-10 ${
          mode === "login"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Log in
      </button>
      <button
        type="button"
        onClick={() => onChangeMode("register")}
        className={`flex-1 min-h-[44px] py-2 font-mono text-xs uppercase tracking-widest border-l border-border transition-interact focus-ring-terminal focus:z-10 ${
          mode === "register"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Register
      </button>
    </div>
  );
}

type RegisterFieldsProps = {
  nickname: string;
  pfp: string;
  setNickname: (value: string) => void;
  setPfp: (value: string) => void;
};

export function RegisterFields({
  nickname,
  pfp,
  setNickname,
  setPfp,
}: RegisterFieldsProps) {
  return (
    <>
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 border border-border bg-surface-raised flex items-center justify-center overflow-hidden">
          {pfp ? (
            <img
              src={pfp || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${nickname || "anon"}`}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-mono text-xs text-muted-foreground">Avatar</span>
          )}
        </div>
        <input
          type="text"
          placeholder="https://… (optional)"
          value={pfp}
          onChange={(e) => setPfp(e.target.value)}
          className="flex-1 bg-input border border-border px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          aria-label="Profile image URL"
        />
      </div>
      <div>
        <label className="block font-mono text-xs text-muted-foreground mb-1 uppercase tracking-wider">
          Display name
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          minLength={3}
          className="w-full bg-input border border-border px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          placeholder="your_handle"
          autoComplete="nickname"
        />
      </div>
    </>
  );
}

type CommonAuthFieldsProps = {
  mode: AuthMode;
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
};

export function CommonAuthFields({
  mode,
  email,
  password,
  setEmail,
  setPassword,
}: CommonAuthFieldsProps) {
  return (
    <>
      <div>
        <label className="block font-mono text-xs text-muted-foreground mb-1 uppercase tracking-wider">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-input border border-border px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div>
        <label className="block font-mono text-xs text-muted-foreground mb-1 uppercase tracking-wider">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full bg-input border border-border px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          placeholder="••••••••"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>
    </>
  );
}
