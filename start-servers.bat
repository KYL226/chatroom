@echo off
echo 🚀 Démarrage des serveurs de développement...
echo.

echo 📡 Démarrage du serveur Socket.io...
start "Socket.io Server" cmd /k "npm run dev:socket"

echo ⏳ Attente de 3 secondes...
timeout /t 3 /nobreak > nul

echo 📡 Démarrage du serveur Next.js...
start "Next.js Server" cmd /k "npm run dev"

echo.
echo ✅ Les deux serveurs ont été démarrés !
echo.
echo 📍 Socket.io: http://localhost:3001
echo 📍 Next.js: http://localhost:3000
echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause > nul
