const express = require('express')
const app = express()
app.set('port', process.env.PORT || 3001)

const AWS = require('aws-sdk')
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_KEY || '',
  region: process.env.S3_REGION || 'ap-northeast-1'
})

const basicUser = process.env.AUTH_USER || ''
const basicPassword = process.env.AUTH_PASSWORD || ''

if (!basicUser || !basicPassword) {
  console.log('AUTH_USER and AUTH_PASSWORD is required.')
  process.exit()
}
const expectedAuthHeader =
  'Basic ' +
  Buffer.from(basicUser + ':' + basicPassword, 'ascii').toString('base64')

// Health Check Endpoint for Load Balancer
app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

// S3 Proxy
app.get('*', (req, res) => {
  const authHeader = req.get('Authorization') || undefined
  if (authHeader && expectedAuthHeader === authHeader) {
    // Basic Auth Successed
    let key = req.url
    if (key.endsWith('/')) {
      key += process.env.INDEX_DOCUMENT || ''
    }
    key = key.substring(1)
    if (key.length === 0) {
      res.status(404).send('Not Found')
      return
    }

    // Get S3 Object and Bypassing
    let params = {
      Bucket: process.env.S3_BUCKET || '',
      Key: key
    }
    s3
      .getObject(params)
      .on('httpHeaders', function (statusCode, headers) {
        res.set({
          'content-length': headers['content-length'],
          'content-type': headers['content-type'],
          'last-modified': headers['last-modified']
        })
      })
      .createReadStream()
      .on('error', () => {
        if (process.env.CATCH_DOCUMENT) {
          params.Key = process.env.CATCH_DOCUMENT
          s3
            .getObject(params)
            .createReadStream()
            .on('error', () => {
              res.status(404).send('Not Found')
            })
            .pipe(res)
        } else {
          res.status(404).send('Not Found')
        }
      })
      .pipe(res)
  } else {
    // Basic Auth Failed
    res.append('WWW-Authenticate', 'Basic realm="Namie Admin Console"')
    res.status(401).send('Unauthorized')
  }
})

app.listen(app.get('port'), () => {
  console.log('s3-basic-auth-proxy is listening on port ' + app.get('port'))
})
