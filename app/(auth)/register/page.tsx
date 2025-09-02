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
      <div className="max-w-md p-8 mx-auto mt-16 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="mb-4 text-6xl text-green-600">✅</div>
          <h1 className="mb-4 text-2xl font-bold text-green-600">Inscription réussie !</h1>
          <p className="mb-4 text-gray-600">Vous allez être redirigé vers le chat...</p>
          <div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md p-8 mx-auto mt-16 bg-white rounded-lg shadow-md">
      <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">Inscription</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Nom */}
        <div>
          <label htmlFor="name" className="block mb-1 font-semibold text-gray-700">Nom & Prénoms</label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Votre nom complet"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block mb-1 font-semibold text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="votre@email.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="password" className="block mb-1 font-semibold text-gray-700">Mot de passe</label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Minimum 6 caractères"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        {/* Confirmation */}
        <div>
          <label htmlFor="confirmPassword" className="block mb-1 font-semibold text-gray-700">Confirmation du mot de passe</label>
          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Répétez votre mot de passe"
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        {/* Erreur serveur */}
        {serverError && (
          <p className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
            {serverError}
          </p>
        )}

        {/* Bouton inscription */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 font-semibold text-white transition-colors duration-200 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Inscription..." : "S'inscrire"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-700">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
