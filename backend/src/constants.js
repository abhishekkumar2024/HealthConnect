export const DB_NAME="user"

export const cloudinary_Path = "./healthcare/profiles/"
const multer_File_Path ="./healthcare/profiles/"

// if not exist then create the folder
import fs from "fs"
if (!fs.existsSync(multer_File_Path)){
    fs.mkdirSync(multer_File_Path, { recursive: true });
}

if (!fs.existsSync(cloudinary_Path)){
    fs.mkdirSync(cloudinary_Path, { recursive: true });
}
export default  multer_File_Path