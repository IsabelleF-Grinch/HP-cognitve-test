import { useEffect } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h337: any;
  }
}

export default function Heatmap() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/heatmap.js/2.0.2/heatmap.min.js";
    script.async = true;

    script.onload = () => {
      if (window.h337) {
        const heatmapInstance = window.h337.create({
          container: document.body,
          radius: 10,
        });

        document.addEventListener("mousemove", (event) => {
          heatmapInstance.addData({ x: event.pageX, y: event.pageY, value: 1 });
        });
      } else {
        console.error("h337 (Heatmap.js) n'a pas été chargé correctement.");
      }
    };

    document.body.appendChild(script);

    return () => {
      document.removeEventListener("mousemove", () => {}); // Nettoyage
    };
  }, []);

  return null;
}
