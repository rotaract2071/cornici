import { fetchFrame, fetchLogo } from "./fetchers";
import settings from "./settings";
import { Logo, Ratio } from "./types.d";

const outputCanvasSizes: Record<Ratio, [number, number]> = {
	[Ratio.Square]: [settings.canvas.shortSide, settings.canvas.shortSide],
	[Ratio.Landscape]: [settings.canvas.longSide, settings.canvas.shortSide],
	[Ratio.Portrait]: [settings.canvas.shortSide, settings.canvas.longSide],
};

const colors: Record<Logo, string> = {
	[Logo.Distretto]: "#d41367",
	[Logo.Doc]: "#0d4e8c",
	[Logo.Etruria]: "#17b2dc",
	[Logo.Galileo]: "#f5a14d",
	[Logo.Magnifico]: "#138a62",
	[Logo.Montalbano]: "#e71d75",
	[Logo.Tirreno]: "#ee7046",
};

export default async function overlay(inputCanvas: HTMLCanvasElement, ratio: Ratio, logo: Logo | null): Promise<URL> {
	const outputCanvas = document.createElement("canvas");
	const outputCanvasContext = outputCanvas.getContext("2d");
	if (outputCanvasContext === null) {
		throw new Error("Canvas 2D rendering context is not supported");
	}
	const [outputCanvasWidth, outputCanvasHeight] = outputCanvasSizes[ratio];
	outputCanvas.width = outputCanvasWidth;
	outputCanvas.height = outputCanvasHeight;

	// Draw the cropped portion of the input image on the output canvas
	drawImage(inputCanvas, outputCanvasContext, outputCanvasWidth, outputCanvasHeight);

	const frame = await fetchFrame(ratio);
	// Draw the frame on the output canvas
	await drawFrame(frame, logo !== null ? colors[logo] : null, outputCanvasContext);

	const districtLogo = await fetchLogo(Logo.Distretto);
	let drawnLogosCount = 0;
	// Draw district's logo on the output canvas
	drawLogo(districtLogo, logo !== null ? colors[logo] : colors[Logo.Distretto], drawnLogosCount++, outputCanvasContext, outputCanvasWidth, outputCanvasHeight);

	if (logo !== null) {
		const optionalLogo = await fetchLogo(logo);
		// Draw the optional logo on the output canvas
		drawLogo(optionalLogo, colors[logo], drawnLogosCount++, outputCanvasContext, outputCanvasWidth, outputCanvasHeight);
	}

	// Create a URL to the rendered image encoded as PNG
	const url = URL.createObjectURL(await getImageBlob(outputCanvas));

	// Cleanup output canvas
	outputCanvas.remove();

	return new URL(url);
}

function drawImage(inputCanvas: HTMLCanvasElement, outputCanvasContext: CanvasRenderingContext2D, outputCanvasWidth: number, outputCanvasHeight: number) {
	outputCanvasContext.drawImage(inputCanvas, settings.frame.border, settings.frame.border, outputCanvasWidth - settings.frame.border * 2, outputCanvasHeight - settings.frame.border * 2);
}

async function drawFrame(frame: SVGElement, customColor: string | null, outputCanvasContext: CanvasRenderingContext2D) {
	const paths = frame.querySelectorAll("path");

	for (const path of paths) {
		const pathDefinition = path.getAttribute("d");
		if (pathDefinition === null) {
			continue;
		}
		const path2d = new Path2D(pathDefinition);

		if (customColor !== null && path.classList.contains("customizable")) {
			outputCanvasContext.fillStyle = customColor;
		} else {
			const fill = path.getAttribute("fill");
			if (fill === null) {
				continue;
			}
			outputCanvasContext.fillStyle = fill;
		}
		outputCanvasContext.fill(path2d);
	}
}

function drawLogo(logo: ImageBitmap | HTMLImageElement, circleStrokeColor: string, drawnLogosCount: number, canvasContext: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
	const [signX, signY] = getAxesSign(drawnLogosCount);

	const [circleCenterX, circleCenterY] = getCircleCenterCoordinates(signX, signY, canvasWidth, canvasHeight);
	drawLogoCircleBackground(circleCenterX, circleCenterY, circleStrokeColor, canvasContext);

	const [dx, dy] = getLogoCoordinates(signX, signY, canvasWidth, canvasHeight);
	canvasContext.drawImage(logo, dx, dy, settings.logo.image.side, settings.logo.image.side);
}

/**
 * Returns an array containing the sign of X and Y axes
 * to identify the quadrant in which the logo must be drawn.
 */
function getAxesSign(drawnLogosCount: number): [number, number] {
	// This is the angle relative to the center of the image that determines the position of the logo
	// starting from the bottom right (-π/4) and stepping by 90° clockwise (-π/2)
	const angle = -Math.PI / 4 - Math.PI / 2 * drawnLogosCount;
	const [signX, signY] = [Math.cos, Math.sin].map((trigonometricFunction) => Math.sign(trigonometricFunction(angle)));
	return [signX, signY];
}

function drawLogoCircleBackground(centerX: number, centerY: number, strokeColor: string, canvasContext: CanvasRenderingContext2D) {
	canvasContext.beginPath();
	canvasContext.ellipse(centerX, centerY, settings.logo.circle.radius, settings.logo.circle.radius, 0, 0, Math.PI * 2);
	canvasContext.closePath();
	canvasContext.fillStyle = settings.logo.circle.color;
	canvasContext.fill();
	canvasContext.strokeStyle = strokeColor;
	canvasContext.lineWidth = settings.logo.circle.strokeWidth;
	canvasContext.stroke();
}

function getCircleCenterCoordinates(signX: number, signY: number, canvasWidth: number, canvasHeight: number): [number, number] {
	return [
		canvasWidth / 2 + signX * (canvasWidth / 2 - settings.logo.circle.margin - settings.logo.circle.radius),
		canvasHeight / 2 - signY * (canvasHeight / 2 - settings.logo.circle.margin - settings.logo.circle.radius),
	];
}

function getLogoCoordinates(signX: number, signY: number, canvasWidth: number, canvasHeight: number): [number, number] {
	return [
		canvasWidth / 2 + signX * (canvasWidth / 2 - settings.logo.image.margin - (signX > 0 ? settings.logo.image.side : 0)),
		canvasHeight / 2 - signY * (canvasHeight / 2 - settings.logo.image.margin - (signY < 0 ? settings.logo.image.side : 0)),
	];
}

async function getImageBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob === null) {
				reject();
				return;
			}
			resolve(blob);
		});
	})
}