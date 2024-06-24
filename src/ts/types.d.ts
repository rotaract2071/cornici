export const enum Format {
	Landscape = "landscape",
	Portrait = "portrait",
	Square = "square",
}

export const enum Logo {
	AzioneInteressePubblico = "azione-interesse-pubblico",
	AzioneNuoveGenerazioni = "azione-nuove-generazioni",
	AzioneProfessionale = "azione-professionale",
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
