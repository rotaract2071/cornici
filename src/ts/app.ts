import type Cropper from "cropperjs"
import { initialize as initializeCropper, updateAspectRatio } from "./cropper"
import downloadAndRevoke from "./downloader"
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

const resetCroppers = () => {
	croppersContainer.innerHTML = ""
	croppers.length = 0
}

const ERROR_MESSAGE = "Si è verificato un errore, riprova con Google Chrome da PC o Android."

imagesInput.addEventListener("change", async () => {
	if (imagesInput.files?.length === undefined) {
		return
	}
	resetCroppers()
	const ratio = ratioInput.value as Ratio

	for (const file of imagesInput.files) {
		const wrapper = document.createElement("div")
		const image = new Image()
		wrapper.appendChild(image)
		croppersContainer.appendChild(wrapper)
		try {
			const cropper = await initializeCropper(file, image, ratio)
			croppers.push({ file, cropper })
		} catch (error) {
			alert(ERROR_MESSAGE)
			resetCroppers()
			return
		}
	}
})

ratioInput.addEventListener("change", () => {
	for (const { cropper } of croppers) {
		updateAspectRatio(cropper, ratioInput.value as Ratio)
	}
})

form.addEventListener("submit", async (e) => {
	e.preventDefault()
	if (imagesInput.files?.length === undefined) {
		return
	}

	applyButton.disabled = true
	applyButton.ariaBusy = "true"

	const ratio = ratioInput.value as Ratio
	const logo = logoInput.value !== "" ? logoInput.value as Logo : null

	try {
		for (const { file, cropper } of croppers) {
			const url = await overlay(cropper.getCroppedCanvas(), ratio, logo)
			downloadAndRevoke(url, file.name.split(".").slice(0, -1).join(".") + "_con_cornice.png")
		}
	} catch (error) {
		alert(ERROR_MESSAGE)
	}

	applyButton.ariaBusy = "false"
	applyButton.disabled = false
})

form.addEventListener("reset", resetCroppers)

fieldset.disabled = false
