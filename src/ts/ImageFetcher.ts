import { ImageFormat } from "./constants.d"

const PreferredBitmapFormatKey = 'preferredBitmapFormat'

export default class ImageFetcher {
    #cache: Cache
    static #instance: ImageFetcher

    private constructor() { }

    static async getInstance(): Promise<ImageFetcher> {
        if (!this.#instance) {
            this.#instance = new ImageFetcher()
            this.#instance.#cache = await window.caches.open('images')
        }
        return this.#instance
    }

    async getLogo(logoName: string): Promise<ImageBitmap> {
        try {
            return await this.#getLogoInPreferredFormat(logoName)
        } catch (error) {
            return await this.#getLogoNegotiatingFormat(logoName)
        }
    }

    async getFrame(format: string): Promise<SVGElement> {
        let framePath = `/frames/${format}.svg`;
        try {
            var response = await this.#getFromCache(framePath)
        } catch (error) {
            var response = await this.#fetchAndCache(framePath)
        }
        const svgText = await response.text()
        const frame: SVGElement = (() => {
            const tmp = document.createElement('div')
            tmp.innerHTML = svgText
            return tmp.firstElementChild as SVGElement
        })()
        return frame
    }

    async #getLogoInPreferredFormat(logoName: string): Promise<ImageBitmap> {
        const preferredFormat: string = window.sessionStorage.getItem(PreferredBitmapFormatKey)
        if (!preferredFormat) throw new Error('No preferred format found')
        const logoPath = `/logos/${logoName}.${preferredFormat}`;
        try {
            var response = await this.#getFromCache(logoPath)
        } catch (error) {
            var response = await this.#fetchAndCache(logoPath)
        }
        const imageData = await response.blob()
        return await createImageBitmap(imageData)
    }

    async #getLogoNegotiatingFormat(logoName: string): Promise<ImageBitmap> {
        const formats: ImageFormat[] = [ImageFormat.Jpeg]
        for (const format of formats) {
            const logoPath = `/logos/${logoName}.${format}`;
            let response = await this.#cache.match(logoPath)
            if (!response) {
                response = await fetch(logoPath)
            }
            const responseClone = response.clone()
            const imageData = await response.blob()
            try {
                const imageBitmap = await createImageBitmap(imageData)
                this.#cache.put(logoPath, responseClone)
                window.sessionStorage.setItem(PreferredBitmapFormatKey, format)
                return imageBitmap
            } catch (error) { }
        }
    }

    async #getFromCache(request: RequestInfo): Promise<Response> {
        let response = await this.#cache.match(request)
        if (!response) throw new Error()
        return response
    }

    async #fetchAndCache(request: RequestInfo): Promise<Response> {
        let response = await fetch(request)
        this.#cache.put(request, response.clone())
        return response
    }
}