import { CurrentVersion } from "./constants.d";

export default abstract class VersionChecker {
	static check() {
		const installedVersion = window.localStorage?.getItem('version') || ''
		if (CurrentVersion !== installedVersion) {
			this.#invalidateCache()
			window.localStorage?.setItem('version', CurrentVersion)
		}
	}

	static async #invalidateCache() {
		await window.caches?.delete('images')
	}
}
