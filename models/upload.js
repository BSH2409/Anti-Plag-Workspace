const multer =require("multer");

const obj = {};

const image_adhaar_storage = multer.diskStorage({
    destination:'./assets/images/adhaar',
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}_${file.originalname}`)
    }
})
const image_flat_storage = multer.diskStorage({
    destination:'./assets/images/flats',
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}_${file.originalname}`)
    }
})

const image_flat_other_storage = multer.diskStorage({
    destination:'./assets/images/flats/others',
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}_${file.originalname}`)
    }
})

const image_profile_storage = multer.diskStorage({
    destination:'./assets/images/profile',
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}_${file.originalname}`)
    }
})

obj.adhaar = multer({storage:image_adhaar_storage});
obj.profile = multer({storage:image_profile_storage});
obj.flat = multer({storage:image_flat_storage});
obj.flatOther = multer({storage:image_flat_other_storage});

module.exports = obj;


//const multer =require("multer");
// const storage = multer.diskStorage({
//     destination:'./assets/images/adhaar',
//     filename:(req,file,cb)=>{
//         return cb(null,`${Date.now()}_${file.originalname}`)
//     }
// })
// const upload = multer({storage:storage})