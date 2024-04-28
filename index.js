const pupeteer = require('puppeteer')
const prompt = require('prompt-sync')({sigint: true})
const path = require('path')
const fs = require('fs')
const PDFDocument = require('pdfkit')
const { convert } = require('convert-svg-to-png')

async function run() {
    const browser = await pupeteer.launch()
    const page = await browser.newPage()

    page.setViewport({width: 1920, height: 1080})

    const url = prompt('Enter the URL to a score on musescore: ')
    const imgPath = path.resolve(__dirname, 'img')

    // If not properly cleaned, clean now
    if (fs.existsSync(imgPath))
        fs.rmSync(imgPath, {recursive: true})
    
    // Create temporary image-folder
    fs.mkdirSync(imgPath)

    // If a resource has been loaded, check if its an image and if its a score_ image, save it.
    page.on('response', async response => {
        const url = response.url()
        if (response.request().resourceType() === 'image') {
            if ((response.status() >= 200) && (response.status() <= 299)) {
                response.buffer().then(file => {
                    const fileName = url.split('/').pop().split('?')[0]
                    
                    if (fileName.includes('score_')) {
                        const filePath = path.resolve(imgPath, fileName)
                        const writeStream = fs.createWriteStream(filePath)
                        writeStream.write(file)

                        //console.log('Saved', url)
                    }
                });
            }
        }
    });

    await page.goto(url)

    // Accept cookies, so we can continue
    const cookieAcceptBtn = '#qc-cmp2-ui button[mode=primary]'
    const cookieBtn = await page.$(cookieAcceptBtn)

    if (cookieBtn !== null) {
        cookieBtn.click()
    }
    
    // Scroll full score to load all parts
    await autoScroll(page)
    
    // Close browser once done
    await browser.close()

    // ---------- PART 2 ----------

    await generatePDFWithSVGs(imgPath)

    // Clean-up
    if (fs.existsSync(imgPath)) {
        fs.rmSync(imgPath, {recursive: true})
    }
}

run()


/**
 * Automatically scroll to bottom of "jmuse-scroller-component"-element
 */
async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0
            var distance = 100
            var timer = setInterval(() => {
                const el = document.getElementById('jmuse-scroller-component')
                var scrollHeight = el.scrollHeight
                el.scrollBy(0, distance)
                totalHeight += distance

                if(totalHeight >= scrollHeight - window.innerHeight){
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        });
    });
}

/**
 * Generates the PDF from the given SVG-Input-Folder
 */
async function generatePDFWithSVGs(svgFolder) {
    const svgFiles = fs.readdirSync(svgFolder)
    
    // Generate new PDF document into score.pdf
    const doc = new PDFDocument({size: 'A4'})
    doc.pipe(fs.createWriteStream('score.pdf'));

    for (let i = 0; i < svgFiles.length; i++) {
        // Load SVG-File
        const svgFile = svgFiles[i]
        const svgContent = fs.readFileSync(path.resolve(svgFolder, svgFile), 'utf-8')
        
        // Convert to PNG
        const converted = await convert(svgContent);

        // Set PNG into PDF
        doc.image(converted, 0, 0, {fit: [595, 842]})

        // if not last page add page
        if (i < (svgFiles.length - 1))
            doc.addPage()
    }
    doc.end()
}