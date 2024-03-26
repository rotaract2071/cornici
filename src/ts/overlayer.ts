import settings from "./settings"
import { Logo, type Frame } from "./types.d"

const circleRadius = computeCircleRadius()
const logoMargin = computeLogoMargin()

export default async function overlay(
	width: number,
	height: number,
	image: ImageBitmap,
	frame: Frame,
	districtLogo: ImageBitmap,
	optionalLogo: ImageBitmap | null,
	customColor: string | null,
): Promise<URL> {
	const canvas = new OffscreenCanvas(width, height)
	const context = canvas.getContext("2d")
	if (context === null) {
		throw new Error("Canvas 2D rendering context is not supported")
	}

	// Draw the cropped portion of the input image on the output canvas
	drawImage(
		image,
		context,
		width,
		height,
	)

	// Draw the frame on the output canvas
	drawFrame(
		frame,
		customColor,
		context,
	)

	let drawnLogosCount = 0
	// Draw district's logo on the output canvas
	drawLogo(
		districtLogo,
		customColor ?? settings.colors[Logo.Distretto],
		drawnLogosCount++,
		context,
		width,
		height,
	)

	if (optionalLogo !== null && customColor !== null) {
		// Draw the optional logo on the output canvas
		drawLogo(
			optionalLogo,
			customColor,
			drawnLogosCount++,
			context,
			width,
			height,
		)
	}

	// Create a URL to the rendered image encoded as PNG
	return new URL(URL.createObjectURL(await canvas.convertToBlob()))
}

function drawImage(
	image: ImageBitmap,
	context: OffscreenCanvasRenderingContext2D,
	width: number,
	height: number,
) {
	context.drawImage(
		image,
		settings.frame.border,
		settings.frame.border,
		width - settings.frame.border * 2,
		height - settings.frame.border * 2,
	)
}

function drawFrame(
	frame: Frame,
	customColor: string | null,
	context: OffscreenCanvasRenderingContext2D,
) {
	for (const path of frame.paths) {
		if (customColor !== null && path.customizable) {
			context.fillStyle = customColor
		} else {
			context.fillStyle = path.fill
		}
		context.fill(new Path2D(path.definition))
	}
}

function drawLogo(
	logo: ImageBitmap,
	circleStrokeColor: string,
	drawnLogosCount: number,
	context: OffscreenCanvasRenderingContext2D,
	width: number,
	height: number,
) {
	const [signX, signY] = getAxesSign(drawnLogosCount)

	const [circleCenterX, circleCenterY] = getCircleCenterCoordinates(
		signX,
		signY,
		width,
		height,
	)
	drawLogoCircleBackground(
		circleCenterX,
		circleCenterY,
		circleStrokeColor,
		context,
	)

	const [x, y] = getLogoTopLeftCoordinates(
		signX,
		signY,
		width,
		height,
	)
	context.drawImage(
		logo,
		x,
		y,
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
	context: OffscreenCanvasRenderingContext2D,
) {
	context.beginPath()
	context.ellipse(
		centerX,
		centerY,
		circleRadius,
		circleRadius,
		0,
		0,
		Math.PI * 2,
	)
	context.closePath()

	context.fillStyle = settings.logo.circle.color
	context.fill()

	context.strokeStyle = strokeColor
	context.lineWidth = settings.logo.circle.strokeWidth
	context.stroke()
}

function getCircleCenterCoordinates(
	signX: number,
	signY: number,
	canvasWidth: number,
	canvasHeight: number
): [number, number] {
	return [
		canvasWidth / 2 + signX * (canvasWidth / 2 - settings.logo.circle.margin - Math.floor(settings.logo.circle.strokeWidth / 2) - circleRadius),
		canvasHeight / 2 - signY * (canvasHeight / 2 - settings.logo.circle.margin - Math.floor(settings.logo.circle.strokeWidth / 2) - circleRadius),
	]
}

function getLogoTopLeftCoordinates(
	signX: number,
	signY: number,
	width: number,
	height: number,
): [number, number] {
	return [
		width / 2 + signX * (width / 2 - logoMargin - (signX > 0 ? settings.logo.image.side : 0)),
		height / 2 - signY * (height / 2 - logoMargin - (signY < 0 ? settings.logo.image.side : 0)),
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