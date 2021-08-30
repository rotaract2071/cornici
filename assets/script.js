document.addEventListener("DOMContentLoaded", () => {
	const form = document.querySelector("#upload-form")
	const image = document.querySelector("#image")
	const apply = document.querySelector("#apply")

	let cropper = null

	let [baseFilename, frameFilename] = [null, null]

	form.addEventListener("submit", (e) => {
		e.preventDefault()
		const formData = new FormData(form)
		let ratio = formData.get('ratio')
		fetch("/upload", {
			method: "POST",
			body: formData
		}).then(data => data.json()).then(json => {
			baseFilename = json.baseFilename
			frameFilename = `${formData.get("zone")}_${formData.get("ratio")}`
			image.setAttribute("src", `/uploads/${json.baseFilename}`);
			[...form.elements].forEach(el => el.setAttribute('disabled', true))
			cropper = new Cropper(image, {
				aspectRatio: ratio === 'square' ? 1 : ratio === 'portrait' ? 2/3 : ratio === 'landscape' ? 3/2 : null,
				zoomable: false
			})
			apply.removeAttribute("disabled")
		})
	})

	apply.addEventListener("click", () => {
		const formData = new FormData(form)
		const cropboxData = cropper.getData()
		console.log(cropper.getData())
		fetch("/apply", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				image: baseFilename,
				frame: frameFilename,
				zone: formData.get("zone"),
				ratio: formData.get("ratio"),
				left: cropboxData.x,
				top: cropboxData.y,
				width: cropboxData.width,
				height: cropboxData.height
			})
		}).then(response => response.json())
			.then(data => window.location = data.filename)
	})
})