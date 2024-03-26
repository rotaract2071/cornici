import type Croppr from "croppr"
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

const croppers = new Array<{ file: File, url: URL, cropper: Croppr }>()
const worker = new Worker("worker-6QFWWSKU.js")

function resetCroppers() {
	croppersContainer.innerHTML = ""
	for (const { url } of croppers) {
		URL.revokeObjectURL(url.href)
	}
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
		const image = new Image()
		const url = new URL(URL.createObjectURL(file))
		image.src = url.href
		croppersContainer.appendChild(image)
		croppers.push({ file, url, cropper: initializeCropper(image, format) })
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
			const { x, y, width, height } = cropper.getValue()
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

worker.addEventListener("message", (e) => {
	const data = e.data as WorkerResponse

	const anchors = data.map(({ url, filename }) => generateAnchor(new URL(url), filename))

	resetCroppers()
	croppersContainer.append(...anchors)

	setButtonStatus(applyButton, ButtonStatus.Hidden)
})

form.addEventListener("reset", () => {
	resetCroppers()
	setButtonStatus(applyButton, ButtonStatus.Disabled)
})

fieldset.disabled = false
