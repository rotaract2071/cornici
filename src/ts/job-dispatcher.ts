import { supportsCreateImageBitmap, supportsOffscreenCanvas, supportsWebWorkers } from "./feature-checker"
import overlay from "./overlayer"
import type { OverlayerBatchRequest, OverlayerResponse } from "./types"
import WorkerPool from "./worker-pool"

const pool = supportsWebWorkers() ? new WorkerPool() : null

export default async function (request: OverlayerBatchRequest): Promise<OverlayerResponse[]> {
	// if (supportsWebWorkers() && supportsCreateImageBitmap() && supportsOffscreenCanvas()) {
	// 	return webWorkerStrategy(request)
	// }
	return legacyStrategy(request)
}

function webWorkerStrategy(request: OverlayerBatchRequest): Promise<OverlayerResponse[]> {
	if (pool === null) {
		return Promise.reject()
	}
	return pool.process(request)
}

function legacyStrategy(request: OverlayerBatchRequest): Promise<OverlayerResponse[]> {
	const { width, height, frame, color, images, logos } = request
	return Promise.all(images.map(async (imageData) => {
		const image = new Image()
		image.src = imageData.url
		await image.decode()
		const canvas = document.createElement("canvas")
		canvas.width = width
		canvas.height = height
		const context = canvas.getContext("2d")!
		context.drawImage(image, imageData.x, imageData.y, imageData.width, imageData.height, 0, 0, width, height)
		const url = canvas.toDataURL()
		const croppedImage = new Image(image.width, image.height)
		croppedImage.src = url
		await croppedImage.decode()
		return {
			id: imageData.id,
			url: (await overlay(
				width,
				height,
				croppedImage,
				frame,
				color,
				logos,
			)).href,
		}
	}))
}
