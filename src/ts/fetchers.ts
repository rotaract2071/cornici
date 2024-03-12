export async function fetchLogo(logoName: string): Promise<ImageBitmap | HTMLImageElement> {
    return createImage(await fetch(`/logos/${logoName}.jpg`));
}

export async function fetchFrame(format: string): Promise<SVGElement> {
    return createSVG(await fetch(`/frames/${format}.svg`));
}

async function createImage(response: Response): Promise<ImageBitmap | HTMLImageElement> {
    const imageData = await response.blob();
    if (window.hasOwnProperty("createImageBitmap")) {
        return await createImageBitmap(imageData);
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