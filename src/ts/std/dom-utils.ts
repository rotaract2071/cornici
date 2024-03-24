export const enum ButtonStatus {
    Busy,
    Clickable,
    Disabled,
    Hidden,
}

const buttonAttributes: Record<ButtonStatus, { hidden: boolean, ariaBusy: "true" | "false", disabled: boolean }> = {
    [ButtonStatus.Busy]: {
        hidden: false,
        ariaBusy: "true",
        disabled: true,
    },
    [ButtonStatus.Clickable]: {
        hidden: false,
        ariaBusy: "false",
        disabled: false,
    },
    [ButtonStatus.Disabled]: {
        hidden: false,
        ariaBusy: "false",
        disabled: true,
    },
    [ButtonStatus.Hidden]: {
        hidden: true,
        ariaBusy: "false",
        disabled: false,
    },
}

export function setButtonStatus(button: HTMLButtonElement, status: ButtonStatus) {
    const { hidden, ariaBusy, disabled } = buttonAttributes[status]
    button.hidden = hidden
    button.ariaBusy = ariaBusy
    button.disabled = disabled
}

export async function generateAnchor(url: URL, filename: string): Promise<HTMLAnchorElement> {
	const a = document.createElement("a")
	a.href = url.href
	a.download = filename
	const small = document.createElement("small")
	small.innerText = "Clicca sull'immagine per scaricarla"
	a.appendChild(small)
	const image = new Image()
	image.src = url.href
	await image.decode()
	a.appendChild(image)
	return a
}
