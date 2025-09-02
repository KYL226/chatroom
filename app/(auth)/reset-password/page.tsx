"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

const schema = z.object({
  password: z.string().min(8, "8 caractères minimum"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erreur serveur");
      setSuccess("Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.");
    } catch (e: unknown) {
      const error = e as Error;
      setServerError(error.message);
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto mt-10 bg-white rounded shadow">
      <h1 className="mb-4 text-2xl font-bold">Réinitialiser le mot de passe</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Nouveau mot de passe</label>
          <input type="password" {...register("password")}
            className="w-full px-3 py-2 border rounded" />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Confirmation du mot de passe</label>
          <input type="password" {...register("confirmPassword")}
            className="w-full px-3 py-2 border rounded" />
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        <button type="submit" disabled={isSubmitting} className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
          {isSubmitting ? "Réinitialisation..." : "Réinitialiser"}
        </button>
      </form>
    </div>
  );
}
