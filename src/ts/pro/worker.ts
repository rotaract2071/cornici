import { fetchLogo } from "./fetchers"
import overlay from "./overlayer"
import settings from "./settings"
import { Logo, type WorkerResponse, type WorkerRequest } from "./types.d"

addEventListener("message", async (e) => {
    const { frame, images, logo } = e.data as WorkerRequest
    const districtLogo = await fetchLogo(Logo.Distretto)
    const logoImage = logo !== null ? await fetchLogo(logo) : null
    const customColor = logo !== null ? settings.colors[logo] : null
    const response = await Promise.all(images.map(async ({ file, bitmap }) => {
        return {
            filename: file.name,
            url: await overlay(bitmap, frame, districtLogo, logoImage, customColor),
        }
    })) satisfies WorkerResponse
    postMessage(response)
})
