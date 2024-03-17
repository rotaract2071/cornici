import { Logo, Ratio } from "./constants.d";

const logoHashes: Record<Logo, string> = {
    [Logo.Distretto]: "06365",
    [Logo.Doc]: "36231",
    [Logo.Etruria]: "08921",
    [Logo.Galileo]: "45306",
    [Logo.Magnifico]: "13043",
    [Logo.Montalbano]: "16037",
    [Logo.Tirreno]: "63195",
}

const frameHashes: Record<Ratio, string> = {
    [Ratio.Square]: "24840",
    [Ratio.Landscape]: "28846",
    [Ratio.Portrait]: "18461",
}

export async function fetchLogo(logo: Logo): Promise<ImageBitmap | HTMLImageElement> {
    const response = await fetch(`/logos/${logo}-${logoHashes[logo]}.png`);
    return createImage(await response.blob());
}

export async function fetchFrame(ratio: Ratio): Promise<SVGElement> {
    const response = await fetch(`/frames/${ratio}-${frameHashes[ratio]}.svg`);
    return createSVG(await response.text());
}

async function createImage(imageData: Blob): Promise<ImageBitmap | HTMLImageElement> {
    if (window.hasOwnProperty("createImageBitmap")) {
        return createImageBitmap(imageData);
    }
    const image = new Image();
    image.src = await (async (blob: Blob): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    })(imageData);
    await new Promise((resolve) => image.onload = resolve);
    return image;
}

function createSVG(svgText: string): SVGElement {
    const frame: SVGElement = (() => {
        const tmp = document.createElement("div");
        tmp.innerHTML = svgText;
        return tmp.firstElementChild as SVGElement;
    })();
    return frame;
}