"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Email invalide"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Erreur serveur");

      setSuccess(
        "Un email de réinitialisation a été envoyé (simulation). Consultez votre boîte mail."
      );
    } catch (e: unknown) {
      const error = e as Error;
      setServerError(error.message);
    }
  };

  return (
    <div className="max-w-md p-8 mx-auto mt-16 bg-white rounded-lg shadow-md">
      <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">
        Mot de passe oublié
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
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
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Messages d'erreur ou succès */}
        {serverError && (
          <p className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
            {serverError}
          </p>
        )}
        {success && (
          <p className="p-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded">
            {success}
          </p>
        )}

        {/* Bouton */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 font-semibold text-white transition-colors duration-200 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Envoi..." : "Envoyer le lien de réinitialisation"}
        </button>
      </form>
    </div>
  );
}
