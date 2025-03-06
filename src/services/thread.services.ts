import axios, { AxiosResponse } from 'axios';
const apiURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/"
export const getAllThreads = async (token: string) => {
    try{
        const res: AxiosResponse = await axios.get(apiURL + 'thread', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        // console.log('result: ', res);
        return res.data.thread;
        // console.log('result: ', res.data);
        // return res.data.thread;
    } catch(error){
        if(axios.isAxiosError(error)){
            console.error("axios error: ", error.response?.data || error.message)
            throw new Error(error.response?.data?.message || "something went wrong")
        }else{
            console.error('unexpected error: ', error);
            throw error;
        }
    }
}


// const apiURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/";

// export const getAllThreads = (token: string)=>{
//     fetch(apiURL + 'thread', {
//         method: 'GET',
//         headers: {
//             'authorization': `Bearer ${token}`
//         }
    
//       }).then((data)=>{
//         return data.json()
//       }).then((result) => {
//         return result;
//       }).catch((err)=>{
//         return err;
//       });
// };