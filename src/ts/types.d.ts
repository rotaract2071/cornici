export const enum Format {
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
	paths: {
		definition: string,
		fill: string,
		customizable: boolean,
	}[],
}
