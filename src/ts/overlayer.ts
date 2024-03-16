import { Logo, Ratio } from "./constants.d";
import { fetchFrame, fetchLogo } from "./fetchers";

const size: Record<Ratio, [number, number]> = {
	[Ratio.Square]: [1080, 1080],
	[Ratio.Landscape]: [1620, 1080],
	[Ratio.Portrait]: [1080, 1620],
};

const color: Record<Logo, string> = {
	[Logo.None]: "#d41367",
	[Logo.Distretto]: "#d41367",
	[Logo.Doc]: "#0d4e8c",
	[Logo.Etruria]: "#17b2dc",
	[Logo.Galileo]: "#f5a14d",
	[Logo.Magnifico]: "#138a62",
	[Logo.Montalbano]: "#e71d75",
	[Logo.Tirreno]: "#ee7046",
};

const logoSettings = {
	width: 110,
	height: 110,
	margin: 25,
};

const frameSettings = {
	border: 75,
}

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
	drawImage(inputCanvas, outputCanvasContext, outputCanvasWidth, outputCanvasHeight);

	const frame = await fetchFrame(ratio);
	// Draw the frame on the output canvas
	await drawFrame(frame, color[logo], outputCanvasContext);

	const districtLogo = await fetchLogo(Logo.Distretto);
	drawnLogosCount = 0;
	// Draw district's logo on the output canvas
	await drawLogo(districtLogo, outputCanvasContext, outputCanvasWidth, outputCanvasHeight);
	++drawnLogosCount;

	if (logo !== Logo.None) {
		const optionalLogo = await fetchLogo(logo);
		// Draw the optional logo on the output canvas
		await drawLogo(optionalLogo, outputCanvasContext, outputCanvasWidth, outputCanvasHeight);
		++drawnLogosCount;
	}

	// Return a data URL to the rendered image encoded as PNG
	return new URL(outputCanvas.toDataURL());
}

function drawImage(inputCanvas: HTMLCanvasElement, outputCanvasContext: CanvasRenderingContext2D, outputCanvasWidth: number, outputCanvasHeight: number) {
	outputCanvasContext.drawImage(inputCanvas, frameSettings.border, frameSettings.border, outputCanvasWidth - frameSettings.border * 2, outputCanvasHeight - frameSettings.border * 2);
}

async function drawFrame(frame: SVGElement, color: string, outputCanvasContext: CanvasRenderingContext2D) {
	const paths = frame.querySelectorAll("path");

	for (const path of paths) {
		const pathDefinition = path.getAttribute("d");
		if (pathDefinition === null) {
			continue;
		}
		const path2d = new Path2D(pathDefinition);

		if (false) { // set to false until we decide which part of the frame is customizable
			outputCanvasContext.fillStyle = color;
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

async function drawLogo(logo: ImageBitmap | HTMLImageElement, canvasContext: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
	const [dx, dy] = getCoordinates(canvasWidth, canvasHeight);
	canvasContext.drawImage(logo, dx, dy, logoSettings.width, logoSettings.height);
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
