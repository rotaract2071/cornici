const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const { nanoid } = require('nanoid')
const fs = require('fs/promises')

const upload = multer({ storage: multer.memoryStorage() })

const app = express()
app.set("view engine", "pug")
app.use("/assets", express.static("assets"))

app.get('/', (req, res) => res.render("home"))

app.post('/apply', upload.single('image'), async (req, res) => {
	const zone = req.body.zone
	const ratio = req.body.ratio
	const [top, left] = [Math.floor(req.body.top), Math.floor(req.body.left)]
	const [width, height] = [Math.floor(req.body.width), Math.floor(req.body.height)]

	const fileName = `${nanoid()}.jpg`

	await sharp(req.file.buffer)
		.rotate()
		.extract({
			top: top >= 0 ? top : 0,
			left: left >= 0 ? left : 0,
			width: width,
			height: height
		})
		.resize(1080, 1080, { fit: 'outside' })
		.composite([{ input: `assets/frames/${zone}_${ratio}.png` }])
		.toFile(`var/exports/${fileName}`)

	setTimeout(() => fs.unlink(`var/exports/${fileName}`), 10 * 1000)

	res.json({
		ok: true,
		filename: `/exports/${fileName}`
	})
})

app.get('/exports/:filename', (req, res) => {
	res.download(`var/exports/${req.params.filename}`, 'export.jpg')
})

app.listen(8000)