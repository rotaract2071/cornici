export const enum Ratio {
	Landscape = "landscape",
	Portrait = "portrait",
	Square = "square",
}

export const enum Logo {
	Distretto = "distretto",
	Doc = "doc",
	Etruria = "etruria",
	Galileo = "galileo",
	Magnifico = "magnifico",
	Montalbano = "montalbano",
	Tirreno = "tirreno",
}

export interface Frame {
	ratio: Ratio,
	paths: {
		definition: string,
		fill: string,
		customizable: boolean,
	}[],
}

export interface WorkerRequest {
	images: {
		file: File,
		bitmap: ImageBitmap,
	}[],
	frame: Frame,
	logo: Logo | null,
}

export type WorkerResponse = {
	filename: string,
	url: string,
}[]
