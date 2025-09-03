"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import Link from "next/link";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      console.log("Tentative de connexion pour:", data.email);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log("Réponse de l'API login:", { status: res.status, result });

      if (!res.ok) throw new Error(result.error || "Erreur serveur");

      localStorage.setItem("token", result.token);
      console.log("Token stocké dans localStorage:", result.token ? "OK" : "ERREUR");

      window.location.href = "/chatroom";
    } catch (e: unknown) {
      const error = e as Error;
      console.error("Erreur lors de la connexion:", error);
      setServerError(error.message);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Background decorative gradients */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 blur-3xl" />
      </div>

      <div className="px-6 py-16 mx-auto max-w-7xl sm:py-24">
        <div className="max-w-md p-6 mx-auto border shadow-2xl rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm sm:p-8">
          <h1 className="text-3xl font-semibold text-center sm:text-4xl">Connexion</h1>
          <p className="mt-2 text-sm text-center text-white/70">Ravi de vous revoir. Accédez à vos conversations.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            {/* Champ Email */}
            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-white/80">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full px-4 py-2 text-sm text-white border rounded-md placeholder-white/50 bg-black/20 border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent"
                placeholder="votre@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-white/80">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="w-full px-4 py-2 text-sm text-white border rounded-md placeholder-white/50 bg-black/20 border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent"
                placeholder="Votre mot de passe"
              />
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
            </div>

            {/* Erreur serveur */}
            {serverError && (
              <p className="p-3 text-sm text-red-300 border rounded bg-red-500/10 border-red-500/30">
                {serverError}
              </p>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-sm font-semibold text-white transition-colors duration-200 bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/25"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Lien vers l'inscription + comptes de test */}
          <div className="mt-6 space-y-3 text-center">
            <p className="text-white/80">
              Pas encore de compte ?{" "}
              <Link href="/register" className="font-medium text-indigo-300 hover:text-white">
                S&rsquo;inscrire
              </Link>
            </p>
            <div>
              <p className="text-sm font-medium text-white/80">Comptes de test :</p>
              <div className="mt-1 space-y-1 text-sm text-white/90">
                <p>
                  <strong>Admin</strong>: admin@chatroom.com / admin123
                </p>
                <p>
                  <strong>Test</strong>: alice@test.com / password123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
