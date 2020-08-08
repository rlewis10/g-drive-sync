const gFiles = require('./getGFiles')
const awsUpload = require('./awsUpload')

const run = () => {

  // check if getGFilePaths returns length > 0. 
  gFiles.getGFilePaths().then(data => {
    console.log(data)
  })

  // get individual file from gDrive and pipe it to AWS S3.
  //getGFileContent(drive, fileObj)

}

run()