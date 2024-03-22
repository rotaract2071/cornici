export const enum Status {
    Clickable,
    Hidden,
    Busy,
    Disabled,
}

const attributes: Record<Status, { hidden: boolean, ariaBusy: "true" | "false", disabled: boolean }> = {
    [Status.Clickable]: {
        hidden: false,
        ariaBusy: "false",
        disabled: false,
    },
    [Status.Hidden]: {
        hidden: true,
        ariaBusy: "false",
        disabled: false,
    },
    [Status.Busy]: {
        hidden: false,
        ariaBusy: "true",
        disabled: true,
    },
    [Status.Disabled]: {
        hidden: false,
        ariaBusy: "false",
        disabled: true,
    },
}

export function setStatus(button: HTMLButtonElement, status: Status) {
    const { hidden, ariaBusy, disabled } = attributes[status]
    button.hidden = hidden
    button.ariaBusy = ariaBusy
    button.disabled = disabled
}
