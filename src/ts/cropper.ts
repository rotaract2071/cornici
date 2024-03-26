import Croppr from "croppr"
import settings from "./settings"
import { Format } from "./types.d"

const ratios: Record<Format, number> = {
	[Format.Square]: 1,
	[Format.Landscape]: (settings.canvas.shortSide - settings.frame.border * 2) / (settings.canvas.longSide - settings.frame.border * 2),
	[Format.Portrait]: (settings.canvas.longSide - settings.frame.border * 2) / (settings.canvas.shortSide - settings.frame.border * 2),
}

export function initialize(image: HTMLImageElement, format: Format): Croppr {
	return new Croppr(image, {
		aspectRatio: ratios[format],
	})
}

export function updateAspectRatio(croppr: Croppr, format: Format) {
	// @ts-ignore
	croppr.options.aspectRatio = ratios[format]
	croppr.reset()
}
