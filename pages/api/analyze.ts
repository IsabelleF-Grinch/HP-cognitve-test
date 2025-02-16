import { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("✅ API analyze.ts appelée !");

    if (req.method === "POST") {
        const { mouseData, interactionTime } = req.body;

        console.log("📊 Données reçues :", JSON.stringify(req.body));

        try {
            // Chemin absolu vers le script Python
            const scriptPath = path.join(process.cwd(), "scripts", "detect_anomalies.py");

            // Vérifie l'environnement virtuel
            const pythonExecutable = path.join(process.cwd(), "venv", "bin", "python3");

            const pythonProcess = spawn(pythonExecutable, [
                scriptPath,
                JSON.stringify(mouseData),
                interactionTime.toString()
            ]);

            let result = "";
            let errorMessage = "";

            pythonProcess.stdout.on("data", (data) => {
                result += data.toString();
            });

            pythonProcess.stderr.on("data", (data) => {
                errorMessage += data.toString();
                console.error("❌ Erreur Python :", errorMessage);
            });

            pythonProcess.on("close", (code) => {
                console.log("📌 Processus Python terminé avec code :", code);

                if (code !== 0 || errorMessage) {
                    return res.status(500).json({ error: "Erreur d'analyse", details: errorMessage });
                }

                const responseData = {
                    fullResult: result.trim(),  // ✅ Tout le résultat brut
                    detection: result.includes("Humain détecté") ? "✅ Humain détecté" : "🚨 Bot détecté", // ✅ Juste le résultat final
                };

                res.status(200).json(responseData);
                // res.status(200).json({ result: result.trim() });
            });

        } catch (error) {
            console.error("🚨 Erreur API :", error);
            res.status(500).json({ error: "Erreur du serveur" });
        }
    } else {
        res.status(405).json({ error: "Méthode non autorisée" });
    }
}
