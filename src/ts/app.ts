import { Ratio, Logo } from "./constants";
import { initialize, getActualAspectRatio } from "./cropper";
import { overlay } from "./overlayer";
import { download } from "./downloader";
import type Cropper from "cropperjs";

const form = document.querySelector("form");
const fieldset = form.querySelector("fieldset");
const imageInput = fieldset.querySelector('input[name="image"]') as HTMLInputElement;
const ratioInput = fieldset.querySelector('select[name="ratio"]') as HTMLSelectElement;
const logoInput = fieldset.querySelector('select[name="logo"]') as HTMLSelectElement;
const applyButton = form.querySelector("button");
const image = document.querySelector("img");

const errorMessage = "Si è verificato un errore! Aggiorna il tuo browser o riprova da PC (ti consigliamo di usare l'ultima versione di Google Chrome).";

let cropper: Cropper = null;

imageInput.onchange = async () => {
	if (imageInput.files.length === 0) return;
	const ratio = ratioInput.value as Ratio;
	const file = imageInput.files[0];
	try {
		if (cropper !== null) {
			cropper.destroy();
		}
		cropper = await initialize(file, image, ratio);
	} catch (error) {
		alert(errorMessage);
		return;
	}
	applyButton.removeAttribute("disabled");
};

ratioInput.onchange = () => {
	cropper.setAspectRatio(getActualAspectRatio(ratioInput.value as Ratio));
};

form.onsubmit = async (e: Event) => {
	e.preventDefault();
	applyButton.setAttribute("aria-busy", "true");
	const ratio = ratioInput.value as Ratio;
	const logo = logoInput.value as Logo;
	const croppedCanvas = cropper.getCroppedCanvas();
	try {
		const dataURL = await overlay(croppedCanvas, ratio, logo);
		applyButton.removeAttribute("aria-busy");
		const file = imageInput.files[0];
		download(dataURL, file);
	} catch (error) {
		alert(errorMessage);
	}
};

form.onreset = () => {
	image.removeAttribute("src");
	cropper.destroy();
	applyButton.toggleAttribute("disabled", true);
};

fieldset.removeAttribute("disabled");