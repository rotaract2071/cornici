import type Cropper from "cropperjs"
import { initialize as initializeCropper, updateAspectRatio } from "./cropper"
import { ButtonStatus, convertSVGToFrame, generateAnchor, setButtonStatus } from "./dom-utils"
import { fetchFrame, fetchLogo } from "./fetchers"
import overlay from "./overlayer"
import settings from "./settings"
import { Format, Logo } from "./types.d"

const form = document.querySelector("form")!
const fieldset = form.querySelector("fieldset")!
const imagesInput = fieldset.querySelector('input[name="images"]') as HTMLInputElement
const formatInput = fieldset.querySelector('select[name="format"]') as HTMLSelectElement
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
	fieldset.disabled = true
	setButtonStatus(applyButton, ButtonStatus.Busy)
	const format = formatInput.value as Format

	for (const file of imagesInput.files) {
		const image = new Image()
		image.src = URL.createObjectURL(file)
		try {
			await image.decode()
		} catch {
			alert(ERROR_MESSAGE)
			resetCroppers()
			setButtonStatus(applyButton, ButtonStatus.Disabled)
			fieldset.disabled = false
			return
		}
		const container = document.createElement("div")
		container.appendChild(image)
		croppersContainer.appendChild(container)
		croppers.push({ file, cropper: initializeCropper(image, format) })
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
	const [width, height] = ({
		[Format.Landscape]: [settings.canvas.longSide, settings.canvas.shortSide],
		[Format.Portrait]: [settings.canvas.shortSide, settings.canvas.longSide],
		[Format.Square]: [settings.canvas.shortSide, settings.canvas.shortSide],
	} satisfies Record<Format, [number, number]>)[format]

	const frame = convertSVGToFrame(await fetchFrame(format))

	const districtLogo = await fetchLogo(Logo.Distretto)

	const logo = logoInput.value !== "" ? logoInput.value as Logo : null
	const optionalLogo = logo !== null ? await fetchLogo(logo) : null
	const customColor = logo !== null ? settings.colors[logo] : null

	const anchors = await Promise.all(croppers.map(async ({ file, cropper }) => generateAnchor(await overlay(
		width,
		height,
		cropper.getCroppedCanvas(),
		frame,
		districtLogo,
		optionalLogo,
		customColor,
	), file.name.split(".").slice(0, -1).join() + "_con_cornice.png")))

	resetCroppers()
	croppersContainer.append(...anchors)

	setButtonStatus(applyButton, ButtonStatus.Hidden)
})

form.addEventListener("reset", () => {
	resetCroppers()
	setButtonStatus(applyButton, ButtonStatus.Disabled)
})

fieldset.disabled = false
