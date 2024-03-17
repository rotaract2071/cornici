import type Cropper from "cropperjs";
import { Logo, Ratio } from "./constants";
import { getActualAspectRatio, initialize as initializeCropper } from "./cropper";
import download from "./downloader";
import overlay from "./overlayer";

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
const image = document.querySelector("img");
if (image === null) {
	throw new Error("image element not found");
}

const errorMessage = "Si è verificato un errore! Aggiorna il tuo browser o riprova da PC (ti consigliamo di usare l'ultima versione di Google Chrome).";

let cropper: Cropper | null = null;

imageInput.onchange = async () => {
	if (imageInput.files?.length !== 1) {
		return;
	}
	const ratio = ratioInput.value as Ratio;
	const file = imageInput.files[0];
	if (cropper !== null) {
		cropper.destroy();
	}
	try {
		cropper = await initializeCropper(file, image, ratio);
		applyButton.removeAttribute("disabled");
	} catch (error) {
		alert(errorMessage);
	}
};

ratioInput.onchange = () => {
	if (cropper === null) {
		return;
	}
	cropper.setAspectRatio(getActualAspectRatio(ratioInput.value as Ratio));
};

form.onsubmit = async (e: Event) => {
	e.preventDefault();
	if (cropper === null) {
		return;
	}
	applyButton.setAttribute("aria-busy", "true");
	const ratio = ratioInput.value as Ratio;
	const logo = logoInput.value as Logo | "";
	const croppedCanvas = cropper.getCroppedCanvas();
	try {
		const dataURL = await overlay(croppedCanvas, ratio, logo !== "" ? logo : null);
		if (imageInput.files?.length !== 1) {
			return;
		}
		download(dataURL, imageInput.files[0].name);
		URL.revokeObjectURL(dataURL.href);
	} catch (error) {
		alert(errorMessage);
	}
	applyButton.removeAttribute("aria-busy");
};

form.onreset = () => {
	image.removeAttribute("src");
	if (cropper !== null) {
		cropper.destroy();
	}
	applyButton.toggleAttribute("disabled", true);
};

fieldset.removeAttribute("disabled");