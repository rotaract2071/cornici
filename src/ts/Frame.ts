import { Color, Ratio, Zone } from "./constants.d";

const colorMap: Record<Zone, Color> = {
	[Zone.Doc]: Color.Doc,
	[Zone.Etruria]: Color.Etruria,
	[Zone.Galileo]: Color.Galileo,
	[Zone.Magnifico]: Color.Magnifico,
	[Zone.Montalbano]: Color.Montalbano,
	[Zone.Tirreno]: Color.Tirreno,
};

export default class Frame {
	readonly ratio: Ratio;
	readonly color: Color;
	readonly logo: Zone;

	constructor(ratio: Ratio, zone: Zone) {
		this.ratio = ratio;
		this.color = colorMap[zone];
		this.logo = zone;
	}
}
