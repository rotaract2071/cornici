export default function generateAnchor(url: URL, filename: string): HTMLAnchorElement {
	const a = document.createElement("a")
	a.href = url.href
	a.download = filename
	const small = document.createElement("small")
	small.innerText = "Clicca qui o sull'immagine per scaricarla"
	a.appendChild(small)
	const image = new Image()
	image.src = url.href
	a.appendChild(image)
	return a
}
