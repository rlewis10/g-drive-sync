  
const gdocs = require('./getGDocs')
const aws = require('./awsUpload')
const goath = require('./googleOAuth')

const run = async () => {

  await aws.awsAuth()
  await gdocs.getOAuth2Client()


  let sample = goath.read('./data/sample.json')
    .then(data => {
      console.log(`Total number of fies in gDrive to backup: ${data.length}`)
      data.forEach(file => gdocs.getGFiles(file))
    })

/* 
  gdocs.getGPaths()
    .then(data => {
      console.log(`Total number of fies in gDrive to backup: ${data.length}`)
      data.forEach(file => gdocs.getGFiles(file))
    })
  .catch(err)
*/

}

run()