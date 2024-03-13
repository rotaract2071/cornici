import Color from "./Color";
import { Logo, Ratio } from "./constants.d";
import { fetchFrame, fetchLogo } from "./fetchers";

const size: Record<Ratio, [number, number]> = {
	[Ratio.Square]: [1080, 1080],
	[Ratio.Landscape]: [1620, 1080],
	[Ratio.Portrait]: [1080, 1620],
};

const color: Record<Logo, Color> = {
	[Logo.None]: new Color("#d41367"),
	[Logo.Distretto]: new Color("#d41367"),
	[Logo.Doc]: new Color("#0d4e8c"),
	[Logo.Etruria]: new Color("#17b2dc"),
	[Logo.Galileo]: new Color("#f5a14d"),
	[Logo.Magnifico]: new Color("#138a62"),
	[Logo.Montalbano]: new Color("#e71d75"),
	[Logo.Tirreno]: new Color("#ee7046"),
};

const logoSettings = {
	width: 110,
	height: 110,
	margin: 25,
};

let drawnLogosCount = 0;

export default async function overlay(inputCanvas: HTMLCanvasElement, ratio: Ratio, logo: Logo): Promise<URL> {
	const outputCanvas = document.createElement("canvas");
	const outputCanvasContext = outputCanvas.getContext("2d");
	if (outputCanvasContext === null) {
		throw new Error("Canvas 2D rendering context is not supported");
	}
	const [outputCanvasWidth, outputCanvasHeight] = size[ratio];
	outputCanvas.width = outputCanvasWidth;
	outputCanvas.height = outputCanvasHeight;

	// Draw the cropped portion of the input image on the output canvas
	outputCanvasContext.drawImage(inputCanvas, 0, 0, outputCanvasWidth, outputCanvasHeight);

	// Draw the frame on the output canvas
	await drawFrame(ratio, color[logo], outputCanvasContext);

	drawnLogosCount = 0;
	// Draw district's logo on the output canvas
	await drawLogo(outputCanvasContext, outputCanvasWidth, outputCanvasHeight, Logo.Distretto);

	if (logo !== Logo.None) {
		// Draw the optional logo on the output canvas
		await drawLogo(outputCanvasContext, outputCanvasWidth, outputCanvasHeight, logo);
	}

	// Return a data URL to the rendered image encoded as PNG
	return new URL(outputCanvas.toDataURL());
}

async function drawFrame(ratio: Ratio, color: Color, outputCanvasContext: CanvasRenderingContext2D) {
	const frameSVG = await fetchFrame(ratio);
	const paths = frameSVG.querySelectorAll("path");

	for (const path of paths) {
		const pathDefinition = path.getAttribute("d");
		if (pathDefinition === null) {
			continue;
		}
		const path2d = new Path2D(pathDefinition);

		if (false) { // set to false until we decide which part of the frame is customizable
			outputCanvasContext.fillStyle = color.hex;
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

async function drawLogo(canvasContext: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, logo: Logo) {
	if (drawnLogosCount >= 2) {
		throw new Error("Unsupported number of logos to draw");
	}
	const logoBitmap = await fetchLogo(logo);
	const [dx, dy] = getCoordinates(canvasWidth, canvasHeight);
	canvasContext.drawImage(logoBitmap, dx, dy, logoSettings.width, logoSettings.height);
	++drawnLogosCount;
}

function getCoordinates(canvasWidth: number, canvasHeight: number): [number, number] {
	switch (drawnLogosCount) {
		case 0:
			// Place the logo to bottom right
			return [
				canvasWidth - logoSettings.width - logoSettings.margin,
				canvasHeight - logoSettings.height - logoSettings.margin,
			];
		case 1:
			// Place the logo to bottom left
			return [
				logoSettings.margin,
				canvasHeight - logoSettings.height - logoSettings.margin,
			];
		default:
			throw new Error("Unsupported number of logos to draw");
	}
}
