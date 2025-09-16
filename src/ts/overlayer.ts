import settings from "./settings"
import { Logo, type Frame } from "./types.d"

function supportsOffscreenCanvas(): boolean {
    return typeof OffscreenCanvas !== "undefined"
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

const circleRadius = computeCircleRadius()

const logoMargin = computeLogoMargin()


export default async function overlay(
    width: number,
    height: number,
    image: ImageBitmap | HTMLImageElement,
    frame: Frame,
    color: string | null,
    logos: (ImageBitmap | HTMLImageElement)[]
): Promise<URL> {
    const overlayer = new Overlayer(width, height)
    overlayer.drawImage(image)
    overlayer.drawFrame(frame, color)

    const logoList = logos.length === 1 ? [logos[0], logos[0]] : logos

    for (const logo of logoList) {
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
        if (!context) throw new Error("Canvas 2D rendering context not supported")
        this.#context = context
    }

	drawImage(image: ImageBitmap | HTMLImageElement) {
		const extraPadding = 20  
		const x = settings.frame.border + extraPadding
		const y = settings.frame.border + extraPadding
		const width = this.#canvas.width - (settings.frame.border + extraPadding) * 2
		const height = this.#canvas.height - (settings.frame.border + extraPadding) * 2
		const radius = 30

		this.#context.save()
		this.#context.fillStyle = "#FFFFFF"
		this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height)
		this.#context.restore()

		this.#context.save()
		this.#context.beginPath()
		this.#context.moveTo(x + radius, y)
		this.#context.lineTo(x + width - radius, y)
		this.#context.quadraticCurveTo(x + width, y, x + width, y + radius)
		this.#context.lineTo(x + width, y + height - radius)
		this.#context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
		this.#context.lineTo(x + radius, y + height)
		this.#context.quadraticCurveTo(x, y + height, x, y + height - radius)
		this.#context.lineTo(x, y + radius)
		this.#context.quadraticCurveTo(x, y, x + radius, y)
		this.#context.closePath()
		this.#context.fillStyle = "#FFFFFF"
		this.#context.fill()
		this.#context.restore()

		this.#context.save()
		this.#context.beginPath()
		this.#context.moveTo(x + radius, y)
		this.#context.lineTo(x + width - radius, y)
		this.#context.quadraticCurveTo(x + width, y, x + width, y + radius)
		this.#context.lineTo(x + width, y + height - radius)
		this.#context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
		this.#context.lineTo(x + radius, y + height)
		this.#context.quadraticCurveTo(x, y + height, x, y + height - radius)
		this.#context.lineTo(x, y + radius)
		this.#context.quadraticCurveTo(x, y, x + radius, y)
		this.#context.closePath()
		this.#context.clip()
		this.#context.drawImage(image, x, y, width, height)
		this.#context.restore()
	}


    drawFrame(frame: Frame, color: string | null) {
        for (const path of frame.paths) {
            this.#context.fillStyle = color !== null && path.customizable ? color : path.fill
            this.#context.fill(new Path2D(path.definition))
        }
    }

    drawLogo(logo: ImageBitmap | HTMLImageElement, circleStrokeColor: string) {
        const [signX, signY] = this.#getAxesSign()
        const [x, y] = this.#getLogoTopLeftCoordinates(signX, signY)
        this.#drawLogoCircleBackground(x, y, circleStrokeColor)
        this.#context.drawImage(logo, x, y, settings.logo.image.side, settings.logo.image.side)
        this.#drawnLogosCount++
    }

    #getAxesSign(): [number, number] {
        switch (this.#drawnLogosCount) {
            case 0: return [-1, 1] // primo logo: alto a sinistra
            case 1: return [1, -1] // secondo logo: basso a destra
            default:
                const angle = -Math.PI / 4 - Math.PI / 2 * this.#drawnLogosCount
                return [Math.cos, Math.sin].map(fn => Math.sign(fn(angle))) as [number, number]
        }
    }

    #getLogoTopLeftCoordinates(signX: number, signY: number): [number, number] {
        const padding = settings.frame.border + settings.logo.circle.margin
        const side = settings.logo.image.side
        const x = signX < 0 ? padding : this.#canvas.width - padding - side
        const y = signY > 0 ? padding : this.#canvas.height - padding - side
        return [x, y]
    }

    #drawLogoCircleBackground(x: number, y: number, strokeColor: string) {
        const centerX = x + settings.logo.image.side / 2
        const centerY = y + settings.logo.image.side / 2

        this.#context.beginPath()
        this.#context.arc(centerX, centerY, circleRadius + settings.logo.circle.strokeWidth, 0, Math.PI * 2)
        this.#context.closePath()
        this.#context.fillStyle ="#FFFFFF"
        this.#context.fill()

        this.#context.beginPath()
        this.#context.arc(centerX, centerY, circleRadius, 0, Math.PI * 2)
        this.#context.closePath()
        this.#context.fillStyle = "#FFFFFF"
        this.#context.fill()
    }	

    async getBlobAndDestroy(): Promise<Blob> {
        const canvas = this.#canvas
        if (supportsOffscreenCanvas() && canvas instanceof OffscreenCanvas) {
            return canvas.convertToBlob()
        }
        if (canvas instanceof HTMLCanvasElement) {
            return new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(blob => {
                    if (!blob) {
                        reject(new Error("Canvas.toBlob returned null"))
                        return
                    }
                    canvas.remove()
                    resolve(blob)
                })
            })
        }
        throw new Error("Unsupported canvas type")
    }
}

function computeCircleRadius(): number {
    return Math.ceil(Math.ceil(settings.logo.image.side / 2 * Math.sqrt(2)) / 2) * 2
        + settings.logo.circle.padding
        + Math.floor(settings.logo.circle.strokeWidth / 2)
}

function computeLogoMargin(): number {
    return settings.logo.circle.margin
        + Math.floor(settings.logo.circle.strokeWidth / 2)
        + circleRadius - settings.logo.image.side / 2
}
