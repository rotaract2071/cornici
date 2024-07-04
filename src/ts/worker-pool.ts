import type { ImageData, OverlayerBatchRequest, OverlayerResponse } from "./types"

export default class {
	#workers: Worker[]

	constructor() {
		this.#workers = new Array(navigator.hardwareConcurrency)
		for (let i = 0; i < this.#workers.length; ++i) {
			this.#workers[i] = new Worker(new URL("worker?worker", import.meta.url))
		}
	}

	/**
	 * Distribute the request among workers and resolve when all images have been processed.
	 */
	async process(request: OverlayerBatchRequest): Promise<OverlayerResponse[]> {
		// Distribute images among workers in a round-robin fashion
		const map = new Map<Worker, ImageData[]>(this.#workers.map((worker) => [worker, []]))
		for (const [index, image] of request.images.entries()) {
			map.get(this.#workers[index % this.#workers.length])!.push(image)
		}

		const resolvers = new Array<(response: OverlayerResponse) => void>(request.images.length)
		const promises = request.images.map((imageData) => new Promise<OverlayerResponse>((resolver) => {
			resolvers[imageData.id] = resolver
		}))
		function resolve(e: MessageEvent<OverlayerResponse>) {
			resolvers[e.data.id](e.data)
		}
		for (const [worker, images] of map.entries()) {
			if (images.length === 0) {
				continue
			}
			worker.onmessage = resolve
			worker.postMessage({ ...request, images } satisfies OverlayerBatchRequest)
		}
		return Promise.all(promises)
	}
}