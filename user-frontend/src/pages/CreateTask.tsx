

import axios from "axios";
import React, { ChangeEvent, useState } from "react"
import { useCookies } from "react-cookie";
import { getPresignedUrl, submitTask } from "../utils/submitTask";

const CreateTask = () => {

  const  [title, setTitle] = useState("") ; 
  const [cookie, setCookie] = useCookies(["access_token"]);
  const [imageUrl, setImageUrl] = useState<string[]>(["" , ""]);

  const [files, setFiles] = useState<(File | null)[]>([null, null]);

  const handleChangeImage = (event: ChangeEvent<HTMLInputElement>, idx : number) => {
    if (event.target.files && event.target.files[0]) {


      const updatedFiles = [...files] ;
      updatedFiles[idx] = event.target.files[0] ; 
      setFiles(updatedFiles) ; 
      console.log(updatedFiles) ; 

      const url = URL.createObjectURL(event.target.files[0]);
      const updatedImageUrl = [...imageUrl] ; 
      updatedImageUrl[idx] = url ; 
      setImageUrl(updatedImageUrl) ; 
      console.log(updatedImageUrl) ;
    }
  }

  const handleAddAnotherImage = () => {
    setImageUrl([...imageUrl, "" ]) ; 
    setFiles([...files, null]) 
  }

  const handleDeleteChoosenImage = (delIdx : number) => {
    if(imageUrl.length == 2) {
      alert("Minimum two Images required to submit the task!!!")
      return ;
    } 

    let tempImageUrl : string[] = [...imageUrl] ; 
    tempImageUrl = tempImageUrl.filter( (_, idx) => idx!=delIdx)
    setImageUrl(tempImageUrl) ; 

    let tempFile : (File | null)[]= [...files] ;
    tempFile = tempFile.filter((_,idx) => idx!=delIdx) ; 
    setFiles(tempFile) ; 
  }


  const handleTaskSubmission = async () => {

    if(title == "") {
      alert("Please fill the title") ;
      return ; 
    }

    for(const image of imageUrl){
      if(image == ""){
        alert("Please select image in all the input box or else delete them") ; 
        return  ; 
      }
    }

    // console.log(await getPresignedUrl(cookie.access_token)) ;
    const res = await submitTask(cookie.access_token , files, title) ; 
    console.log(res) ; 
  }





  return (
    <div className="bg-pink-700 flex flex-col justify-center items-center">
      <div className="bg-violet-500 flex gap-5  m-4 p-7 flex-col ">
        <label htmlFor="taskName" className='text-3xl font-bold bg-pink-700'>Enter Task Name :</label>
        <input 
        type="text" 
        className='bg-red-500 w-96 border border-lime-950 border-l-fuchsia-950' 
        name='taskName'
        onChange={(e)=> setTitle(e.target.value)} 
        />
      </div>

      {imageUrl.map((ele: string, idx: number) => {
        return <div className="bg-amber-700 flex gap-5  m-4 p-7 flex-col " key ={`${idx}div` }>
          <label key ={`${idx}label` } htmlFor="taskName" className='text-3xl font-bold bg-amber-500' >Select a Photo <span className="text-red-900 bg-pink-400">**</span> </label>
          <input key ={`${idx}photoInput` } type="file" className="bg-blue-800" onChange={(event) => { handleChangeImage(event, idx) }} required />
          <img key ={`${idx}phto` } src={imageUrl[idx]} alt="" id={`${idx}`} />
          <button key ={`${idx}btn` } className="bg-red-800" onClick={()=>{handleDeleteChoosenImage(idx)}}>delete Image</button>
        </div>
      })}
      <button className="bg-purple-900 w-[60%] px-4 py-2 mb-5" onClick={handleAddAnotherImage}>Add Another Image</button>

      <button className="bg-green-400 w-[40%] px-4 py-2 mt-2 mb-6 rounded-2xl" onClick={handleTaskSubmission}>Sumbit</button>
    </div>
  )
}

export default CreateTask



