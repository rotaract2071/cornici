import CropperLib from "cropperjs";
import { Ratio } from "./constants.d";

export default abstract class Cropper {
	static #cropper?: CropperLib;

	static async initialize(
		file: File,
		image: HTMLImageElement,
		ratio: Ratio,
	): Promise<boolean> {
		return new Promise((resolve) => {
			if (this.#cropper) this.#cropper.destroy();
			const fileReader = new FileReader();
			fileReader.onload = (e) => {
				image.src = e.target.result as string;
				this.#cropper = new CropperLib(image, {
					zoomable: false,
					viewMode: 3,
					responsive: false,
				});
				this.setAspectRatio(ratio);
				resolve(true);
			};
			fileReader.readAsDataURL(file);
		});
	}

	static setAspectRatio(ratio: Ratio) {
		if (this.#cropper) {
			this.#cropper.setAspectRatio(this.#getActualRatio(ratio));
		}
	}

	static #getActualRatio(ratio: Ratio): number {
		switch (ratio) {
			case Ratio.Square:
				return 1;
			case Ratio.Landscape:
				return 3 / 2;
			case Ratio.Portrait:
				return 2 / 3;
		}
	}

	static get croppedCanvas(): HTMLCanvasElement {
		return this.#cropper.getCroppedCanvas();
	}
}
