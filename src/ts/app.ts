import type Cropper from "cropperjs";
import { initialize as initializeCropper, updateAspectRatio } from "./cropper";
import downloadAndRevoke from "./downloader";
import overlay from "./overlayer";
import { Logo, Ratio } from "./types";

const form = document.querySelector("form");
if (form === null) {
	throw new Error("form element not found");
}
const fieldset = form.querySelector("fieldset");
if (fieldset === null) {
	throw new Error("fieldset element not found");
}
const imagesInput = fieldset.querySelector('input[name="images"]') as HTMLInputElement | null;
if (imagesInput === null) {
	throw new Error("image input not found");
}
const ratioInput = fieldset.querySelector('select[name="ratio"]') as HTMLSelectElement | null;
if (ratioInput === null) {
	throw new Error("ratio input not found");
}
const logoInput = fieldset.querySelector('select[name="logo"]') as HTMLSelectElement | null;
if (logoInput === null) {
	throw new Error("logo input not found");
}
const applyButton = form.querySelector("button");
if (applyButton === null) {
	throw new Error("submit button not found");
}
const croppersDiv = document.querySelector(".croppers") as HTMLDivElement | null;
if (croppersDiv === null) {
	throw new Error("croppers div not found");
}

const croppers = new Array<{ file: File, cropper: Cropper }>();

const resetCroppers = () => {
	croppersDiv.innerHTML = "";
	croppers.length = 0;
}

const errorMessage = "Si è verificato un errore, riprova con Google Chrome.";

imagesInput.addEventListener("change", async () => {
	if (imagesInput.files?.length === undefined) {
		return;
	}
	resetCroppers();
	const ratio = ratioInput.value as Ratio;

	for (const file of imagesInput.files) {
		const wrapper = document.createElement("div");
		const image = document.createElement("img");
		wrapper.appendChild(image);
		croppersDiv.appendChild(wrapper);
		try {
			const cropper = await initializeCropper(file, image, ratio);
			croppers.push({ file, cropper })
		} catch (error) {
			alert(errorMessage);
			resetCroppers();
			return;
		}
	}
});

ratioInput.addEventListener("change", () => {
	for (const { cropper } of croppers) {
		updateAspectRatio(cropper, ratioInput.value as Ratio);
	}
});

form.addEventListener("submit", async (e) => {
	e.preventDefault();
	if (imagesInput.files?.length === undefined) {
		return;
	}

	applyButton.setAttribute("aria-busy", "true");

	const ratio = ratioInput.value as Ratio;
	const logo = logoInput.value !== "" ? logoInput.value as Logo : null;

	const results = await Promise.all(croppers.map(({ file, cropper }) => new Promise(async (resolve) => {
		resolve({ originalFilename: file.name, url: await overlay(cropper.getCroppedCanvas(), ratio, logo) });
	}))) as { originalFilename: string, url: URL }[];

	for (const { originalFilename, url } of results) {
		try {
			downloadAndRevoke(url, originalFilename.split(".").slice(0, -1).join(".") + "_con_cornice.png");
		} catch (error) {
			alert(errorMessage);
		}
	}

	applyButton.removeAttribute("aria-busy");
});

form.addEventListener("reset", resetCroppers);

fieldset.removeAttribute("disabled");
