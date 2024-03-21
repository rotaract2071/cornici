import settings from "./settings"
import type { Logo, Ratio } from "./types.d"

export async function fetchLogo(logo: Logo): Promise<ImageBitmap> {
	const response = await fetch(`/logos/${logo}-${settings.hashes.logos[logo]}.png`)
	return createImageBitmap(await response.blob())
}

export async function fetchFrame(ratio: Ratio): Promise<SVGElement> {
	const response = await fetch(`/frames/${ratio}-${settings.hashes.frames[ratio]}.svg`)
	return new DOMParser().parseFromString(await response.text(), "image/svg+xml").documentElement as unknown as SVGElement
}