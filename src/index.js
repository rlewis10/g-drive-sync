const gFiles = require('./getGFiles')
const awsUpload = require('./awsUpload')
const gOAuth =  require('./googleOAuth')
const { google } = require('googleapis')

const run = () => {

  gFiles.getGFilePaths().then(data => {
    console.log(data)
  })

  //await getGFileContent(drive, fileObj)

}

run()