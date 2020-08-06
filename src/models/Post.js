const mongoose = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACESS_KEY,
  accessKeyId: process.env.AWS_ACESS_KEY_ID,
  region: process.env.AWS_DEFAULT_REGION,
});

const s3 = new aws.S3();

const PostSchema = new mongoose.Schema({
  name: String,
  size: Number,
  key: String,
  url: String,
  commentary: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.pre('save', function () {
  if (!this.url) {
    this.url = `${process.env.APP_URL}/files/${this.key}`;
  }
});

PostSchema.pre('remove', function () {
  console.log(process.env.STORAGE_TYPE === 's3');
  if (process.env.STORAGE_TYPE === 's3') {
    return s3
      .deleteObject({
        Bucket: process.env.BUCKET_NAME,
        Key: this.key,
      })
      .promise()
      .then((response) => {
        console.log(response.status);
      })
      .catch(
        (response) => {
          console.log(response.status);
        },
        function (err, data) {
          if (err) {
            console.log(err, err.stack);
          } else {
            console.log(data);
          }
        }
      );
  } else {
    return promisify(fs.unlink)(
      path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key)
    );
  }
});

module.exports = mongoose.model('Post', PostSchema, 'Post');
