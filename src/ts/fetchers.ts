import { Logo, Ratio } from "./constants.d";

const frameHash: Record<Ratio, string> = {
    [Ratio.Square]: "24840",
    [Ratio.Landscape]: "28846",
    [Ratio.Portrait]: "18461",
}

export async function fetchLogo(logo: Logo): Promise<ImageBitmap | HTMLImageElement> {
    return createImage(await fetch(`/logos/${logo}.jpg`));
}

export async function fetchFrame(ratio: Ratio): Promise<SVGElement> {
    return createSVG(await fetch(`/frames/${ratio}-${frameHash[ratio]}.svg`));
}

async function createImage(response: Response): Promise<ImageBitmap | HTMLImageElement> {
    const imageData = await response.blob();
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

async function createSVG(response: Response): Promise<SVGElement> {
    const svgText = await response.text();
    const frame: SVGElement = (() => {
        const tmp = document.createElement("div");
        tmp.innerHTML = svgText;
        return tmp.firstElementChild as SVGElement;
    })();
    return frame;
}