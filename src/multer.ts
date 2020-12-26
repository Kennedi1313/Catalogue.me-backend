import multer from 'multer'
import aws from 'aws-sdk'
import multerS3 from 'multer-s3'

const storageTypes = {
    local: multer.diskStorage({
        destination: './public/uploads',
        filename: (req, file, callback) =>{
            callback(null, file.fieldname + '-' + file.originalname)
        }
    }),
    s3: multerS3({
        s3: new aws.S3(),
        bucket: 'upload-catalogueme',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (req, file, callback) =>{
            callback(null, Date.now() + '-' + file.originalname)
        }
    })
    
}


const uploads = multer({ storage: storageTypes.s3  })


export default uploads;