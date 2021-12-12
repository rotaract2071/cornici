export default class Color {
	static HexRegex = /^#[0-9A-Fa-f]{6}$/;

	#r: number; #g: number; #b: number;

	constructor(hex: string) {
		if (false === Color.HexRegex.test(hex)) {
			throw new Error('Invalid hex string')
		}
		this.#r = parseInt(hex.slice(1, 3), 16)
		this.#g = parseInt(hex.slice(3, 5), 16)
		this.#b = parseInt(hex.slice(5, 7), 16)
	}

	static #RGBtoHSL(r: number, g: number, b: number): [number, number, number] {
		[r, g, b] = [r, g, b].map(c => c/= 255)

		let min = Math.min(r, g, b),
			max = Math.max(r, g, b),
			chroma = max - min,
			[h, s, l] = [0, 0, 0];

		if (chroma === 0)
			h = 0;
		else if (max === r)
			h = ((g - b) / chroma) % 6;
		else if (max === g)
			h = (b - r) / chroma + 2;
		else
			h = (r - g) / chroma + 4;

		h *= 60;
		if (h < 0)
			h += 360;

		l = (max + min) / 2;
		s = chroma === 0 ? 0 : chroma / (1 - Math.abs(2 * l - 1));

		return [h, s, l];
	}

	static #HSLtoRGB(h: number, s: number, l: number): [number, number, number] {
		let chroma = (1 - Math.abs(2 * l - 1)) * s,
			second = chroma * (1 - Math.abs((h / 60) % 2 - 1)),
			m = l - chroma / 2,
			[r, g, b] = [0, 0, 0];

		if (0 <= h && h < 60) {
			[r, g, b] = [chroma, second, 0];
		} else if (60 <= h && h < 120) {
			[r, g, b] = [second, chroma, 0];
		} else if (120 <= h && h < 180) {
			[r, g, b] = [0, chroma, second];
		} else if (180 <= h && h < 240) {
			[r, g, b] = [0, second, chroma];
		} else if (240 <= h && h < 300) {
			[r, g, b] = [second, 0, chroma];
		} else if (300 <= h && h < 360) {
			[r, g, b] = [chroma, 0, second];
		}

		return [r, g, b].map(c => Math.round((c + m) * 255)) as [number, number, number];
	}

	static #RGBtoHEX(r: number, g: number, b: number): string {
		return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
	}

	darken(ratio: number): Color {
		let [h, s, l] = Color.#RGBtoHSL(this.#r, this.#g, this.#b);
		l -= l * ratio;
		[this.#r, this.#g, this.#b] = Color.#HSLtoRGB(h, s, l);
		return this;
	}

	get hex() {
		return Color.#RGBtoHEX(this.#r, this.#g, this.#b);
	}

}