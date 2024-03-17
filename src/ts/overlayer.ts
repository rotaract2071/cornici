import { Logo, Ratio } from "./constants.d";
import { fetchFrame, fetchLogo } from "./fetchers";

const sizes: Record<Ratio, [number, number]> = {
	[Ratio.Square]: [1080, 1080],
	[Ratio.Landscape]: [1620, 1080],
	[Ratio.Portrait]: [1080, 1620],
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

const frameSettings = {
	border: 75,
}

const logoSettings = {
	width: 130,
	height: 130,
	margin: 25,
};

export default async function overlay(inputCanvas: HTMLCanvasElement, ratio: Ratio, logo: Logo | null): Promise<URL> {
	const outputCanvas = document.createElement("canvas");
	const outputCanvasContext = outputCanvas.getContext("2d");
	if (outputCanvasContext === null) {
		throw new Error("Canvas 2D rendering context is not supported");
	}
	const [outputCanvasWidth, outputCanvasHeight] = sizes[ratio];
	outputCanvas.width = outputCanvasWidth;
	outputCanvas.height = outputCanvasHeight;

	// Draw the cropped portion of the input image on the output canvas
	drawImage(inputCanvas, outputCanvasContext, outputCanvasWidth, outputCanvasHeight);

	const frame = await fetchFrame(ratio);
	// Draw the frame on the output canvas
	await drawFrame(frame, logo, outputCanvasContext);

	const districtLogo = await fetchLogo(Logo.Distretto);
	let drawnLogosCount = 0;
	// Draw district's logo on the output canvas
	drawLogo(districtLogo, drawnLogosCount++, outputCanvasContext, outputCanvasWidth, outputCanvasHeight);

	if (logo !== null) {
		const optionalLogo = await fetchLogo(logo);
		// Draw the optional logo on the output canvas
		drawLogo(optionalLogo, drawnLogosCount++, outputCanvasContext, outputCanvasWidth, outputCanvasHeight);
	}

	// Return a data URL to the rendered image encoded as PNG
	return new URL(outputCanvas.toDataURL());
}

function drawImage(inputCanvas: HTMLCanvasElement, outputCanvasContext: CanvasRenderingContext2D, outputCanvasWidth: number, outputCanvasHeight: number) {
	outputCanvasContext.drawImage(inputCanvas, frameSettings.border, frameSettings.border, outputCanvasWidth - frameSettings.border * 2, outputCanvasHeight - frameSettings.border * 2);
}

async function drawFrame(frame: SVGElement, logo: Logo | null, outputCanvasContext: CanvasRenderingContext2D) {
	const paths = frame.querySelectorAll("path");

	for (const path of paths) {
		const pathDefinition = path.getAttribute("d");
		if (pathDefinition === null) {
			continue;
		}
		const path2d = new Path2D(pathDefinition);

		if (logo !== null && path.classList.contains("customizable")) {
			outputCanvasContext.fillStyle = colors[logo];
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

function drawLogo(logo: ImageBitmap | HTMLImageElement, drawnLogosCount: number, canvasContext: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
	const [signX, signY] = getAxisSign(drawnLogosCount);

	const [circleCenterX, circleCenterY] = getCircleCoordinates(signX, signY, canvasWidth, canvasHeight);
	drawLogoCircleBackground(circleCenterX, circleCenterY, canvasContext);

	const [dx, dy] = getLogoCoordinates(signX, signY, canvasWidth, canvasHeight);
	canvasContext.drawImage(logo, dx, dy, logoSettings.width, logoSettings.height);
}

function getAxisSign(drawnLogosCount: number): [number, number] {
	const angle = -Math.PI / 4 - Math.PI / 2 * drawnLogosCount;
	const [signX, signY] = [Math.cos, Math.sin].map((trigonometricFunction) => Math.sign(trigonometricFunction(angle)));
	return [signX, signY];
}

function drawLogoCircleBackground(centerX: number, centerY: number, canvasContext: CanvasRenderingContext2D) {
	canvasContext.beginPath();
	canvasContext.ellipse(centerX, centerY, logoSettings.width / 2, logoSettings.height / 2, 0, 0, Math.PI * 2);
	canvasContext.closePath();
	canvasContext.fillStyle = "white";
	canvasContext.fill();
}

function getCircleCoordinates(signX: number, signY: number, canvasWidth: number, canvasHeight: number): [number, number] {
	return [
		canvasWidth / 2 + signX * (canvasWidth / 2 - logoSettings.margin - logoSettings.width / 2),
		canvasHeight / 2 - signY * (canvasHeight / 2 - logoSettings.margin - logoSettings.height / 2),
	];
}

function getLogoCoordinates(signX: number, signY: number, canvasWidth: number, canvasHeight: number): [number, number] {
	return [
		canvasWidth / 2 + signX * (canvasWidth / 2 - logoSettings.margin - (signX > 0 ? logoSettings.width : 0)),
		canvasHeight / 2 - signY * (canvasHeight / 2 - logoSettings.margin - (signY < 0 ? logoSettings.height : 0)),
	];
}
