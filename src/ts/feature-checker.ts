export function supportsCreateImageBitmap(): boolean {
	try {
		return "createImageBitmap" in globalThis && !!createImageBitmap(new Blob())
	} catch {
		return false
	}
}

export function supportsWebWorkers(): boolean {
	return "Worker" in globalThis
}

export function supportsOffscreenCanvas(): boolean {
	return "OffscreenCanvas" in globalThis
}
