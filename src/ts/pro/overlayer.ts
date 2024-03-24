import { fetchLogo } from "./fetchers"
import settings from "./settings"
import { Frame, Logo, Ratio } from "./types.d"

const outputCanvasSizes: Record<Ratio, [number, number]> = {
	[Ratio.Landscape]: [settings.canvas.longSide, settings.canvas.shortSide],
	[Ratio.Portrait]: [settings.canvas.shortSide, settings.canvas.longSide],
	[Ratio.Square]: [settings.canvas.shortSide, settings.canvas.shortSide],
}
const circleRadius = computeCircleRadius()
const logoMargin = computeLogoMargin()

export default async function overlay(
	image: ImageBitmap,
	frame: Frame,
	districtLogo: ImageBitmap,
	optionalLogo: ImageBitmap | null,
	customColor: string | null,
): Promise<string> {
	const [outputCanvasWidth, outputCanvasHeight] = outputCanvasSizes[frame.ratio]
	const outputCanvas = new OffscreenCanvas(outputCanvasWidth, outputCanvasHeight);
	const outputCanvasContext = outputCanvas.getContext("2d")
	if (outputCanvasContext === null) {
		throw new Error("Canvas 2D rendering context is not supported")
	}

	// Draw the cropped portion of the input image on the output canvas
	drawImage(
		image,
		outputCanvasContext,
		outputCanvasWidth,
		outputCanvasHeight,
	)

	// Draw the frame on the output canvas
	drawFrame(
		frame,
		customColor,
		outputCanvasContext,
	)

	let drawnLogosCount = 0
	// Draw district's logo on the output canvas
	drawLogo(
		districtLogo,
		customColor ?? settings.colors[Logo.Distretto],
		drawnLogosCount++,
		outputCanvasContext,
		outputCanvasWidth,
		outputCanvasHeight,
	)

	if (optionalLogo !== null) {
		// Draw the optional logo on the output canvas
		drawLogo(
			optionalLogo,
			customColor!,
			drawnLogosCount++,
			outputCanvasContext,
			outputCanvasWidth,
			outputCanvasHeight,
		)
	}

	// Create a URL to the rendered image encoded as PNG
	return URL.createObjectURL(await outputCanvas.convertToBlob())
}

function drawImage(
	inputCanvas: ImageBitmap,
	outputCanvasContext: OffscreenCanvasRenderingContext2D,
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
	frame: Frame,
	customColor: string | null,
	outputCanvasContext: OffscreenCanvasRenderingContext2D,
) {
	for (const path of frame.paths) {
		if (customColor !== null && path.customizable) {
			outputCanvasContext.fillStyle = customColor
		} else {
			outputCanvasContext.fillStyle = path.fill
		}
		outputCanvasContext.fill(new Path2D(path.definition))
	}
}

function drawLogo(
	logo: ImageBitmap,
	circleStrokeColor: string,
	drawnLogosCount: number,
	canvasContext: OffscreenCanvasRenderingContext2D,
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

	const [dx, dy] = getLogoTopLeftCoordinates(
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
	return [Math.cos, Math.sin].map((trigonometricFunction) => Math.sign(trigonometricFunction(angle))) as [number, number]
}

function drawLogoCircleBackground(
	centerX: number,
	centerY: number,
	strokeColor: string,
	canvasContext: OffscreenCanvasRenderingContext2D
) {
	canvasContext.beginPath()
	canvasContext.ellipse(
		centerX,
		centerY,
		circleRadius,
		circleRadius,
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
	const circleRadius = computeCircleRadius()
	return [
		canvasWidth / 2 + signX * (canvasWidth / 2 - settings.logo.circle.margin - Math.floor(settings.logo.circle.strokeWidth / 2) - circleRadius),
		canvasHeight / 2 - signY * (canvasHeight / 2 - settings.logo.circle.margin - Math.floor(settings.logo.circle.strokeWidth / 2) - circleRadius),
	]
}

function getLogoTopLeftCoordinates(
	signX: number,
	signY: number,
	canvasWidth: number,
	canvasHeight: number,
): [number, number] {
	return [
		canvasWidth / 2 + signX * (canvasWidth / 2 - logoMargin - (signX > 0 ? settings.logo.image.side : 0)),
		canvasHeight / 2 - signY * (canvasHeight / 2 - logoMargin - (signY < 0 ? settings.logo.image.side : 0)),
	]
}

/**
 * Compute the radius as the nearest even number (ceiling) to the diagonal of the square logo
 * (plus some padding and stroke width compensation)
 * so that the logo is entirely inscribed in the circumference.
 */
function computeCircleRadius(): number {
	return Math.ceil(Math.ceil(settings.logo.image.side / 2 * Math.sqrt(2)) / 2) * 2 + settings.logo.circle.padding + Math.floor(settings.logo.circle.strokeWidth / 2)
}

function computeLogoMargin(): number {
	return settings.logo.circle.margin + Math.floor(settings.logo.circle.strokeWidth / 2) + circleRadius - settings.logo.image.side / 2
}