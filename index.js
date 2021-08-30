const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const { nanoid } = require('nanoid')

const upload = multer({ storage: multer.memoryStorage() })

const app = express()
app.set("view engine", "pug")
app.use("/assets", express.static("assets"))
app.use("/uploads", express.static("var/uploads"))
app.use(express.json())

app.get('/', (req, res) => res.render("home"))

app.post('/upload', upload.single("photo"), async (req, res) => {
	const image = sharp(req.file.buffer)
	const filename = `${nanoid()}.jpg`
	await image
		.resize(1080, 1080, { fit: 'outside' })
		.toFile(`var/uploads/${filename}`)

	res.json({
		ok: true,
		baseFilename: filename
	})
})

app.post('/apply', async (req, res) => {
	const [baseFilename, frameFilename] = [req.body.base, req.body.frame]
	const [top, left] = [Math.floor(req.body.top), Math.floor(req.body.left)]
	const ratio = req.body.ratio
	const [width, height] = ratio === "square" ? [1080, 1080] : ratio === "portrait" ?  [1080, 1620] : [1620, 1080]
	
	await sharp(`var/uploads/${baseFilename}`)
		.extract({ top: top, left: left, width: width, height: height })
		.composite([{ input: `assets/frames/${frameFilename}.png` }])
		.toFile(`var/exports/${baseFilename}`)
	res.json({
		ok: true,
		filename: `/exports/${baseFilename}`
	})
})

app.get('/exports/:filename', (req, res) => {
	res
		.sendFile(`var/exports/${req.params.filename}`, {
			headers: {'Content-Disposition': 'attachment; filename=export.jpg'},
			root: __dirname
		})
})

app.listen(8000)