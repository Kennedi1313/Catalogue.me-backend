import multer from 'multer'
import aws from 'aws-sdk'
import multerS3 from 'multer-s3'

aws.config.update({
    secretAccessKey: 'l3OCpPiwG7lGKgUhlQGKt9efLHYD6YHaLaLErjVo',
    accessKeyId: 'AKIASHXRPJMIGJ2H3HVX',
    region: 'sa-east-1'
});

const uploads = multer({
    storage: multerS3({
        s3: new aws.S3(),
        bucket: 'upload-catalogueme',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (req, file, callback) =>{
            callback(null, Date.now() + '-' + file.originalname)
        }
    })
    
})

export default uploads;