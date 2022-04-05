import { Color, Ratio, Logo } from "./constants.d";

const colorMap: Record<Logo, Color> = {
	[Logo.None]: Color.None,
	[Logo.Doc]: Color.Doc,
	[Logo.Etruria]: Color.Etruria,
	[Logo.Galileo]: Color.Galileo,
	[Logo.Magnifico]: Color.Magnifico,
	[Logo.Montalbano]: Color.Montalbano,
	[Logo.Tirreno]: Color.Tirreno,
};

export default class Frame {
	readonly color: Color;

	constructor(readonly ratio: Ratio, readonly logo: Logo) {
		this.ratio = ratio;
		this.color = colorMap[logo];
	}
}
