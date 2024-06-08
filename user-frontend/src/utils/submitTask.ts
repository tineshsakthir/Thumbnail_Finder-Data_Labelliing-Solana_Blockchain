import axios from "axios";
import { BACKEND_URL } from "../configuration/config";

export const getPresignedUrl = async (access_token: string) => {
    const response = await axios.get(`${BACKEND_URL}/user/presignedUrl` , {
      headers : {
        Authorization : access_token
      }
    }) ; 
    return response.data
}

export const submitTask = async (access_token: string, files : (File | null)[] , title : string) => {

    const options : {
        option_number : number ,
        imageUrl : string
    }[] = [];
    
    for(let index = 0 ; index < files.length ; index++){

        const file : File | null = files[index] ; 
        if(file == null) continue ;

        const presignedUrlData = await getPresignedUrl(access_token) ; 
        const formData = new FormData() ; 
        // Loop through the fields object and append each field to the form data
        const fields = presignedUrlData.fields;
        formData.append("Content-Type" ,  fields["Content-Type"]) ;
        formData.append("bucket", fields["bucket"]) ;
        formData.append("X-Amz-Algorithm" , fields["X-Amz-Algorithm"]) ; 
        formData.append("X-Amz-Credential", fields["X-Amz-Credential"]) ; 
        formData.append("X-Amz-Date", fields["X-Amz-Date"]) ;
        formData.append("key", fields["key"]) ;
        formData.append("Policy", fields["Policy"]) ;
        formData.append("X-Amz-Signature", fields["X-Amz-Signature"]) ;
        formData.append("file", file) ; 

        options.push(
            {   
                option_number : index+1 ,
                imageUrl : fields["key"] 
            }
        )
        const response = await axios.post(presignedUrlData.url , formData) ; 
        console.log(response.data) ; 
        console.log(file , "\n\nFIleE uploaded")
    }


    const taskInfo = {
        options: options ,
        signature : "myPaymentSignatureForTask 3" ,
        title : title
    };


    informTaskInfoToBacked(taskInfo, access_token) ; 

    return "Task successfully submitted" ; 
}



export const informTaskInfoToBacked = async (taskInfo: {
    options : {
        option_number : number ,
        imageUrl : string
    }[] , 
    signature : string , 
    title : string }, access_token : string) => {

        await axios.post(`${BACKEND_URL}/user/task` , taskInfo , {
            headers : {
                Authorization : access_token
            }
        })
}


