export default abstract class ImageFormatNegotiator {

	static async supportsAvif(): Promise<boolean> {
		const dataURL = 'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZgAAARNtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAAA5waXRtAAAAAAABAAAAImlsb2MAAAAAREAAAQABAAAAAAE3AAEAAAAAAAAAGQAAACNpaW5mAAAAAAABAAAAFWluZmUCAAAAAAEAAGF2MDEAAAAAk2lwcnAAAABzaXBjbwAAABNjb2xybmNseAABAA0ABoAAAAAMYXYxQ4EADAAAAAAUaXNwZQAAAAAAAAABAAAAAQAAAChjbGFwAAAAAQAAAAEAAAABAAAAAf////EAAAAC////8QAAAAIAAAAQcGl4aQAAAAADCAgIAAAAGGlwbWEAAAAAAAAAAQABBYGCA4SFAAAAIW1kYXQSAAoIGAAGiAhoNCAyCx/wYAALAACE88rA'
		if (window.hasOwnProperty('createImageBitmap')) {
			const blob = await fetch(dataURL).then(res => res.blob())
			try {
				await createImageBitmap(blob)
				return true
			} catch (error) {
				return false
			}
		}
		const image = new Image()
		return new Promise(resolve => {
			image.onload = () => resolve(true)
			image.onerror = () => resolve(false)
			image.src = dataURL
		})
	}

	static supportsWebp(): boolean {
		const canvas = document.createElement('canvas')
		canvas.getContext('2d')
		return canvas.toDataURL('image/webp').split(';')[0] === 'data:image/webp'
	}
}