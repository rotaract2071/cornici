import { supportsCreateImageBitmap, supportsOffscreenCanvas, supportsWebWorkers } from "./feature-checker"
import overlay from "./overlayer"
import type { OverlayerBatchRequest, OverlayerResponse } from "./types"
import WorkerPool from "./worker-pool"

const pool = supportsWebWorkers() ? new WorkerPool() : null

export default async function (request: OverlayerBatchRequest): Promise<OverlayerResponse[]> {
	if (supportsWebWorkers() && supportsCreateImageBitmap() && supportsOffscreenCanvas()) {
		return webWorkerStrategy(request)
	}
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
		return {
			id: imageData.id,
			url: (await overlay(
				width,
				height,
				image,
				frame,
				color,
				logos,
			)).href,
		}
	}))
}
