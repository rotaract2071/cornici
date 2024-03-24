import { Logo, Ratio } from "./types.d"

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
		[Logo.Distretto]: "#d41367",
		[Logo.Doc]: "#0d4e8c",
		[Logo.Etruria]: "#17b2dc",
		[Logo.Galileo]: "#f5a14d",
		[Logo.Magnifico]: "#138a62",
		[Logo.Montalbano]: "#e71d75",
		[Logo.Tirreno]: "#ee7046",
	} satisfies Record<Logo, string>,
	hashes: {
		frames: {
			[Ratio.Landscape]: "28846",
			[Ratio.Portrait]: "18461",
			[Ratio.Square]: "24840",
		} satisfies Record<Ratio, string>,
		logos: {
			[Logo.Distretto]: "06365",
			[Logo.Doc]: "36231",
			[Logo.Etruria]: "08921",
			[Logo.Galileo]: "45306",
			[Logo.Magnifico]: "13043",
			[Logo.Montalbano]: "16037",
			[Logo.Tirreno]: "63195",
		} satisfies Record<Logo, string>,
	},
}
