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
    <div className="max-w-md p-8 mx-auto mt-16 bg-white rounded-lg shadow-md">
      <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">Connexion</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Champ Email */}
        <div>
          <label htmlFor="email" className="block mb-1 font-semibold text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="votre@email.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* Champ Mot de passe */}
        <div>
          <label htmlFor="password" className="block mb-1 font-semibold text-gray-700">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Votre mot de passe"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        {/* Erreur serveur */}
        {serverError && (
          <p className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
            {serverError}
          </p>
        )}

        {/* Bouton de connexion */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 font-semibold text-white transition-colors duration-200 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      {/* Lien vers l'inscription + comptes de test */}
      <div className="mt-8 space-y-3 text-center">
        <p className="text-gray-700">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:underline">
            S&rsquo;inscrire
          </Link>
        </p>
        <div>
          <p className="text-sm font-medium text-gray-700">Comptes de test :</p>
          <div className="mt-1 space-y-1 text-sm text-gray-800">
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
  );
}
