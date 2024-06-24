import { Format, Logo } from "./types.d"

export default {
	canvas: {
		shortSide: 1080,
		longSide: 1620,
	},
	frame: {
		border: 75,
	},
	logo: {
		image: {
			side: 118,
		},
		circle: {
			margin: 22,
			padding: 4,
			color: "white",
			strokeWidth: 8,
		},
	},
	colors: {
		[Logo.AzioneInteressePubblico]: "#d41367", // Cranberry
		[Logo.AzioneNuoveGenerazioni]: "#d41367", // Cranberry
		[Logo.AzioneProfessionale]: "#d41367", // Cranberry
		[Logo.Distretto]: "#17458f", // Rotary Royal Blue
		[Logo.Doc]: "#0067c8", // Azure
		[Logo.Etruria]: "#00adbb", // Turquoise
		[Logo.Galileo]: "#f7a81b", // Rotary Gold
		[Logo.Magnifico]: "#009739", // Grass
		[Logo.Montalbano]: "#901f93", // Violet
		[Logo.Sport]: "#d41367", // Cranberry
		[Logo.Tirreno]: "#ff7600", // Orange
	} satisfies Record<Logo, string>,
	hashes: {
		frames: {
			[Format.Landscape]: "28846",
			[Format.Portrait]: "18461",
			[Format.Square]: "24840",
		} satisfies Record<Format, string>,
		logos: {
			[Logo.AzioneInteressePubblico]: "63203",
			[Logo.AzioneNuoveGenerazioni]: "41260",
			[Logo.AzioneProfessionale]: "09833",
			[Logo.Distretto]: "13820",
			[Logo.Doc]: "20572",
			[Logo.Etruria]: "25935",
			[Logo.Galileo]: "03570",
			[Logo.Magnifico]: "54002",
			[Logo.Montalbano]: "03570",
			[Logo.Sport]: "32507",
			[Logo.Tirreno]: "48765",
		} satisfies Record<Logo, string>,
	},
} as const
