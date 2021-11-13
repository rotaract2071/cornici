const form = document.getElementById("upload-form")
const imageInput = document.getElementById("image-input")
const zoneInput = document.getElementById("zone")
const ratioInput = document.getElementById("ratio")
const image = document.getElementById("image")
const apply = document.getElementById("apply")

let cropper = null
const colorMap = {
	"doc": "hsl(209, 83%, 30%)",
	"etruria": "hsl(193, 81%, 48%)",
	"galileo": "hsl(30, 89%, 63%)",
	"magnifico": "hsl(160, 76%, 31%)",
	"montalbano": "hsl(334, 81%, 51%)",
	"tirreno": "hsl(15, 83%, 60%)"
}

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
			zoomable: false,
			viewMode: 3
		})
		apply.removeAttribute("disabled")
	}
	fileReader.readAsDataURL(file)
}

ratioInput.onchange = () => {
	const ratio = ratioInput.value
	cropper.setAspectRatio(ratio === 'square' ? 1 : ratio === 'portrait' ? 2 / 3 : ratio === 'landscape' ? 3 / 2 : null)
}

apply.onclick = async () => {
	const croppedCanvas = cropper.getCroppedCanvas()

	const ratio = ratioInput.value
	const [width, height] = (() => {
		switch (ratio) {
			case "square":
				return [1080, 1080]
			case "landscape":
				return [1620, 1080]
			case "portrait":
				return [1080, 1620]
		}
	})()
	const canvas = document.createElement("canvas")
	canvas.width = width
	canvas.height = height
	const ctx = canvas.getContext("2d")

	ctx.drawImage(croppedCanvas, 0, 0, width, height)

	const svgText = await fetch(`/assets/frames/frame_${ratio}.svg`).then(data => data.text())
	const frame = (() => {
		const tmp = document.createElement("div")
		tmp.innerHTML = svgText
		return tmp.firstElementChild
	})()
	const paths = Array.from(frame.querySelectorAll("path"))

	paths.forEach(path => {
		const path2d = new Path2D(path.getAttribute("d"))

		if (path.getAttribute("fill") === "#808080") {
			ctx.fillStyle = colorMap[zoneInput.value]
		} else {
			ctx.fillStyle = path.getAttribute("fill")
		}
		ctx.fill(path2d)


		if (path.getAttribute("stroke") !== null) {
			ctx.strokeStyle = path.getAttribute("stroke")
			ctx.lineWidth = path.getAttribute("stroke-width")
			ctx.stroke(path2d)
		}
	})

	const a = document.createElement("a")
	a.download = "cornice.jpg"
	a.href = canvas.toDataURL("image/jpeg")
	a.click()
}
