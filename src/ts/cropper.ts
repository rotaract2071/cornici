import Cropper from "cropperjs";
import settings from "./settings";
import { Ratio } from "./types.d";

const ratios: Record<Ratio, number> = {
	[Ratio.Square]: 1,
	[Ratio.Landscape]: (settings.canvas.longSide - settings.frame.border * 2) / (settings.canvas.shortSide - settings.frame.border * 2),
	[Ratio.Portrait]: (settings.canvas.shortSide - settings.frame.border * 2) / (settings.canvas.longSide - settings.frame.border * 2),
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