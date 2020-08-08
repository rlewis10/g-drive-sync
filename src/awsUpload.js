const gOAuth =  require('./googleOAuth')
const aws = require('aws-sdk')
const stream = require('stream')

// AWS S3 bucket name to upload to
const awsBucketName = 'rlewis-backup'

// get AWS keys stored in local file and pass through to AWS auth
const getAWSKeys = async () => {
    const awsKeys = await gOAuth.read('./cred/awskeys.json').then(result => {return result})
    aws.config.update({
        accessKeyId: awsKeys.keys.aws_access_key_id,
        secretAccessKey: awsKeys.keys.aws_secret_access_key
      })
}

// upload a file to AWS S3 by passing the file stream from getGFileContent into the 'body' parameter of the upload
const awsUpload = async (path) => {
    await getAWSKeys()
    let pass = new stream.PassThrough()
    let params = {
        Bucket: awsBucketName, // bucket-name
        Key: path, // file will be saved as bucket-name/[uniquekey.csv]
        Body: pass  // file data passed through stream
    } 
    new AWS.S3().upload(params).promise()
        .catch( err => console.log(`Error, unable to upload to S3: ${err}`))
    return pass
}

module.exports = {awsUpload: awsUpload}