import {v2 as cloudinary} from "cloudinary"

cloudinary.config({ 
    cloud_name: process.env.cloud_name, 
    api_key: process.env.api_key, 
    api_secret: process.env.api_secret 
});
import fs from "fs"
import ApiErrors from "../utils/ApiError.utils.js";



export const uploadToCloudinary= async (cloudinary_Path)=>{
    try {
        if (!cloudinary_Path) return null
        console.log(cloudinary)
        const response=await cloudinary.uploader.upload(cloudinary_Path,{
            resource_type:"auto"
        })
        if(response){ 
            console.log(`File is succesfully Aploaded at cloudinary!! URL is : ${response.url}`)
        }
        fs.unlinkSync(cloudinary_Path,()=>{
          console.log(`file has been successfully removed from ${cloudinary_Path}`)
        })
        return response
    } catch (error) {
        fs.unlinkSync(cloudinary_Path,()=>{
            console.log('File has removed from temp!');
        })
        console.log(`\n error : ${error}`)
        return null
    }
  }
export const cloudinaryDeleteFile=async(videoPublicId)=>{
    cloudinary.api.delete_resources([videoPublicId], 
      { type: 'upload', resource_type: 'video' })
    .then(console.log('video is successfully deleted')).catch((error)=>{
      console.log(error)
    });
  }
export const cloudinaryDeletePhoto=async(videoPublicId)=>{
    cloudinary.api.delete_resources([videoPublicId], 
      { type: 'upload', resource_type: 'image' })
    .then(console.log('photo is successfully deleted')).catch((error)=>{
      console.log(error)
    });
  }
  