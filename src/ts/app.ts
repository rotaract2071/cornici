import type Cropper from "cropperjs"
import { initialize as initializeCropper, updateAspectRatio } from "./cropper"
import { ButtonStatus, generateAnchor, setButtonStatus } from "./dom-utils"
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
const imagesContainer = document.getElementById("images") as HTMLDivElement

const images = new Array<{ file: File, url: URL, cropper: Cropper }>()

function clearImages() {
	imagesContainer.innerHTML = ""
	for (const { url } of images) {
		URL.revokeObjectURL(url.href)
	}
	images.length = 0
}

imagesInput.addEventListener("change", async () => {
	clearImages()
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
		const container = document.createElement("div")
		container.appendChild(image)
		imagesContainer.appendChild(container)
		images.push({ file, url, cropper: initializeCropper(image, format) })
	}
	setButtonStatus(applyButton, ButtonStatus.Enabled)
	fieldset.disabled = false
})

formatInput.addEventListener("change", () => {
	for (const { cropper } of images) {
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
	const logo = logoInput.value !== "" ? logoInput.value as Logo : null
	const [frame, districtLogo, optionalLogo] = await Promise.all([
		fetchFrame(format),
		fetchLogo(Logo.Distretto),
		logo !== null ? fetchLogo(logo) : null,
	])
	const logos = [districtLogo]
	if (optionalLogo !== null) {
		logos.push(optionalLogo)
	}

	const anchors = await Promise.all(images.map(async ({ file, cropper }) => generateAnchor(await overlay(
		width,
		height,
		cropper.getCroppedCanvas(),
		frame,
		logo !== null ? settings.colors[logo] : null,
		logos,
	), file.name.split(".").slice(0, -1).join() + "_con_cornice.png")))

	clearImages()
	imagesContainer.append(...anchors)

	setButtonStatus(applyButton, ButtonStatus.Hidden)
})

form.addEventListener("reset", () => {
	clearImages()
	setButtonStatus(applyButton, ButtonStatus.Disabled)
})

fieldset.disabled = false
