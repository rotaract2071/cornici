import type Cropper from "cropperjs"
import { initialize as initializeCropper, updateAspectRatio } from "./cropper"
import { ButtonStatus, convertSVGToFrame, generateAnchor, setButtonStatus } from "./dom-utils"
import { fetchFrame } from "./fetchers"
import type { Format, Logo, WorkerRequest, WorkerResponse } from "./types.d"

const form = document.querySelector("form")!
const fieldset = form.querySelector("fieldset")!
const imagesInput = fieldset.querySelector('input[name="images"]') as HTMLInputElement
const formatInput = fieldset.querySelector('select[name="format"]') as HTMLSelectElement
const logoInput = fieldset.querySelector('select[name="logo"]') as HTMLSelectElement
const applyButton = form.querySelector("button")!
const croppersContainer = document.getElementById("croppers") as HTMLDivElement

const croppers = new Array<{ file: File, url: URL, cropper: Cropper }>()
const worker = new Worker("worker-3KKM3KKO.js")

worker.addEventListener("message", async (e) => {
	const data = e.data as WorkerResponse

	const anchors = await Promise.all(data.map(({ url, filename }) => generateAnchor(new URL(url), filename)))

	resetCroppers()
	croppersContainer.append(...anchors)

	setButtonStatus(applyButton, ButtonStatus.Hidden)
})

function resetCroppers() {
	for (const { cropper } of croppers) {
		cropper.destroy()
	}
	croppersContainer.innerHTML = ""
	croppers.length = 0
}

const ERROR_MESSAGE = "Si è verificato un errore, riprova con Google Chrome da PC o Android."

imagesInput.addEventListener("change", async () => {
	resetCroppers()
	setButtonStatus(applyButton, ButtonStatus.Disabled)
	if (!imagesInput.files?.length) {
		return
	}
	fieldset.disabled = true
	setButtonStatus(applyButton, ButtonStatus.Busy)
	const format = formatInput.value as Format

	for (const file of imagesInput.files) {
		const container = document.createElement("div")
		const image = new Image()
		container.appendChild(image)
		croppersContainer.appendChild(container)
		try {
			const url = new URL(URL.createObjectURL(file))
			image.src = url.href
			await image.decode()
			const cropper = await initializeCropper(image, format)
			croppers.push({ file, url, cropper })
		} catch (error) {
			alert(ERROR_MESSAGE)
			resetCroppers()
			setButtonStatus(applyButton, ButtonStatus.Disabled)
			fieldset.disabled = false
			return
		}
	}
	setButtonStatus(applyButton, ButtonStatus.Clickable)
	fieldset.disabled = false
})

formatInput.addEventListener("change", () => {
	for (const { cropper } of croppers) {
		updateAspectRatio(cropper, formatInput.value as Format)
	}
})

form.addEventListener("submit", async (e) => {
	e.preventDefault()
	setButtonStatus(applyButton, ButtonStatus.Busy)

	const format = formatInput.value as Format

	const frameSVG = await fetchFrame(format)
	const frame = convertSVGToFrame(frameSVG)

	const logo = logoInput.value !== "" ? logoInput.value as Logo : null

	worker.postMessage({
		format,
		images: croppers.map(({ file, url, cropper }) => {
			const { x, y, width, height } = cropper.getData(true)
			return {
				filename: file.name,
				url: url.href,
				x,
				y,
				width,
				height,
			}
		}),
		frame,
		logo,
	} satisfies WorkerRequest)
})

form.addEventListener("reset", () => {
	resetCroppers()
	setButtonStatus(applyButton, ButtonStatus.Disabled)
})

fieldset.disabled = false
