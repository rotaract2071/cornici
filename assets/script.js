document.addEventListener("DOMContentLoaded", () => {
	$("#frame").draggable({
		cursor: "move",
		containment: $("#base")
	})

	const form = document.querySelector("#upload-form")
	const base = document.querySelector("#base")
	const frame = document.querySelector("#frame")
	const apply = document.querySelector("#apply")

	let [baseFilename, frameFilename] = [null, null]

	form.addEventListener("submit", (e) => {
		e.preventDefault()
		const formData = new FormData(form)
		fetch("/upload", {
			method: "POST",
			body: formData
		}).then(data => data.json()).then(json => {
			baseFilename = json.baseFilename
			frameFilename = `${formData.get("zone")}_${formData.get("ratio")}`
			base.setAttribute("src", `/uploads/${json.baseFilename}`)
			frame.setAttribute("src", `/assets/frames/${frameFilename}.png`)
			apply.removeAttribute("disabled")
		})
	})

	apply.addEventListener("click", () => {
		const formData = new FormData(form)
		fetch("/apply", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				base: baseFilename,
				frame: frameFilename,
				zone: formData.get("zone"),
				ratio: formData.get("ratio"),
				top: Math.floor((frame.getBoundingClientRect().y - base.getBoundingClientRect().y) * 2),
				left: Math.floor((frame.getBoundingClientRect().x - base.getBoundingClientRect().x) * 2)
			})
		}).then(response => response.json())
			.then(data => window.location = data.filename)
	})
})