export const enum Status {
    Busy,
    Clickable,
    Disabled,
    Hidden,
}

const attributes: Record<Status, { hidden: boolean, ariaBusy: "true" | "false", disabled: boolean }> = {
    [Status.Busy]: {
        hidden: false,
        ariaBusy: "true",
        disabled: true,
    },
    [Status.Clickable]: {
        hidden: false,
        ariaBusy: "false",
        disabled: false,
    },
    [Status.Disabled]: {
        hidden: false,
        ariaBusy: "false",
        disabled: true,
    },
    [Status.Hidden]: {
        hidden: true,
        ariaBusy: "false",
        disabled: false,
    },
}

export function setStatus(button: HTMLButtonElement, status: Status) {
    const { hidden, ariaBusy, disabled } = attributes[status]
    button.hidden = hidden
    button.ariaBusy = ariaBusy
    button.disabled = disabled
}
