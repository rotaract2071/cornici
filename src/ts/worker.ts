import overlay from "./overlayer"
import type { OverlayerBatchRequest, OverlayerResponse } from "./types"

addEventListener("message", async (e: MessageEvent<OverlayerBatchRequest>) => {
	const { width, height, images, frame, color, logos } = e.data

	images.forEach(async (imageData) => {
		postMessage({
			id: imageData.id,
			url: (await overlay(
				width,
				height,
				await createImageBitmap(
					await (await fetch(imageData.url)).blob(),
					imageData.x,
					imageData.y,
					imageData.width,
					imageData.height,
				),
				frame,
				color,
				logos,
			)).href,
		} satisfies OverlayerResponse)
	})
})
