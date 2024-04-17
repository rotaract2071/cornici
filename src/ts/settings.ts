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
		[Logo.Distretto]: "#17458f", // Rotary Royal Blue
		[Logo.Doc]: "#0067c8", // Azure
		[Logo.Etruria]: "#00adbb", // Turquoise
		[Logo.Galileo]: "#f7a81b", // Rotary Gold
		[Logo.Magnifico]: "#009739", // Grass
		[Logo.Montalbano]: "#901f93", // Violet
		[Logo.Tirreno]: "#ff7600", // Orange
	} satisfies Record<Logo, string>,
	hashes: {
		frames: {
			[Format.Landscape]: "28846",
			[Format.Portrait]: "18461",
			[Format.Square]: "24840",
		} satisfies Record<Format, string>,
		logos: {
			[Logo.Distretto]: "13820",
			[Logo.Doc]: "65040",
			[Logo.Etruria]: "34250",
			[Logo.Galileo]: "44175",
			[Logo.Magnifico]: "07988",
			[Logo.Montalbano]: "56065",
			[Logo.Tirreno]: "46942",
		} satisfies Record<Logo, string>,
	},
} as const
