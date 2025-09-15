import { supportsOffscreenCanvas } from "./feature-checker"
import settings from "./settings"
import { Logo, type Frame } from "./types.d"

const circleRadius = computeCircleRadius()
const logoMargin = computeLogoMargin()

export default async function (
	width: number,
	height: number,
	image: (ImageBitmap | HTMLImageElement),
	frame: Frame,
	color: string | null,
	logos: (ImageBitmap | HTMLImageElement)[],
): Promise<URL> {
	const overlayer = new Overlayer(width, height)
	overlayer.drawImage(image)
	overlayer.drawFrame(frame, color)
	for (const logo of logos) {
		overlayer.drawLogo(logo, color ?? settings.colors[Logo.Distretto])
	}
	return new URL(URL.createObjectURL(await overlayer.getBlobAndDestroy()))
}

class Overlayer {
	#canvas: OffscreenCanvas | HTMLCanvasElement
	#context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
	#drawnLogosCount = 0

	constructor(width: number, height: number) {
		this.#canvas = createCanvas(width, height)
		const context = this.#canvas.getContext("2d")
		if (context === null) {
			throw new Error("Canvas 2D rendering context is not supported")
		}
		this.#context = context
	}

	drawImage(image: ImageBitmap | HTMLImageElement) {
		const x = settings.frame.border
		const y = settings.frame.border
		const width = this.#canvas.width - settings.frame.border * 2
		const height = this.#canvas.height - settings.frame.border * 2
		this.#context.drawImage(image, x, y, width, height)
	}

	drawFrame(frame: Frame, color: string | null) {
		for (const path of frame.paths) {
			this.#context.fillStyle = color !== null && path.customizable ? color : path.fill
			this.#context.fill(new Path2D(path.definition))
		}
	}

	drawLogo(logo: ImageBitmap | HTMLImageElement, circleStrokeColor: string) {
		const [signX, signY] = this.#getAxesSign()

		this.#drawLogoCircleBackground(signX, signY, circleStrokeColor)

		const [x, y] = this.#getLogoTopLeftCoordinates(signX, signY)
		this.#context.drawImage(
			logo,
			x,
			y,
			settings.logo.image.side,
			settings.logo.image.side,
		)

		++this.#drawnLogosCount
	}

	#getAxesSign(): [number, number] {
		switch (this.#drawnLogosCount) {
			case 0:
				return [-1, 1]; // primo logo: alto a sinistra
			case 1:
				return [1, -1]; // secondo logo: basso a destra
			default:
				// loghi successivi: schema originale
				const angle = -Math.PI / 4 - Math.PI / 2 * this.#drawnLogosCount
				return [Math.cos, Math.sin].map((fn) => Math.sign(fn(angle))) as [number, number]
		}
	}

	#drawLogoCircleBackground(signX: number, signY: number, strokeColor: string) {
		const [centerX, centerY] = [
			this.#canvas.width / 2 + signX * (this.#canvas.width / 2 - settings.logo.circle.margin - Math.floor(settings.logo.circle.strokeWidth / 2) - circleRadius),
			this.#canvas.height / 2 - signY * (this.#canvas.height / 2 - settings.logo.circle.margin - Math.floor(settings.logo.circle.strokeWidth / 2) - circleRadius),
		]

		const compensationAngle = Math.PI / 64
		const startAngle = Math.PI * 3 / 4

		// Draw the portion of ellipse that serves as border
		this.#context.beginPath()
		this.#context.ellipse(
			centerX,
			centerY,
			circleRadius + settings.logo.circle.strokeWidth,
			circleRadius + settings.logo.circle.strokeWidth,
			this.#drawnLogosCount * Math.PI / 2,
			startAngle + compensationAngle,
			startAngle + Math.PI - compensationAngle,
		)
		this.#context.closePath()
		this.#context.fillStyle = strokeColor
		this.#context.fill()

		// Dirty hack to hide the remaining portion of the frame in the corner
		const patchAngle = Math.PI / 16
		this.#context.beginPath()
		this.#context.moveTo(centerX, centerY)
		this.#context.arc(
			centerX,
			centerY,
			circleRadius + settings.logo.circle.strokeWidth + 4,
			this.#drawnLogosCount * Math.PI / 2 + Math.PI / 4 - patchAngle / 2,
			this.#drawnLogosCount * Math.PI / 2 + Math.PI / 4 + patchAngle / 2,
		)
		this.#context.closePath()
		this.#context.fillStyle = settings.logo.circle.color
		this.#context.fill()

		// Draw the actual circle
		this.#context.beginPath()
		this.#context.arc(
			centerX,
			centerY,
			circleRadius,
			0,
			Math.PI * 2,
		)
		this.#context.closePath()
		this.#context.fillStyle = settings.logo.circle.color
		this.#context.fill()
	}

	#getLogoTopLeftCoordinates(signX: number, signY: number): [number, number] {
		return [
			this.#canvas.width / 2 + signX * (this.#canvas.width / 2 - logoMargin - (signX > 0 ? settings.logo.image.side : 0)),
			this.#canvas.height / 2 - signY * (this.#canvas.height / 2 - logoMargin - (signY < 0 ? settings.logo.image.side : 0)),
		]
	}

	async getBlobAndDestroy(): Promise<Blob> {
		const canvas = this.#canvas
		if (supportsOffscreenCanvas() && canvas instanceof OffscreenCanvas) {
			return canvas.convertToBlob()
		}
		if (canvas instanceof HTMLCanvasElement) {
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
		throw new Error()
	}
}

function createCanvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
	if (supportsOffscreenCanvas()) {
		return new OffscreenCanvas(width, height)
	}
	const canvas = document.createElement("canvas")
	canvas.width = width
	canvas.height = height
	return canvas
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