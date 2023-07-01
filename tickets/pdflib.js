const { PDFDocument, StandardFonts, rgb, degrees } = require('pdf-lib')
const { readFile, writeFile } = require("fs/promises");
const path = require("path")
const fs = require("fs")
async function createPdf() {
    // const pdfDoc = await PDFDocument.create()
    const pdfDoc = await PDFDocument.load(await readFile(path.join(__dirname, "rotatesample.pdf")));

    const page = pdfDoc.getPage(0)
    const { width, height } = page.getSize()
    const fontSize = 15
    console.log(height)
    // name
    page.drawText('Creating PDFs in JavaScript is awesome!', {
        x: width - 250,
        // y: height - (8 * fontSize),
        y:height-70,
        size: fontSize,
        // font: timesRomanFont,
        // color: rgb(0, 0.53, 0.71),
        color: rgb(0, 0, 0),
        rotate: degrees(-90),
    })
    // date
    page.drawText('12/12/2022', {
        x: width - 287,
        // y: height - (8 * fontSize),
        y:height-70,
        size: fontSize,
        // font: timesRomanFont,
        // color: rgb(0, 0.53, 0.71),
        color: rgb(0, 0, 0),
        rotate: degrees(-90),
    })
    // derpature time
    page.drawText('12/12/2022', {
        x: width - 324,
        // y: height - (8 * fontSize),
        y:height-150,
        size: fontSize,
        // font: timesRomanFont,
        // color: rgb(0, 0.53, 0.71),
        color: rgb(0, 0, 0),
        rotate: degrees(-90),
    })
    // from
    page.drawText('12/12/2022', {
        x: width - 361,
        // y: height - (8 * fontSize),
        y:height-70,
        size: fontSize,
        // font: timesRomanFont,
        // color: rgb(0, 0.53, 0.71),
        color: rgb(0, 0, 0),
        rotate: degrees(-90),
    })
    // to
    page.drawText('12/12/2022', {
        x: width - 361,
        // y: height - (8 * fontSize),
        y:height-255,
        size: fontSize,
        // font: timesRomanFont,
        // color: rgb(0, 0.53, 0.71),
        color: rgb(0, 0, 0),
        rotate: degrees(-90),
    })
    // bus
    page.drawText('12/12/2022', {
        x: width - 398,
        // y: height - (8 * fontSize),
        y:height-70,
        size: fontSize,
        // font: timesRomanFont,
        // color: rgb(0, 0.53, 0.71),
        color: rgb(0, 0, 0),
        rotate: degrees(-90),
    })
    // createdBy
    page.drawText('Ramatou Yoland', {
        x: width - 430,
        // y: height - (8 * fontSize),
        y:height-130,
        size: fontSize,
        // font: timesRomanFont,
        // color: rgb(0, 0.53, 0.71),
        color: rgb(0, 0, 0),
        rotate: degrees(-90),
    })
    // bus
    page.drawText('13', {
        x: width - 250,
        // y: height - (8 * fontSize),
        y:height-500,
        size: fontSize,
        // font: timesRomanFont,
        // color: rgb(0, 0.53, 0.71),
        color: rgb(0, 0, 0),
        rotate: degrees(-90),
    })
    // price
    page.drawText('13000', {
        x: width - 361,
        // y: height - (8 * fontSize),
        y:height-500,
        size: fontSize,
        // font: timesRomanFont,
        // color: rgb(0, 0.53, 0.71),
        color: rgb(0, 0, 0),
        rotate: degrees(-90),
    })
    // triptype
    page.drawText('.', {
        x: width - 335,
        // y: height - (8 * fontSize),
        y:height-400,
        size: 100,
        // font: timesRomanFont,
        // color: rgb(0, 0.53, 0.71),
        color: rgb(0, 0, 0),
        rotate: degrees(-90),
    })
    // let img = fs.readFileSync(path.join(__dirname, "qr.png"));
    // img = await pdfDoc.embedPng(img)
    // img.scale(1)
    // page.drawImage(img, {
    //     x: page.getWidth() / 2 - width / 2,
    //     y: page.getHeight() / 2 - height / 2,

    // })
    const pdfBytes = await pdfDoc.save()
    await writeFile(path.join(__dirname, "realsampleoutput" + ".pdf"), pdfBytes);

}
createPdf()