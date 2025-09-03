"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import Link from "next/link";

const schema = z
  .object({
    name: z.string().min(1, "Nom requis"),
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "6 caractères minimum"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

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
      console.log("Tentative d'inscription pour:", data.email);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();
      console.log("Réponse de l'API register:", { status: res.status, result });

      if (!res.ok) throw new Error(result.error || "Erreur serveur");

      localStorage.setItem("token", result.token);
      console.log("Token stocké dans localStorage:", result.token ? "OK" : "ERREUR");

      setIsSuccess(true);
      setTimeout(() => {
        console.log("Redirection vers /chatroom...");
        window.location.href = "/chatroom";
      }, 2000);
    } catch (e: unknown) {
      const error = e as Error;
      console.error("Erreur lors de l'inscription:", error);
      setServerError(error.message);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 blur-3xl" />
        </div>
        <div className="px-6 py-24 mx-auto max-w-7xl">
          <div className="max-w-md p-8 mx-auto text-center border rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl">
            <div className="mb-4 text-6xl">✅</div>
            <h1 className="mb-2 text-2xl font-semibold text-emerald-400">Inscription réussie !</h1>
            <p className="mb-4 text-white/70">Vous allez être redirigé vers le chat...</p>
            <div className="w-8 h-8 mx-auto border-b-2 border-indigo-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 blur-3xl" />
      </div>
      <div className="px-6 py-16 mx-auto max-w-7xl sm:py-24">
        <div className="max-w-md p-6 mx-auto border rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl sm:p-8">
          <h1 className="text-3xl font-semibold text-center sm:text-4xl">Inscription</h1>
          <p className="mt-2 text-sm text-center text-white/70">Créez votre compte et rejoignez les discussions.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            {/* Nom */}
            <div>
              <label htmlFor="name" className="block mb-1 text-sm font-medium text-white/80">Nom & Prénoms</label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full px-4 py-2 text-sm text-white placeholder-white/50 bg-black/20 border border-white/15 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent"
                placeholder="Votre nom complet"
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-white/80">Email</label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full px-4 py-2 text-sm text-white placeholder-white/50 bg-black/20 border border-white/15 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent"
                placeholder="votre@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-white/80">Mot de passe</label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="w-full px-4 py-2 text-sm text-white placeholder-white/50 bg-black/20 border border-white/15 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent"
                placeholder="Minimum 6 caractères"
              />
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
            </div>

            {/* Confirmation */}
            <div>
              <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-white/80">Confirmation du mot de passe</label>
              <input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="w-full px-4 py-2 text-sm text-white placeholder-white/50 bg-black/20 border border-white/15 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent"
                placeholder="Répétez votre mot de passe"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            {/* Erreur serveur */}
            {serverError && (
              <p className="p-3 text-sm text-red-300 border rounded bg-red-500/10 border-red-500/30">
                {serverError}
              </p>
            )}

            {/* Bouton inscription */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-sm font-semibold text-white transition-colors duration-200 bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/25"
            >
              {isSubmitting ? "Inscription..." : "S'inscrire"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/80">
              Déjà un compte ?{" "}
              <Link href="/login" className="font-medium text-indigo-300 hover:text-white">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
