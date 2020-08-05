const gOAuth =  require('./googleOAuth')
const gFiles = require('./getGFiles')
const { google } = require('googleapis')
const fs = require('fs')
const stream = require('stream')
const AWS = require('aws-sdk')

const run = async () => {

  const gKeys = await gOAuth.get()
  const awsKeys = await gOAuth.read('./cred/awskeys.json').then(result => {return result})

  
  //gFiles.getGFilePaths(gAuth).then(data => {
  //  console.log(data)
  //})
  
  const drive = google.drive({ version: 'v3', auth: gKeys })
  const fileId = '1bNr_ZM90fM0EnPcFPfdd2LnB7Z2Tts3LiQ'


  AWS.config.update({
    accessKeyId: awsKeys.keys.aws_access_key_id,
    secretAccessKey: awsKeys.keys.aws_secret_access_key
  })

  console.log(await getGFileContent(drive, fileId))

}

// download gFile
const getGFileContent = (drive, fileId) => {
  return drive.files
  .get({fileId: fileId, mimeType: "image/jpeg", alt: 'media'}, {responseType: 'stream'})
  .then(res => {
    return new Promise((resolve, reject) => {
      
      const filePath = './data/photo.jpg'
      const dest = fs.createWriteStream(filePath)
  
      res.data
        .on('end', () => {resolve(`Done downloading file`)})
        .on('error', err => {reject(`Error downloading file ${err}`)})
        .pipe(dest)
    })
  })
}

const awsUpload = async () => {
  let pass = new stream.PassThrough()
  let params = {
    Bucket: "rlewis-backup", // bucket-name
    Key: 'filePath.jpg', // file will be saved as bucket-name/[uniquekey.csv]
    Body: pass  // file data 
  } 
  try {
    let uploadPromise = await new AWS.S3().upload(params).promise()
    console.log("Successfully uploaded data to bucket")
  } 
  catch (e) {
    console.log("Error uploading data: ", e)
  }
}

run()