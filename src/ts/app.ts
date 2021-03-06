import { Ratio, Logo } from "./constants";
import VersionChecker from "./VersionChecker";
import Cropper from "./Cropper";
import Frame from "./Frame";
import Overlayer from "./Overlayer";
import Downloader from "./Downloader";

VersionChecker.check();

const form = document.getElementById("upload-form") as HTMLFormElement;
const imageInput = document.getElementById("image-input") as HTMLInputElement;
const logoInput = document.getElementById("logo") as HTMLInputElement;
const ratioInput = document.getElementById("ratio") as HTMLInputElement;
const image = document.getElementById("image") as HTMLImageElement;
const fileName = document.querySelector(".file-name") as HTMLSpanElement;
const applyButton = document.getElementById("apply") as HTMLButtonElement;

const errorMessage =
	"Si è verificato un errore! Aggiorna il tuo browser o riprova da PC (ti consigliamo di usare l'ultima versione di Google Chrome).";

imageInput.onchange = async () => {
	if (imageInput.files.length === 0) return;
	fileName.innerText = imageInput.files[0].name;
	const ratio = ratioInput.value as Ratio;
	const file = imageInput.files[0];
	try {
		await Cropper.initialize(file, image, ratio);
	} catch (error) {
		alert(errorMessage);
		return;
	}
	applyButton.removeAttribute("disabled");
};

ratioInput.onchange = () => {
	const ratio: Ratio = ratioInput.value as Ratio;
	Cropper.setAspectRatio(ratio);
};

form.onsubmit = async (e: Event) => {
	e.preventDefault();
	applyButton.classList.add("is-loading");
	const ratio = ratioInput.value as Ratio;
	const logo = logoInput.value as Logo;
	const croppedCanvas = Cropper.croppedCanvas;
	const frame = new Frame(ratio, logo);
	const overlayer = new Overlayer(croppedCanvas, frame);
	try {
		await overlayer.overlay();
	} catch (error) {
		alert(errorMessage);
		return;
	}
	applyButton.classList.remove("is-loading");
	const dataURL = overlayer.imageAsDataURL;
	const file = imageInput.files[0];
	Downloader.download(dataURL, file);
};
