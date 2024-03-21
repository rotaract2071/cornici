import settings from "./settings"
import type { Logo, Ratio } from "./types.d"

export async function fetchLogo(logo: Logo): Promise<ImageBitmap | HTMLImageElement> {
	const response = await fetch(`/logos/${logo}-${settings.hashes.logos[logo]}.png`)
	return createImage(await response.blob())
}

export async function fetchFrame(ratio: Ratio): Promise<SVGElement> {
	const response = await fetch(`/frames/${ratio}-${settings.hashes.frames[ratio]}.svg`)
	return createSVG(await response.text())
}

async function createImage(imageData: Blob): Promise<ImageBitmap | HTMLImageElement> {
	if (window.hasOwnProperty("createImageBitmap")) {
		return createImageBitmap(imageData)
	}
	const image = new Image()
	image.src = await (async (blob: Blob): Promise<string> => {
		return new Promise((resolve) => {
			const reader = new FileReader()
			reader.onloadend = () => resolve(reader.result as string)
			reader.readAsDataURL(blob)
		})
	})(imageData)
	await image.decode()
	return image
}

function createSVG(svgText: string): SVGElement {
	const frame: SVGElement = (() => {
		const tmp = document.createElement("div")
		tmp.innerHTML = svgText
		return tmp.firstElementChild as SVGElement
	})()
	return frame
}