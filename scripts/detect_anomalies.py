import sys
import json
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor

# 🔹 **Récupération des données**
mouse_data = json.loads(sys.argv[1])
interaction_time = float(sys.argv[2])

# 🔍 **Calcul des caractéristiques**
mouse_speeds = [
    np.sqrt((mouse_data[i]["x"] - mouse_data[i - 1]["x"])**2 + (mouse_data[i]["y"] - mouse_data[i - 1]["y"])**2) /
    (mouse_data[i]["time"] - mouse_data[i - 1]["time"] + 1e-5) for i in range(1, len(mouse_data))
]

average_speed = np.mean(mouse_speeds) if mouse_speeds else 0
speed_variability = np.std(mouse_speeds) if mouse_speeds else 0

# **Données d'entrée pour l'analyse**
features = np.array([
    [interaction_time, speed, speed_variability] for speed in mouse_speeds
])

# 🔹 **Suppression des doublons**
features = np.unique(features, axis=0)

print("📌 Données reçues :", mouse_data)
print("📌 Nombre de points :", len(mouse_data))
print("📌 Features calculées :", features)
print("📌 Longueur de features :", len(features))

# 🔹 **Dataset d'entraînement**
training_data = np.array([
    # Humains : mouvements progressifs et réalistes
    [300, 1.2, 0.15], [320, 1.5, 0.2], [290, 0.8, 0.18], [310, 1.1, 0.22],
    [330, 1.3, 0.19], [340, 1.4, 0.17], [350, 1.0, 0.16], [360, 1.2, 0.14],

    # Bots : vitesse constante et comportement trop parfait
    [500, 2.5, 0.01], [500, 2.4, 0.02], [500, 2.6, 0.01], [500, 2.3, 0.03],
    [500, 2.7, 0.02], [500, 2.8, 0.01], [500, 2.9, 0.02], [500, 3.0, 0.01]
])

# 🔹 **Modèles de détection**
iso_forest = IsolationForest(contamination=0.1, random_state=42)
lof = LocalOutlierFactor(n_neighbors=min(10, len(training_data) - 1), contamination=0.15)

# 🔹 **Entraînement des modèles**
iso_forest.fit(training_data)
lof.fit(training_data)

# 🔹 **Gestion du cas où il y a trop peu de données**
if len(features) < 2:
    print("⚠️ **Pas assez de données pour LOF, analyse ignorée.**")
    lof_result = 1  # On considère par défaut que c'est un humain
else:
    try:
        lof_result = lof.fit_predict(features)[0]
    except ValueError as e:
        print("❌ Erreur LOF :", str(e))
        lof_result = 1  # Sécurité pour éviter un crash

# 🔹 **Prédiction d'anomalies**
iso_result = iso_forest.predict(features)[0]

# 🔹 **Détection finale**
anomaly_detected = (iso_result == 1 and lof_result == 1) if len(features) >= 2 else (iso_result == 1)

# 🔹 **Résultat final**
result = "✅ **Humain détecté**" if not anomaly_detected else "🚨 **Bot détecté**"
print("\n🔎 **Résultat final :**", result)
