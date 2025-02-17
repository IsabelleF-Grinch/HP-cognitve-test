"use client";
import { useDrawingCanvas } from "../hooks/useDrawingCanvas";
import Heatmap from "./Heatmap";

export default function DrawingTest() {
  const { canvasRef, nextShape, sendData, analysisResult } = useDrawingCanvas();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Dessinez la forme ci-dessous
      </h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "1px solid gray",
            padding: "1rem",
            backgroundColor: "white",
            width: "420px",
            height: "420px",
          }}
        >
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            style={{ display: "block" }}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button
          onClick={nextShape}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#3b82f6",
            color: "white",
            borderRadius: "0.375rem",
            border: "none",
          }}
        >
          Forme suivante
        </button>
        <button
          onClick={sendData}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#ef4444",
            color: "white",
            borderRadius: "0.375rem",
            border: "none",
          }}
        >
          Envoyer le dessin
        </button>
      </div>
      {analysisResult && (
        <p
          style={{
            marginTop: "1rem",
            fontWeight: "bold",
            color: analysisResult.includes("Bot") ? "red" : "green",
          }}
        >
          {analysisResult}
        </p>
      )}
      <Heatmap />
    </div>
  );
}
