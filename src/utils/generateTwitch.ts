import { join } from "path";
import Canvas from "canvas";

Canvas.registerFont(join(__dirname, "..", "assets", "fonts", "Roboto-Bold.ttf"), {family: "Roboto", weight: "700"});
let img = new Canvas.Image();
img.src = join(__dirname, "..", "assets", "twitchTemplate.png");

export function generateTwitchThumbnail<TPipe extends NodeJS.WritableStream>(name: string, pipe: TPipe) {
    const canvas = Canvas.createCanvas(1280, 720);
    const ctx = canvas.getContext("2d");

    // https://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
    function wrapText(fullText: string, x: number, y: number, maxWidth: number, lineHeight: number) {
        const words = fullText.split(" ");
        let line = "";

        words.forEach((word, n) => {
            const testLine = line + word + " ";
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = word + " ";
                y += lineHeight;
            } else {
                line = testLine;
            }
        })
        ctx.fillText(line, x, y);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    ctx.font = "44pt Roboto";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 4;

    wrapText(name, 640, 560, 1180, 58);

    canvas.createPNGStream().pipe(pipe);
}
