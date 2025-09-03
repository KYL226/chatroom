import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Background decorative gradients */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="px-6 pb-16 mx-auto max-w-7xl pt-14 sm:pt-20 sm:pb-24">
        <div className="grid items-center gap-10 sm:gap-14 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium border rounded-full border-white/15 text-white/80 backdrop-blur-sm">
              Nouveau • Chat en temps réel sécurisé
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Discutez, partagez et connectez-vous en toute simplicité
            </h1>
            <p className="max-w-xl mt-4 text-base text-white/70 sm:text-lg">
              ChatRoom est une plateforme moderne pour échanger en direct, créer des salles, envoyer des messages et partager des fichiers avec fluidité.
            </p>

            <div className="flex flex-col gap-3 mt-8 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-white transition bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/25 hover:bg-indigo-500"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium transition border rounded-lg border-white/15 text-white/90 backdrop-blur-sm hover:bg-white/5"
              >
                Se connecter
              </Link>
            </div>

            <div className="flex items-center gap-4 mt-6 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full animate-pulse bg-emerald-400" />
                Temps réel
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full" />
                Salles publiques et privées
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-pink-400 rounded-full" />
                Modération intégrée
              </div>
            </div>
          </div>

          <div className="relative w-full max-w-md mx-auto sm:max-w-lg lg:max-w-none">
            <div className="relative p-2 border shadow-2xl rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="p-4 rounded-xl bg-black/40 ring-1 ring-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span className="inline-block w-2 h-2 bg-red-400 rounded-full" />
                    <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full" />
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full" />
                    <span className="ml-2">ChatRoom</span>
                  </div>
                  <span className="text-[10px] text-white/50">Aperçu</span>
                </div>
                <div className="p-4 mt-4 border rounded-lg border-white/10 bg-gradient-to-b from-white/5 to-white/0">
                  <div className="flex gap-4">
                    <div className="flex-col hidden w-40 gap-2 shrink-0 sm:flex">
                      <div className="w-3/4 h-6 rounded bg-white/10" />
                      <div className="w-2/3 h-6 rounded bg-white/10" />
                      <div className="w-4/5 h-6 rounded bg-white/10" />
                      <div className="mt-4 rounded h-28 bg-white/10" />
                    </div>
                    <div className="flex-1">
                      <div className="w-2/3 h-8 mb-3 rounded bg-white/10" />
                      <div className="flex flex-col gap-2">
                        <div className="w-full h-12 rounded-lg bg-white/10" />
                        <div className="w-5/6 h-12 rounded-lg bg-white/10" />
                        <div className="w-4/5 h-12 rounded-lg bg-white/10" />
                      </div>
                      <div className="w-full h-10 mt-4 rounded-lg bg-white/10" />
                    </div>
                    <div className="hidden w-28 shrink-0 sm:block">
                      <div className="h-20 rounded bg-white/10" />
                      <div className="h-20 mt-3 rounded bg-white/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 mx-auto max-w-7xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-10 h-10 mb-3 text-indigo-300 rounded-lg bg-indigo-600/20">💬</div>
            <h3 className="text-lg font-semibold">Conversations fluides</h3>
            <p className="mt-1 text-sm text-white/70">Envoyez des messages, des émojis et des fichiers sans friction.</p>
          </div>
          <div className="p-6 border rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-10 h-10 mb-3 rounded-lg bg-emerald-600/20 text-emerald-300">⚡</div>
            <h3 className="text-lg font-semibold">Temps réel</h3>
            <p className="mt-1 text-sm text-white/70">Mises à jour instantanées grâce au socket en direct.</p>
          </div>
          <div className="p-6 border rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-10 h-10 mb-3 text-pink-300 rounded-lg bg-pink-600/20">🛡️</div>
            <h3 className="text-lg font-semibold">Modération & sécurité</h3>
            <p className="mt-1 text-sm text-white/70">Signalez, modérez et gardez vos espaces sereins.</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 mt-10">
          <p className="text-sm text-white/70">Rejoignez la communauté dès maintenant</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-black transition bg-white rounded-lg hover:bg-white/90">
              Créer un compte
            </Link>
            <Link href="/salles" className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium transition border rounded-lg border-white/15 text-white/90 backdrop-blur-sm hover:bg-white/5">
              Explorer les salles
            </Link>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5/50 backdrop-blur-sm">
        <div className="px-6 py-10 mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="text-sm font-semibold text-white/90">ChatRoom</h4>
              <p className="mt-2 text-sm text-white/60">Plateforme de discussion moderne, simple et sécurisée.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white/90">Produit</h4>
              <ul className="mt-2 space-y-2 text-sm text-white/70">
                <li><Link href="/salles" className="hover:text-white">Salles</Link></li>
                <li><Link href="/chatroom" className="hover:text-white">Chat</Link></li>
                <li><Link href="/profil" className="hover:text-white">Profil</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white/90">Compte</h4>
              <ul className="mt-2 space-y-2 text-sm text-white/70">
                <li><Link href="/register" className="hover:text-white">Créer un compte</Link></li>
                <li><Link href="/login" className="hover:text-white">Se connecter</Link></li>
                <li><Link href="/(auth)/forgot-password" className="hover:text-white">Mot de passe oublié</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white/90">Liens</h4>
              <ul className="mt-2 space-y-2 text-sm text-white/70">
                <li><Link href="/" className="hover:text-white">Espace admin</Link></li>
                <li><Link href="/" className="hover:text-white">Aide</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 pt-6 mt-8 text-xs border-t border-white/10 text-white/60 sm:flex-row">
            <p>© {new Date().getFullYear()} ChatRoom. Tous droits réservés.</p>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-white">Conditions</Link>
              <Link href="/" className="hover:text-white">Confidentialité</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
