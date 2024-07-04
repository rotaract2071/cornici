export function supportsCreateImageBitmap(): boolean {
	try {
		return !!createImageBitmap(new Blob())
	} catch {
		return false
	}
}

export function supportsWebWorkers(): boolean {
	return !!Worker
}

export function supportsOffscreenCanvas(): boolean {
	return !!OffscreenCanvas
}
