import Cropper from "cropperjs";
import { Ratio } from "./constants.d";

const ratios: Record<Ratio, number> = {
	[Ratio.Square]: 1,
	[Ratio.Landscape]: 3 / 2,
	[Ratio.Portrait]: 2 / 3,
};

export async function initialize(file: File, image: HTMLImageElement, ratio: Ratio): Promise<Cropper> {
	return new Promise((resolve) => {
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			image.src = fileReader.result as string;
			const cropper = new Cropper(image, {
				zoomable: false,
				viewMode: 2,
				responsive: false,
				background: false,
				aspectRatio: ratios[ratio],
			});
			resolve(cropper);
		};
		fileReader.readAsDataURL(file);
	});
}

export function updateAspectRatio(cropper: Cropper, ratio: Ratio) {
	cropper.setAspectRatio(ratios[ratio]);
}