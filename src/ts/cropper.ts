import CropperLib from "cropperjs";
import { Ratio } from "./constants.d";

export async function initialize(file: File, image: HTMLImageElement, ratio: Ratio): Promise<CropperLib> {
	return new Promise((resolve) => {
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			image.src = fileReader.result as string;
			const cropper = new CropperLib(image, {
				zoomable: false,
				viewMode: 2,
				responsive: false,
				background: false,
			});
			updateAspectRatio(cropper, ratio);
			resolve(cropper);
		};
		fileReader.readAsDataURL(file);
	});
}

export function updateAspectRatio(cropper: CropperLib, ratio: Ratio) {
	cropper.setAspectRatio({
		[Ratio.Square]: 1,
		[Ratio.Landscape]: 3/2,
		[Ratio.Portrait]: 2/3,
	}[ratio]);
}