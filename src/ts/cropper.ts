import Cropper from "cropperjs"
import settings from "./settings"
import { Format } from "./types.d"

const ratios: Record<Format, number> = {
	[Format.Square]: 1,
	[Format.Landscape]: (settings.canvas.longSide - settings.frame.border * 2) / (settings.canvas.shortSide - settings.frame.border * 2),
	[Format.Portrait]: (settings.canvas.shortSide - settings.frame.border * 2) / (settings.canvas.longSide - settings.frame.border * 2),
}

export function initialize(image: HTMLImageElement, format: Format): Cropper {
	return new Cropper(image, {
		zoomable: false,
		viewMode: 2,
		responsive: false,
		background: false,
		aspectRatio: ratios[format],
	})
}

export function updateAspectRatio(cropper: Cropper, format: Format) {
	cropper.setAspectRatio(ratios[format])
}
