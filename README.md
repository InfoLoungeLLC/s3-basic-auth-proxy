# s3-basic-auth-proxy
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Frontend proxy server with Basic Authentication for Amazon S3 written by Node.js.

## Getting Started

    $ git clone git@github.com:InfoLoungeLLC/s3-basic-auth-proxy.git
    $ cd s3-basic-auth-proxy
    $ npm install
    $ AWS_ACCESS_KEY_ID=<id> \
    > AWS_SECRET_KEY=<secret> \
    > S3_REGION=<region> \
    > S3_BUCKET=<bucket> \
    > AUTH_USER=<user> \
    > AUTH_PASSWORD=<password> \
    > npm start

Then use http://localhost:3001/ instead of http://bucket.s3.amazon.com/.

## Environment Variables

- PORT : Port of Proxy Server (default: 3001)
- AWS_ACCESS_KEY_ID : AWS Access Key ID (required)
- AWS_SECRET_KEY : AWS Secret Access Key (required)
- S3_REGION : S3 region (default: ap-northeast-1)
- S3_BUCKET : S3 Bucket (required)
- AUTH_USER : Basic Auth Username (required)
- AUTH_PASSWORD : Basic Auth Password (required)

## Load Balancer Health Check

Use "/health" as health checking path for Load Balancer. (Always returns status 200)
