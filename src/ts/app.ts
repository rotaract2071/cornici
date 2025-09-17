import type Cropper from "cropperjs"
import { initialize as initializeCropper, updateAspectRatio } from "./cropper"
import { ButtonStatus, generateAnchor, setButtonStatus } from "./dom-utils"
import { fetchFrame, fetchLogo } from "./fetchers"
import dispatchJob from "./job-dispatcher"
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
	for (const { cropper, url } of images) {
		cropper.destroy()
		URL.revokeObjectURL(url.href)
	}
	imagesContainer.innerHTML = ""
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

	const responses = await dispatchJob({
		width,
		height,
		images: images.map(({ url, cropper }, index) => {
			const { x, y, width, height } = cropper.getData()
			return {
				id: index,
				url: url.href,
				x,
				y,
				width,
				height,
			}
		}),
		frame,
		color: logo !== null ? settings.colors[logo] : null,
		logos,
	})
	const anchors = responses.map(({ url }, index) => generateAnchor(new URL(url), images[index].file.name.split(".").slice(0, -1).join("") + "_con_cornice.png"))

	clearImages()
	imagesContainer.append(...anchors)

	setButtonStatus(applyButton, ButtonStatus.Hidden)
})

form.addEventListener("reset", () => {
	clearImages()
	setButtonStatus(applyButton, ButtonStatus.Disabled)
})

fieldset.disabled = false

const html = document.documentElement;
const toggleButton = document.getElementById("theme-toggle-button") as HTMLButtonElement;
const toggleIconElement = document.getElementById("theme-toggle-icon");
if (!toggleIconElement) {
  throw new Error("Elemento con id 'theme-toggle-icon' non trovato");
}
const toggleIcon = toggleIconElement as unknown as SVGSVGElement;

function setTheme(theme: "light" | "dark") {
	html.setAttribute("data-theme", theme);
	localStorage.setItem("theme", theme);
	updateIcon(theme);
}

function updateIcon(theme: "dark" | "light") {
	toggleIcon.innerHTML = theme === "dark"
		// Moon
		? `<path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79z"></path>`
		// Sun
		: `<circle cx="12" cy="12" r="5"></circle>
		   <line x1="12" y1="1" x2="12" y2="3"></line>
		   <line x1="12" y1="21" x2="12" y2="23"></line>
		   <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
		   <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
		   <line x1="1" y1="12" x2="3" y2="12"></line>
		   <line x1="21" y1="12" x2="23" y2="12"></line>
		   <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
		   <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
}

toggleButton.addEventListener("click", () => {
	const current = html.getAttribute("data-theme") === "dark" ? "dark" : "light";
	const newTheme = current === "dark" ? "light" : "dark";
	setTheme(newTheme);
});

window.addEventListener("DOMContentLoaded", () => {
	const savedTheme = localStorage.getItem("theme");
	const theme = savedTheme === "light" || savedTheme === "dark"
		? savedTheme
		: "dark";

	setTheme(theme);
});
