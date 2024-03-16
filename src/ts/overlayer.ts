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

const frameSettings = {
	border: 75,
}

const logoSettings = {
	width: 110,
	height: 110,
	margin: 25,
};

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
	await drawFrame(frame, logo, outputCanvasContext);

	const districtLogo = await fetchLogo(Logo.Distretto);
	let drawnLogosCount = 0;
	// Draw district's logo on the output canvas
	await drawLogo(districtLogo, drawnLogosCount++, outputCanvasContext, outputCanvasWidth, outputCanvasHeight);

	if (logo !== Logo.None) {
		const optionalLogo = await fetchLogo(logo);
		// Draw the optional logo on the output canvas
		await drawLogo(optionalLogo, drawnLogosCount++, outputCanvasContext, outputCanvasWidth, outputCanvasHeight);
	}

	// Return a data URL to the rendered image encoded as PNG
	return new URL(outputCanvas.toDataURL());
}

function drawImage(inputCanvas: HTMLCanvasElement, outputCanvasContext: CanvasRenderingContext2D, outputCanvasWidth: number, outputCanvasHeight: number) {
	outputCanvasContext.drawImage(inputCanvas, frameSettings.border, frameSettings.border, outputCanvasWidth - frameSettings.border * 2, outputCanvasHeight - frameSettings.border * 2);
}

async function drawFrame(frame: SVGElement, logo: Logo, outputCanvasContext: CanvasRenderingContext2D) {
	const paths = frame.querySelectorAll("path");

	for (const path of paths) {
		const pathDefinition = path.getAttribute("d");
		if (pathDefinition === null) {
			continue;
		}
		const path2d = new Path2D(pathDefinition);

		if (path.classList.contains("customizable") && logo !== Logo.None) {
			outputCanvasContext.fillStyle = color[logo];
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

async function drawLogo(logo: ImageBitmap | HTMLImageElement, drawnLogosCount: number, canvasContext: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
	const [dx, dy] = getCoordinates(canvasWidth, canvasHeight, drawnLogosCount);
	canvasContext.drawImage(logo, dx, dy, logoSettings.width, logoSettings.height);
}

function getCoordinates(canvasWidth: number, canvasHeight: number, drawnLogosCount: number): [number, number] {
	const angle = -Math.PI / 4 - Math.PI / 2 * drawnLogosCount;
	const [signX, signY] = [Math.cos, Math.sin].map((trigonometricFunction) => Math.sign(trigonometricFunction(angle)));
	return [
		canvasWidth / 2 + signX * (canvasWidth / 2 - logoSettings.margin - (signX > 0 ? logoSettings.width : 0)),
		canvasHeight / 2 - signY * (canvasHeight / 2 - logoSettings.margin - (signY < 0 ? logoSettings.height : 0)),
	];
}
