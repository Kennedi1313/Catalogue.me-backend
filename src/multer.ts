import multer from 'multer'

const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, callback) =>{
        callback(null, file.fieldname + '-' + file.originalname)
    }
})

const uploads = multer({ storage: storage  })

export default uploads;