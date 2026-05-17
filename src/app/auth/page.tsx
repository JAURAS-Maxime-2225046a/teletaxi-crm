"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Eye, EyeOff, Car, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { LoginSchema, SignupSchema, type LoginInput, type SignupInput } from "@/lib/schemas";
import { useLogin, useSignup } from "@/hooks/use-auth-mutations";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin();
  const signupMutation = useSignup();

  const loginForm = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });
  const signupForm = useForm<SignupInput>({ resolver: zodResolver(SignupSchema) });

  const password = signupForm.watch("password", "");
  const confirmPassword = signupForm.watch("confirmPassword", "");

  const passwordRules = [
    { label: "Au moins 8 caractères", valid: password.length >= 8 },
    { label: "Une majuscule et une minuscule", valid: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Au moins un chiffre", valid: /\d/.test(password) },
  ];

  const handleModeSwitch = (next: Mode) => {
    if (next === mode) return;
    // Préserver l'email entre les deux modes
    const email =
      mode === "login"
        ? loginForm.getValues("email")
        : signupForm.getValues("email");
    setMode(next);
    setTimeout(() => {
      if (next === "login") loginForm.setValue("email", email);
      else signupForm.setValue("email", email);
    }, 0);
  };

  const onLoginSubmit = loginForm.handleSubmit((data) => {
    loginMutation.mutate(data);
  });

  const onSignupSubmit = signupForm.handleSubmit((data) => {
    signupMutation.mutate(data);
  });

  const isPending = loginMutation.isPending || signupMutation.isPending;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-sm">
            <Car className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            TELETAXI <span className="text-blue-600">CRM</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Compagnon de saisie pour TeleTaxi</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleModeSwitch(m)}
                className={cn(
                  "py-3.5 text-sm font-medium transition-colors",
                  mode === m
                    ? "text-blue-600 border-b-2 border-blue-600 -mb-px bg-blue-50/50 dark:bg-blue-950/20"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                {m === "login" ? "Connexion" : "Créer un compte"}
              </button>
            ))}
          </div>

          {/* Form */}
          {mode === "login" ? (
            <form onSubmit={onLoginSubmit} className="p-6 space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...loginForm.register("email")}
                    type="email"
                    placeholder="email@adresse.fr"
                    autoComplete="email"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-red-600">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...loginForm.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-red-600">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Connexion...</span></>
                ) : (
                  <><span>Se connecter</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={onSignupSubmit} className="p-6 space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...signupForm.register("email")}
                    type="email"
                    placeholder="email@adresse.fr"
                    autoComplete="email"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                  />
                </div>
                {signupForm.formState.errors.email && (
                  <p className="text-xs text-red-600">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...signupForm.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...signupForm.register("confirmPassword")}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                  />
                </div>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-xs text-red-600">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              {/* Password rules */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-1.5">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Le mot de passe doit contenir :</p>
                {passwordRules.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className={cn("w-3.5 h-3.5", r.valid ? "text-green-600 dark:text-green-400" : "text-slate-300 dark:text-slate-600")} />
                    <span className={r.valid ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"}>{r.label}</span>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Création...</span></>
                ) : (
                  <><span>Créer mon compte</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          Vos données restent sur votre poste. Aucune connexion cloud requise.
        </p>
      </div>
    </div>
  );
}
