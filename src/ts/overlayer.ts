import { LogoSize, Ratio, Logo } from "./constants.d";
import { fetchFrame, fetchLogo } from "./fetchers";
import Color from "./Color";

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

export async function overlay(inputCanvas: HTMLCanvasElement, ratio: Ratio, logo: Logo): Promise<URL> {
	const [width, height] = size[ratio];
	const outputCanvas = document.createElement("canvas");
	outputCanvas.width = width;
	outputCanvas.height = height;

	drawImage(inputCanvas, outputCanvas);
	await drawFrame(ratio, color[logo], outputCanvas);
	await drawLogo(outputCanvas, Logo.Distretto);
	await drawLogo(outputCanvas, logo);
	return new URL(outputCanvas.toDataURL("image/jpeg"));
}

function drawImage(inputCanvas: HTMLCanvasElement, outputCanvas: HTMLCanvasElement) {
	outputCanvas.getContext("2d").drawImage(
		inputCanvas,
		0,
		0,
		outputCanvas.width,
		outputCanvas.height,
	);
}

async function drawFrame(ratio: Ratio, color: Color, outputCanvas: HTMLCanvasElement) {
	const ctx = outputCanvas.getContext("2d");
	const frameSVG = await fetchFrame(ratio);
	const paths = Array.from(frameSVG.querySelectorAll("path"));

	paths.forEach((path) => {
		const path2d = new Path2D(path.getAttribute("d"));

		if (path.classList.contains("border")) {
			ctx.fillStyle = color.hex;
		} else {
			ctx.fillStyle = path.getAttribute("fill");
		}
		ctx.fill(path2d);

		if (path.getAttribute("stroke") !== null) {
			ctx.strokeStyle = color.darken(0.15).hex;
			ctx.lineWidth = parseInt(path.getAttribute("stroke-width"));
			ctx.stroke(path2d);
		}
	});
}

async function drawLogo(outputCanvas: HTMLCanvasElement, logo: Logo) {
	if (logo === Logo.None) return;
	const logoBitmap = await fetchLogo(logo);
	const [dx, dy] = getCoordinates(logo, outputCanvas);
	outputCanvas.getContext("2d").drawImage(logoBitmap, dx, dy, LogoSize.Width, LogoSize.Height);
}

function getCoordinates(logo: Logo, outputCanvas: HTMLCanvasElement): [number, number] {
	if (logo === Logo.Distretto) {
		return [LogoSize.Margin, LogoSize.Margin];
	}
	return [
		outputCanvas.width - LogoSize.Width - LogoSize.Margin,
		outputCanvas.height - LogoSize.Height - LogoSize.Margin,
	];
}
