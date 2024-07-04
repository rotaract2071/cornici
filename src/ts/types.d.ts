export const enum Format {
	Landscape = "landscape",
	Portrait = "portrait",
	Square = "square",
}

export const enum Logo {
	AzioneInterna = "azione-interna",
	AzioneInteressePubblico = "azione-interesse-pubblico",
	AzioneInternazionale = "azione-internazionale",
	AzioneNuoveGenerazioni = "azione-nuove-generazioni",
	AzioneProfessionale = "azione-professionale",
	Cultura = "cultura",
	Distretto = "distretto",
	Doc = "doc",
	Etruria = "etruria",
	Galileo = "galileo",
	Magnifico = "magnifico",
	Montalbano = "montalbano",
	Sport = "sport",
	Tirreno = "tirreno",
}

export interface Frame {
	paths: {
		definition: string,
		fill: string,
		customizable: boolean,
	}[],
}

export interface ImageData {
	id: number,
	url: string,
	x: number,
	y: number,
	width: number,
	height: number,
}

export interface OverlayerBatchRequest {
	width: number,
	height: number,
	images: ImageData[],
	frame: Frame,
	color: string | null,
	logos: (ImageBitmap | HTMLImageElement)[],
}

export interface OverlayerResponse {
	id: number,
	url: string,
}
