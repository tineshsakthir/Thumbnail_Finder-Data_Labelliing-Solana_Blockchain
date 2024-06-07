

import { useState } from "react"

const CreateTask = () => {


  const [imageUrl, setImageUrl] = useState([])

  const handleChangeImage = (input: HTMLInputElement) => {
    if (input.files && input.files[0]) {
      const reader = new FileReader();

      reader.onload = function (e: ProgressEvent<FileReader>) {
        const bannerImg = document.getElementById('bannerImg') as HTMLImageElement;
        if (bannerImg) {
          bannerImg.src = (e.target as FileReader).result as string;
        }
      }

      reader.readAsDataURL(input.files[0]);
    }
  }
  return (
    <div>
      <div className="bg-violet-500 flex gap-5  m-4 p-7 flex-col ">
      <label htmlFor="taskName" className='text-3xl font-bold bg-pink-700'>Enter Task Name :</label>
      <input type="text" className='bg-red-500 w-96 border border-lime-950 border-l-fuchsia-950'  name='taskName' />
    </div>

    <div className="bg-amber-700 flex gap-5  m-4 p-7 flex-col ">
      {imageUrl.map((url : string,idx : number) => {
        return <img key={idx} src={url} alt="" />
      })}
    <label htmlFor="taskName" className='text-3xl font-bold bg-pink-700' >Select a Photo : </label>
      <input type="file" className="bg-blue-800" onChange= {(event)=>{ setImagesUrl([event.target.value]) ; console.log(event.target.value)}}/> // Wrap event.target.value in an array
    </div>
    </div>
  )
}

export default CreateTask