import settings from "./settings"
import type { Logo, Ratio } from "./types.d"

export async function fetchLogo(logo: Logo): Promise<ImageBitmap | HTMLImageElement> {
	const response = await fetch(`/logos/${logo}-${settings.hashes.logos[logo]}.png`)
	return createImage(await response.blob())
}

export async function fetchFrame(ratio: Ratio): Promise<SVGElement> {
	const response = await fetch(`/frames/${ratio}-${settings.hashes.frames[ratio]}.svg`)
	return new DOMParser().parseFromString(await response.text(), "image/svg+xml").documentElement as unknown as SVGElement
}

async function createImage(imageData: Blob): Promise<ImageBitmap | HTMLImageElement> {
	try {
		return createImageBitmap(imageData)
	} catch {
		const image = new Image()
		image.src = URL.createObjectURL(imageData)
		await image.decode()
		return image
	}
}
