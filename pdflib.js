const { PDFDocument, StandardFonts, rgb } = require('pdf-lib')
const { readFile, writeFile } = require("fs/promises");
const path = require("path")
const fs = require("fs")
async function createPdf() {
    // const pdfDoc = await PDFDocument.create()
    const pdfDoc = await PDFDocument.load(await readFile(path.resolve(__dirname, "./tickets", "sampleticket.pdf")));
    const page = pdfDoc.getPage(0)
    const { width, height } = page.getSize()
    const fileNames=pdfDoc.getForm().getFields().map(f=>f.getName())
    console.log(fileNames)
    const pdfBytes = await pdfDoc.save()
    await writeFile(path.join(__dirname, "viewsample" + ".pdf"), pdfBytes);

}
createPdf()