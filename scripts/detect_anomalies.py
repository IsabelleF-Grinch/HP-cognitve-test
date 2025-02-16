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


print("📌 Données reçues :", mouse_data)
print("📌 Nombre de points :", len(mouse_data))
print("📌 Features calculées :", features)
print("📌 Longueur de features :", len(features))


# **Modèles de détection**
iso_forest = IsolationForest(contamination=0.1, random_state=42)

# 🔹 **Gestion du cas où il y a trop peu de données**
if len(features) < 2:
    print("⚠️ Pas assez de données pour LOF, analyse ignorée.")
    lof_result = 1  # On considère par défaut que c'est un humain
else:
    n_neighbors = min(20, max(1, len(features) - 1))
    lof = LocalOutlierFactor(n_neighbors=n_neighbors)
    lof_result = lof.fit_predict(features)[0]

# **Simuler un dataset d'entraînement (à remplacer par un vrai dataset)**
dataset = np.random.rand(200, 3)  
iso_forest.fit(dataset)

# **Exécution de l'algorithme seulement si LOF a été défini**
iso_result = iso_forest.predict(features)[0]
anomaly_detected = (iso_result == -1 or lof_result == -1) if len(features) >= 2 else (iso_result == -1)

# **Résultat**
result = "Bot détecté" if anomaly_detected else "Humain détecté"
print(result)
