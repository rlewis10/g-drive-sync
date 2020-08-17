const gdocs = require('./getGDocs')
const aws = require('./awsUpload')
const goath = require('./googleOAuth')
const file = require('./fileIO')

let numFilesTotal
let numFilesUploaded
let numFilesErrored

const run = async () => {
  await gdocs.getOAuth2Client()
  await aws.awsAuth()
  //await file.write(gdocs.getGPaths(), './data/gFiles.json')
  
  const allfiles = await file.read('./data/sampleData.json')
  numFilesTotal = allfiles.length
  console.log(`Total number of fies in gDrive to backup: ${numFilesTotal}`)

  allfiles.map(file => {
    gdocs.getGFiles(file)
  })
}

run()