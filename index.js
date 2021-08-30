const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const { nanoid } = require('nanoid')
const fs = require('fs/promises')

const upload = multer({ storage: multer.memoryStorage() })

const app = express()
app.set("view engine", "pug")
app.use("/assets", express.static("assets"))
app.use("/uploads", express.static("var/uploads"))
app.use(express.json())

app.get('/', (req, res) => res.render("home"))

app.post('/upload', upload.single("photo"), async (req, res) => {
	const filename = `${nanoid()}.jpg`
	await sharp(req.file.buffer)
		.rotate()
		.resize(1080, 1080, { fit: 'outside' })
		.toFile(`var/uploads/${filename}`)

	res.json({
		ok: true,
		baseFilename: filename
	})

	setTimeout(() => fs.unlink(`var/uploads/${filename}`), 5 * 60 * 1000)
})

app.post('/apply', async (req, res) => {
	const [baseFilename, frameFilename] = [req.body.image, req.body.frame]
	const [top, left] = [Math.floor(req.body.top), Math.floor(req.body.left)]
	const [width, height] = [Math.floor(req.body.width), Math.floor(req.body.height)]

	await sharp(`var/uploads/${baseFilename}`)
		.extract({
			top: top >= 0 ? top : 0,
			left: left >= 0 ? left : 0,
			width: width,
			height: height
		})
		.resize(1080, 1080, { fit: 'outside' })
		.composite([{ input: `assets/frames/${frameFilename}.png` }])
		.toFile(`var/exports/${baseFilename}`)
	
	setTimeout(() => fs.unlink(`var/exports/${baseFilename}`), 5 * 60 * 1000)
		
	res.json({
		ok: true,
		filename: `/exports/${baseFilename}`
	})
})

app.get('/exports/:filename', (req, res) => {
	res.sendFile(`var/exports/${req.params.filename}`, {
		headers: { 'Content-Disposition': 'attachment; filename=export.jpg' },
		root: __dirname
	})
})

app.listen(8000)