const { PDFDocument, StandardFonts, rgb } = require('pdf-lib')
const { readFile, writeFile } = require("fs/promises");
const path = require("path")
const fs = require("fs")
async function createPdf() {
    const pdfDoc = await PDFDocument.create()
    // const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    // const fontSize = 30
    // page.drawText('Creating PDFs in JavaScript is awesome!', {
    //     x: 50,
    //     y: height - 4 * fontSize,
    //     size: fontSize,
    //     font: timesRomanFont,
    //     color: rgb(0, 0.53, 0.71),
    // })
    let img = fs.readFileSync(path.join(__dirname, "qr.png"));
    img = await pdfDoc.embedPng(img)
    img.scale(1)
    page.drawImage(img, {
        x: page.getWidth() / 2 - width / 2,
        y: page.getHeight() / 2 - height / 2,

    })
    const pdfBytes = await pdfDoc.save()
    await writeFile(path.join(__dirname, "ticket._id " + ".pdf"), pdfBytes);

}
createPdf()