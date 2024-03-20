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
const imageInput = fieldset.querySelector('input[name="image"]') as HTMLInputElement | null;
if (imageInput === null) {
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

const croppers = new Map<File, Cropper>();

const resetCroppers = () => {
	croppersDiv.innerHTML = "";
	croppers.clear();
}

const errorMessage = "Si è verificato un errore, riprova con Google Chrome.";

imageInput.addEventListener("change", async () => {
	if (imageInput.files?.length === undefined) {
		return;
	}
	resetCroppers();
	const ratio = ratioInput.value as Ratio;

	for (const file of imageInput.files) {
		const wrapper = document.createElement("div");
		const image = document.createElement("img");
		wrapper.appendChild(image);
		croppersDiv.appendChild(wrapper);
		try {
			croppers.set(file, await initializeCropper(file, image, ratio));
		} catch (error) {
			alert(errorMessage);
			resetCroppers();
			return;
		}
	}
});

ratioInput.addEventListener("change", () => {
	for (const cropper of croppers.values()) {
		updateAspectRatio(cropper, ratioInput.value as Ratio);
	}
});

form.addEventListener("submit", async (e) => {
	e.preventDefault();
	if (imageInput.files?.length === undefined) {
		return;
	}

	applyButton.setAttribute("aria-busy", "true");

	const ratio = ratioInput.value as Ratio;
	const logo = logoInput.value !== "" ? logoInput.value as Logo : null;

	const entries = await Promise.all(Array.from(croppers.entries()).map(([file, cropper]) => new Promise(async (resolve) => {
		resolve([file, await overlay(cropper.getCroppedCanvas(), ratio, logo)]);
	}))) as [File, URL][];

	for (const [file, url] of entries) {
		try {
			downloadAndRevoke(url, file.name.split(".").slice(0, -1).join(".") + "_con_cornice.png");
		} catch (error) {
			alert(errorMessage);
		}
	}

	applyButton.removeAttribute("aria-busy");
});

form.addEventListener("reset", resetCroppers);

fieldset.removeAttribute("disabled");
