import type Cropper from "cropperjs"
import { Status as ButtonStatus, setStatus as setButtonStatus } from "./button"
import { initialize as initializeCropper, updateAspectRatio } from "./cropper"
import generateAnchor from "./downloader"
import overlay from "./overlayer"
import type { Logo, Ratio } from "./types"

const form = document.querySelector("form")!
const fieldset = form.querySelector("fieldset")!
const imagesInput = fieldset.querySelector('input[name="images"]') as HTMLInputElement
const ratioInput = fieldset.querySelector('select[name="ratio"]') as HTMLSelectElement
const logoInput = fieldset.querySelector('select[name="logo"]') as HTMLSelectElement
const applyButton = form.querySelector("button")!
const croppersContainer = document.getElementById("croppers") as HTMLDivElement

const croppers = new Array<{ file: File, cropper: Cropper }>()

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
	setButtonStatus(applyButton, ButtonStatus.Busy)
	const ratio = ratioInput.value as Ratio

	for (const file of imagesInput.files) {
		const container = document.createElement("div")
		const image = new Image()
		container.appendChild(image)
		croppersContainer.appendChild(container)
		try {
			const cropper = await initializeCropper(file, image, ratio)
			croppers.push({ file, cropper })
		} catch (error) {
			alert(ERROR_MESSAGE)
			resetCroppers()
			setButtonStatus(applyButton, ButtonStatus.Disabled)
			return
		}
	}
	setButtonStatus(applyButton, ButtonStatus.Clickable)
})

ratioInput.addEventListener("change", () => {
	for (const { cropper } of croppers) {
		updateAspectRatio(cropper, ratioInput.value as Ratio)
	}
})

form.addEventListener("submit", async (e) => {
	e.preventDefault()
	setButtonStatus(applyButton, ButtonStatus.Busy)

	const ratio = ratioInput.value as Ratio
	const logo = logoInput.value !== "" ? logoInput.value as Logo : null

	const anchors = await Promise.all(croppers.map(async ({ file, cropper }) => generateAnchor(await overlay(cropper.getCroppedCanvas(), ratio, logo), file.name.split(".").slice(0, -1).join() + "_con_cornice.png")))

	resetCroppers()
	croppersContainer.append(...anchors)

	setButtonStatus(applyButton, ButtonStatus.Hidden)
})

form.addEventListener("reset", () => {
	resetCroppers()
	setButtonStatus(applyButton, ButtonStatus.Disabled)
})

fieldset.disabled = false
