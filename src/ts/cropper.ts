import CropperLib from "cropperjs";
import { Ratio } from "./constants.d";

export async function initialize(file: File, image: HTMLImageElement, ratio: Ratio): Promise<CropperLib> {
	return new Promise((resolve) => {
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			image.src = e.target.result as string;
			const cropper = new CropperLib(image, {
				zoomable: false,
				viewMode: 3,
				responsive: false,
			});
			cropper.setAspectRatio(getActualAspectRatio(ratio));
			resolve(cropper);
		};
		fileReader.readAsDataURL(file);
	});
}

export function getActualAspectRatio(ratio: Ratio): number {
	return {
		[Ratio.Square]: 1,
		[Ratio.Landscape]: 3/2,
		[Ratio.Portrait]: 2/3,
	}[ratio];
}
