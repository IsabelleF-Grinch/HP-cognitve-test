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

    // Fonction pour afficher la forme courante
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

    // Initialisation du canvas
    useEffect(() => {
        if (canvasRef.current && !canvasInstance.current) {
            canvasInstance.current = new Canvas(canvasRef.current, {
                isDrawingMode: true,
                backgroundColor: "white",
            });

            // Configuration du pinceau
            canvasInstance.current.freeDrawingBrush = new PencilBrush(canvasInstance.current);
            canvasInstance.current.freeDrawingBrush.width = 2;
            canvasInstance.current.freeDrawingBrush.color = "black";
        }

        displayShape();

        return () => {
            if (canvasInstance.current) {
                canvasInstance.current.clear();
            }
        };
    }, [displayShape]);

    // Fonction pour passer à la forme suivante
    const nextShape = () => {
        setCurrentShapeIndex((prev) => (prev < shapes.length - 1 ? prev + 1 : prev));
    };

    return { canvasRef, nextShape };
}
