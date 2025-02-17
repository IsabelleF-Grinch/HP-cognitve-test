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

# 📌 **Détection de la régularité des mouvements**
time_intervals = [
    (mouse_data[i]["time"] - mouse_data[i - 1]["time"]) for i in range(1, len(mouse_data))
]
time_variability = np.std(time_intervals) if time_intervals else 0

# **Médiane au lieu de moyenne pour réduire l’impact des valeurs extrêmes**
average_speed = np.median(mouse_speeds) if mouse_speeds else 0
speed_variability = np.std(mouse_speeds) if mouse_speeds else 0

# 🔹 **Détection des angles pour repérer un tracé trop linéaire**
angles = []
for i in range(2, len(mouse_data)):
    dx1 = mouse_data[i-1]["x"] - mouse_data[i-2]["x"]
    dy1 = mouse_data[i-1]["y"] - mouse_data[i-2]["y"]
    dx2 = mouse_data[i]["x"] - mouse_data[i-1]["x"]
    dy2 = mouse_data[i]["y"] - mouse_data[i-1]["y"]
    dot_product = dx1 * dx2 + dy1 * dy2
    magnitude1 = np.sqrt(dx1**2 + dy1**2)
    magnitude2 = np.sqrt(dx2**2 + dy2**2)
    if magnitude1 > 0 and magnitude2 > 0:
        cos_theta = dot_product / (magnitude1 * magnitude2)
        angles.append(np.arccos(np.clip(cos_theta, -1.0, 1.0)))
angle_variability = np.std(angles) if angles else 0

# 🔹 **Données d'entrée pour l'analyse**
features = np.array([[interaction_time, average_speed, speed_variability, time_variability, angle_variability]])

# 🔹 **Suppression des doublons**
features = np.unique(features, axis=0)

print("\n📌 [DEBUG] Nombre de points :", len(mouse_data))
print("📌 [DEBUG] Features calculées :", features)

# 🔹 **Dataset d'entraînement**
training_data = np.array([
    [300, 1.2, 0.15, 30, 0.5], [320, 1.5, 0.2, 45, 0.6], [290, 0.8, 0.18, 50, 0.7],
    [310, 1.1, 0.22, 35, 0.5], [330, 1.3, 0.19, 40, 0.6], [340, 1.4, 0.17, 38, 0.7],
    [500, 3.0, 0.01, 2, 0.1], [500, 2.9, 0.02, 3, 0.1], [500, 3.2, 0.01, 1, 0.1],
    [500, 3.1, 0.03, 2, 0.1], [500, 3.5, 0.02, 2, 0.1], [500, 3.8, 0.01, 1, 0.1]
])

# 🔹 **Modèles de détection**
iso_forest = IsolationForest(contamination=0.1, random_state=42)
n_neighbors = min(5, len(training_data) - 1) if len(training_data) > 1 else 2
lof = LocalOutlierFactor(n_neighbors=n_neighbors, contamination=0.1)

# 🔹 **Entraînement des modèles**
iso_forest.fit(training_data)

# 🔹 **Prédiction**
iso_result = iso_forest.predict(features)[0]
lof_result = 1  # Valeur par défaut

if len(features) > 1:
    try:
        lof_result = lof.fit_predict(features)[0]
    except ValueError as e:
        print("❌ Erreur LOF :", str(e))

# 🔹 **Ajout de nouvelles règles de suspicion**
if len(mouse_data) < 50:
    bot_suspect = True
    reason = "⚠️ Trop peu de points enregistrés : BOT SUSPECT"
elif average_speed > np.median(training_data[:, 1]) + 3 * np.std(training_data[:, 1]) and time_variability < 10:
    bot_suspect = True
    reason = "⚠️ Tracé trop fluide et rapide : BOT SUSPECT"
elif angle_variability < 0.2:
    bot_suspect = True
    reason = "⚠️ Mouvement trop linéaire : BOT SUSPECT"
else:
    bot_suspect = False
    reason = "✅ Humain détecté"

# 🔹 **Affichage des valeurs pour comprendre la logique**
print(f"📌 [DEBUG] Isolation Forest Prediction: {iso_result}")
print(f"📌 [DEBUG] LOF Prediction: {lof_result}")
print(f"📌 [DEBUG] Médiane vitesse: {average_speed:.2f}")
print(f"📌 [DEBUG] Variabilité temps: {time_variability:.2f}")
print(f"📌 [DEBUG] Variabilité des angles: {angle_variability:.2f}")
print(f"📌 [DEBUG] Bot suspect: {bot_suspect} - {reason}")

# 🔹 **Détection finale**
anomaly_detected = (iso_result == -1 and lof_result == -1) or bot_suspect

# 🔹 **Résultat final**
result = "🚨 **Bot détecté**" if anomaly_detected else "✅ **Humain détecté**"
print("\n🔎 **Résultat final :**", result)
