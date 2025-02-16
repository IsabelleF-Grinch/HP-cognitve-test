import { useEffect } from "react";

export default function Heatmap() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/heatmap.js/2.0.2/heatmap.min.js";
    script.async = true;
    script.onload = () => {
      const heatmapInstance = h337.create({
        container: document.body,
        radius: 10,
      });

      document.addEventListener("mousemove", (event) => {
        heatmapInstance.addData({ x: event.pageX, y: event.pageY, value: 1 });
      });
    };
    document.body.appendChild(script);
  }, []);

  return null;
}
