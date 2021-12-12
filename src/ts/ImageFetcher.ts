import { ImageFormat } from "./constants.d"
import ImageFormatNegotiator from "./ImageFormatNegotiator";

const PreferredBitmapFormatKey = 'preferredBitmapFormat'

export default class ImageFetcher {
	#cache?: Cache
	static #instance: ImageFetcher

	private constructor() { }

	static async getInstance(): Promise<ImageFetcher> {
		if (!this.#instance) {
			this.#instance = new ImageFetcher()
			this.#instance.#cache = (await window?.caches.open('images')) || null
		}
		return this.#instance
	}

	/**
	 * Picks the right strategy to retrieve the image and builds a canvas-usable
	 * in-memory representation.
	 * 
	 * @param {string} logoName The name of the logo to retrieve.
	 * @returns {ImageBitmap | HTMLImageElement} The constructed image.
	 */
	async getLogo(logoName: string): Promise<ImageBitmap | HTMLImageElement> {
		await this.#negotiateFormat()
		return await this.#getLogoInPreferredFormat(logoName)
	}

	async getFrame(format: string): Promise<SVGElement> {
		let framePath = `/frames/${format}.svg`;
		try {
			return this.#createSVG(await this.#getFromCache(framePath))
		} catch (error) {
			return this.#createSVG(await this.#fetchAndCache(framePath))
		}
	}

	async #negotiateFormat() {
		if (window.sessionStorage.getItem(PreferredBitmapFormatKey)) return
		if (await ImageFormatNegotiator.supportsAvif()) {
			window.sessionStorage.setItem(PreferredBitmapFormatKey, ImageFormat.Avif)
			return
		}
		if (ImageFormatNegotiator.supportsWebp()) {
			window.sessionStorage.setItem(PreferredBitmapFormatKey, ImageFormat.Webp)
			return
		}
		window.sessionStorage.setItem(PreferredBitmapFormatKey, ImageFormat.Jpeg)
	}

	async #getLogoInPreferredFormat(logoName: string): Promise<ImageBitmap | HTMLImageElement> {
		const preferredFormat = window.sessionStorage.getItem(PreferredBitmapFormatKey)
		if (!preferredFormat) throw new Error('No preferred format found')
		const logoPath = `/logos/${logoName}.${preferredFormat}`;
		try {
			return this.#createImage(await this.#getFromCache(logoPath))
		} catch (error) {
			return this.#createImage(await this.#fetchAndCache(logoPath))
		}
	}

	/**
	 * Tries to retrieve the request from the cache. If the Cache API is not supported
	 * or a cache miss occurs, an Error is thrown.
	 * 
	 * @param {RequestInfo} request The request to retrieve from the cache.
	 * @returns {Promise<Response>} The cached response.
	 * @throws {Error} Throws an Error if the Cache API is not supported or a cache miss occurs.
	 */
	async #getFromCache(request: RequestInfo): Promise<Response> {
		if (!this.#cache) throw new Error('Cache is not available!')
		const response = await this.#cache.match(request)
		if (!response) throw new Error('Cache miss')
		return response
	}

	/**
	 * Fetches the request and, if Cache API is supported, caches the response.
	 * 
	 * @param {RequestInfo} request The request to fetch.
	 * @returns {Promise<Response>} The fetched response.
	 */
	async #fetchAndCache(request: RequestInfo): Promise<Response> {
		const response = await fetch(request)
		this.#cache?.put(request, response.clone())
		return response
	}

	async #createImage(response: Response): Promise<ImageBitmap | HTMLImageElement> {
		const imageData = await response.clone().blob()
		if (window.hasOwnProperty('createImageBitmap')) {
			return await createImageBitmap(imageData)
		}
		const image = new Image()
		image.src = await (async (blob: Blob): Promise<string> => {
			return new Promise(resolve => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result as string);
				reader.readAsDataURL(blob);
			})
		})(imageData)
		await new Promise(resolve => image.onload = resolve);
		return image

	}

	async #createSVG(response: Response): Promise<SVGElement> {
		const svgText = await response.text()
		const frame: SVGElement = (() => {
			const tmp = document.createElement('div')
			tmp.innerHTML = svgText
			return tmp.firstElementChild as SVGElement
		})()
		return frame
	}
}
