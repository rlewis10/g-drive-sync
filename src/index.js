const gdocs = require('./getGDocs')
const aws = require('./awsUpload')
const goath = require('./googleOAuth')
const file = require('./fileIO')

const run = async () => {
  await aws.awsAuth()
  await gdocs.getOAuth2Client()
  //await file.write(gdocs.getGPaths(), './data/gFiles.json')
  


  file.read('./data/sample.json')
    .then(data => {
      console.log(`Total number of fies in gDrive to backup: ${data.length}`)
      data.forEach(file => {
        gdocs.getGFiles(file)
      })
    })

}

run()