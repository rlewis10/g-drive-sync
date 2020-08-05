const gOAuth =  require('./googleOAuth')
const gFiles = require('./getGFiles')
const { google } = require('googleapis')
const fs = require('fs')
const stream = require('stream')
const AWS = require('aws-sdk')

const run = async () => {

  const gKeys = await gOAuth.get()
  const drive = google.drive({ version: 'v3', auth: gKeys })
  const awsKeys = await gOAuth.read('./cred/awskeys.json').then(result => {return result})

  
  //gFiles.getGFilePaths(gKeys).then(data => {
  //  console.log(data)
  //})
  
  const fileId = '1bNr_ZM90fM0EnPcFPfdd2LnB7Z2Tts3LiQ'


  AWS.config.update({
    accessKeyId: awsKeys.keys.aws_access_key_id,
    secretAccessKey: awsKeys.keys.aws_secret_access_key
  })

  console.log(await getGFileContent(drive, fileId))

}

// download gFile
const getGFileContent = (drive, fileId) => {  
  return drive.files.get({fileId: fileId, mimeType: "image/jpeg", alt: 'media'}, {responseType: 'stream'})
    .then(res => {
      return new Promise((resolve, reject) => {
        res.data
          .on('end', () => {resolve(`Done downloading file`)})
          .on('error', err => {reject(`Error downloading file ${err}`)})
          .pipe(awsUpload())
      })
    })
}

const awsUpload = () => {
  let pass = new stream.PassThrough()
  let params = {
    Bucket: "rlewis-backup", // bucket-name
    Key: 'filePath.jpg', // file will be saved as bucket-name/[uniquekey.csv]
    Body: pass  // file data passed through stream
  } 
  new AWS.S3().upload(params).promise()
    .then(() => console.log(`Successfully uploaded data to bucket`))
    .catch( err => console.log(`Error, unable to upload to S3: ${err}`))
  return pass
}

run()