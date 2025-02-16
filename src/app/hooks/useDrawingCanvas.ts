import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, Circle, Rect, Triangle, PencilBrush, TOriginX, TOriginY } from "fabric";

const shapes = [
    {
        type: "circle",
        options: {
            left: 200,
            top: 200,
            radius: 50,
            fill: "transparent",
            stroke: "black",
            originX: "center" as TOriginX,
            originY: "center" as TOriginY,
        },
    },
    {
        type: "rect",
        options: {
            left: 200,
            top: 200,
            width: 100,
            height: 100,
            fill: "transparent",
            stroke: "black",
            originX: "center" as TOriginX,
            originY: "center" as TOriginY,
        },
    },
    {
        type: "triangle",
        options: {
            left: 200,
            top: 200,
            width: 100,
            height: 100,
            fill: "transparent",
            stroke: "black",
            originX: "center" as TOriginX,
            originY: "center" as TOriginY,
        },
    },
];

export function useDrawingCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
    const canvasInstance = useRef<Canvas | null>(null);
    const [mouseData, setMouseData] = useState<{ x: number; y: number; time: number }[]>([]);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const displayShape = useCallback(() => {
        if (!canvasInstance.current) return;
        canvasInstance.current.clear();

        const shape = shapes[currentShapeIndex];
        if (shape) {
            let drawnShape;
            switch (shape.type) {
                case "circle":
                    drawnShape = new Circle(shape.options);
                    break;
                case "rect":
                    drawnShape = new Rect(shape.options);
                    break;
                case "triangle":
                    drawnShape = new Triangle(shape.options);
                    break;
            }
            if (drawnShape) {
                canvasInstance.current.add(drawnShape);
            }
        }
    }, [currentShapeIndex]);

    useEffect(() => {
        if (canvasRef.current && !canvasInstance.current) {
            canvasInstance.current = new Canvas(canvasRef.current, {
                isDrawingMode: true,
                backgroundColor: "white",
            });

            const canvas = canvasInstance.current;
            canvas.freeDrawingBrush = new PencilBrush(canvas);
            canvas.freeDrawingBrush.width = 2;
            canvas.freeDrawingBrush.color = "black";

            canvas.on("mouse:move", (event) => {
                const pointer = canvas.getPointer(event.e);
                setMouseData((prev) => [
                    ...prev,
                    { x: pointer.x, y: pointer.y, time: Date.now() },
                ]);
            });

            canvas.on("mouse:down", () => {
                if (!startTime) setStartTime(Date.now());
            });
        }

        displayShape();

        return () => {
            if (canvasInstance.current) {
                canvasInstance.current.clear();
            }
        };
    }, [displayShape, startTime]);

    const nextShape = () => {
        setCurrentShapeIndex((prev) => (prev < shapes.length - 1 ? prev + 1 : prev));
    };

    const sendData = async () => {
        if (mouseData.length > 0 && startTime) {
            const interactionTime = Date.now() - startTime;
            const payload = { mouseData, interactionTime };

            try {
                const response = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                // ✅ Log toutes les données dans la console
                console.log("📌 **Données complètes reçues de l'API :**", data.fullResult);

                // ✅ Afficher uniquement "Bot détecté" ou "Humain détecté" dans l'interface
                setAnalysisResult(data.detection);
            } catch (error) {
                console.error("Erreur d'envoi des données :", error);
            }
        }
    };

    return { canvasRef, nextShape, sendData, analysisResult };
}
