import { fetchLogo } from "./fetchers"
import overlay from "./overlayer"
import settings from "./settings"
import { Format, Logo, WorkerResponse, type WorkerRequest } from "./types.d"

addEventListener("message", async (e) => {
    const { format, frame, logo, images } = e.data as WorkerRequest
    const [width, height] = ({
        [Format.Landscape]: [settings.canvas.longSide, settings.canvas.shortSide],
        [Format.Portrait]: [settings.canvas.shortSide, settings.canvas.longSide],
        [Format.Square]: [settings.canvas.shortSide, settings.canvas.shortSide],
    } satisfies Record<Format, [number, number]>)[format]

    const districtLogo = await fetchLogo(Logo.Distretto)
    const optionalLogo = logo !== null ? await fetchLogo(logo) : null
    const customColor = logo !== null ? settings.colors[logo] : null

    const response = await Promise.all(images.map(async (imageData) => {
        const image = await createImageBitmap(
            await (await fetch(imageData.url)).blob(),
            imageData.x,
            imageData.y,
            imageData.width,
            imageData.height,
        )
        return {
            filename: imageData.filename.split(".").slice(0, -1).join("") + "_con_cornice.png",
            url: (await overlay(
                width,
                height,
                image,
                frame,
                districtLogo,
                optionalLogo,
                customColor,
            )).href,
        }
    })) satisfies WorkerResponse
    postMessage(response)
})