import { Logo } from "./types.d";

const settings = {
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
			margin: 0, // Computed
		},
		circle: {
			margin: 25,
			padding: 4,
			color: "white",
			strokeWidth: 8,
			radius: 0, // Computed
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
};

// Compute the radius as the nearest even number (ceiling) to the diagonal of the square logo (plus some padding)
// so that the logo is entirely inscribed in the circumference
settings.logo.circle.radius = Math.ceil(Math.ceil(settings.logo.image.side / 2 * Math.sqrt(2)) / 2) * 2 + settings.logo.circle.padding;

settings.logo.image.margin = settings.logo.circle.margin + settings.logo.circle.radius - settings.logo.image.side / 2;

export default settings;
