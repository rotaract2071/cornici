document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("upload-form")
	const imageInput = document.getElementById("image-input")
	const ratioInput = document.getElementById("ratio")
	const image = document.getElementById("image")
	const apply = document.getElementById("apply")

	let cropper = null

	imageInput.onchange = () => {
		const formData = new FormData(form)
		let ratio = formData.get('ratio')
		const file = imageInput.files[0]
		const fileReader = new FileReader()
		fileReader.onload = (e) => {
			image.src = e.target.result
			if (cropper) cropper.destroy()
			cropper = new Cropper(image, {
				aspectRatio: ratio === 'square' ? 1 : ratio === 'portrait' ? 2 / 3 : ratio === 'landscape' ? 3 / 2 : null,
				zoomable: false
			})
			apply.removeAttribute("disabled")
		}
		fileReader.readAsDataURL(file)
	}

	ratioInput.onchange = () => {
		const ratio = ratioInput.value
		cropper.setAspectRatio(ratio === 'square' ? 1 : ratio === 'portrait' ? 2 / 3 : ratio === 'landscape' ? 3 / 2 : null)
	}

	apply.onclick = () => {
		const cropboxData = cropper.getData()
		let formData = new FormData(form)
		formData.set('left', cropboxData.x)
		formData.set('top', cropboxData.y)
		formData.set('width', cropboxData.width)
		formData.set('height', cropboxData.height)
		Swal.showLoading()
		fetch("/apply", {
			method: "POST",
			body: formData
		}).then(response => response.json())
			.then(data => {
				Swal.close()
				window.location = data.filename
			})
	}
})