import { fetchFrame, fetchLogo } from "./fetchers"
import settings from "./settings"
import { Logo, Ratio } from "./types.d"

const outputCanvasSizes: Record<Ratio, [number, number]> = {
	[Ratio.Landscape]: [settings.canvas.longSide, settings.canvas.shortSide],
	[Ratio.Portrait]: [settings.canvas.shortSide, settings.canvas.longSide],
	[Ratio.Square]: [settings.canvas.shortSide, settings.canvas.shortSide],
}

export default async function overlay(
	inputCanvas: HTMLCanvasElement,
	ratio: Ratio,
	logo: Logo | null,
): Promise<URL> {
	const [outputCanvasWidth, outputCanvasHeight] = outputCanvasSizes[ratio]
	const outputCanvas = createCanvas(outputCanvasWidth, outputCanvasHeight);
	const outputCanvasContext = outputCanvas.getContext("2d")
	if (outputCanvasContext === null) {
		throw new Error("Canvas 2D rendering context is not supported")
	}

	// Draw the cropped portion of the input image on the output canvas
	drawImage(
		inputCanvas,
		outputCanvasContext,
		outputCanvasWidth,
		outputCanvasHeight,
	)

	// Draw the frame on the output canvas
	drawFrame(
		await fetchFrame(ratio),
		logo !== null ? settings.colors[logo] : null,
		outputCanvasContext,
	)

	let drawnLogosCount = 0
	// Draw district's logo on the output canvas
	drawLogo(
		await fetchLogo(Logo.Distretto),
		logo !== null ? settings.colors[logo] : settings.colors[Logo.Distretto],
		drawnLogosCount++,
		outputCanvasContext,
		outputCanvasWidth,
		outputCanvasHeight,
	)

	if (logo !== null) {
		// Draw the optional logo on the output canvas
		drawLogo(
			await fetchLogo(logo),
			settings.colors[logo],
			drawnLogosCount++,
			outputCanvasContext,
			outputCanvasWidth,
			outputCanvasHeight,
		)
	}
	
	// Create a URL to the rendered image encoded as PNG
	return new URL(URL.createObjectURL(await getBlobAndDestroy(outputCanvas)))
}

function createCanvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
	if (window.hasOwnProperty("OffscreenCanvas")) {
		return new OffscreenCanvas(width, height)
	}
	const canvas = document.createElement("canvas")
	canvas.width = width
	canvas.height = height
	return canvas
}

function drawImage(
	inputCanvas: HTMLCanvasElement,
	outputCanvasContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
	outputCanvasWidth: number,
	outputCanvasHeight: number,
) {
	outputCanvasContext.drawImage(
		inputCanvas,
		settings.frame.border,
		settings.frame.border,
		outputCanvasWidth - settings.frame.border * 2,
		outputCanvasHeight - settings.frame.border * 2,
	)
}

function drawFrame(
	frame: SVGElement,
	customColor: string | null,
	outputCanvasContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
) {
	for (const path of frame.querySelectorAll("path")) {
		const pathDefinition = path.getAttribute("d")
		if (pathDefinition === null) {
			continue
		}

		if (customColor !== null && path.classList.contains("customizable")) {
			outputCanvasContext.fillStyle = customColor
		} else {
			const fill = path.getAttribute("fill")
			if (fill === null) {
				continue
			}
			outputCanvasContext.fillStyle = fill
		}
		outputCanvasContext.fill(new Path2D(pathDefinition))
	}
}

function drawLogo(
	logo: ImageBitmap | HTMLImageElement,
	circleStrokeColor: string,
	drawnLogosCount: number,
	canvasContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
	canvasWidth: number,
	canvasHeight: number,
) {
	const [signX, signY] = getAxesSign(drawnLogosCount)

	const [circleCenterX, circleCenterY] = getCircleCenterCoordinates(
		signX,
		signY,
		canvasWidth,
		canvasHeight,
	)
	drawLogoCircleBackground(
		circleCenterX,
		circleCenterY,
		circleStrokeColor,
		canvasContext,
	)

	const [dx, dy] = getLogoCoordinates(
		signX,
		signY,
		canvasWidth,
		canvasHeight,
	)
	canvasContext.drawImage(
		logo,
		dx,
		dy,
		settings.logo.image.side,
		settings.logo.image.side,
	)
}

/**
 * Returns an array containing the sign of X and Y axes
 * to identify the quadrant in which the logo must be drawn.
 */
function getAxesSign(drawnLogosCount: number): [number, number] {
	// This is the angle relative to the center of the image that determines the position of the logo
	// starting from the bottom right (-π/4) and stepping by 90° clockwise (-π/2)
	const angle = -Math.PI / 4 - Math.PI / 2 * drawnLogosCount
	const [signX, signY] = [Math.cos, Math.sin]
		.map((trigonometricFunction) => Math.sign(trigonometricFunction(angle)))
	return [signX, signY]
}

function drawLogoCircleBackground(
	centerX: number,
	centerY: number,
	strokeColor: string,
	canvasContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
) {
	canvasContext.beginPath()
	canvasContext.ellipse(
		centerX,
		centerY,
		settings.logo.circle.radius,
		settings.logo.circle.radius,
		0,
		0,
		Math.PI * 2,
	)
	canvasContext.closePath()

	canvasContext.fillStyle = settings.logo.circle.color
	canvasContext.fill()

	canvasContext.strokeStyle = strokeColor
	canvasContext.lineWidth = settings.logo.circle.strokeWidth
	canvasContext.stroke()
}

function getCircleCenterCoordinates(
	signX: number,
	signY: number,
	canvasWidth: number,
	canvasHeight: number
): [number, number] {
	return [
		canvasWidth / 2 + signX * (canvasWidth / 2 - settings.logo.circle.margin - settings.logo.circle.radius),
		canvasHeight / 2 - signY * (canvasHeight / 2 - settings.logo.circle.margin - settings.logo.circle.radius),
	]
}

function getLogoCoordinates(
	signX: number,
	signY: number,
	canvasWidth: number,
	canvasHeight: number,
): [number, number] {
	return [
		canvasWidth / 2 + signX * (canvasWidth / 2 - settings.logo.image.margin - (signX > 0 ? settings.logo.image.side : 0)),
		canvasHeight / 2 - signY * (canvasHeight / 2 - settings.logo.image.margin - (signY < 0 ? settings.logo.image.side : 0)),
	]
}

async function getBlobAndDestroy(canvas: OffscreenCanvas | HTMLCanvasElement): Promise<Blob> {
	if (canvas instanceof OffscreenCanvas) {
		return canvas.convertToBlob()
	}
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob === null) {
				reject()
				return
			}
			canvas.remove()
			resolve(blob)
		})
	})
}