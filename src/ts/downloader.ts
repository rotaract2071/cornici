export default async function generateAnchor(url: URL, filename: string): Promise<HTMLAnchorElement> {
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
