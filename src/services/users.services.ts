const apiURL = import.meta.env.VITE_API_URL || "https://circle-be-gules.vercel.app/api/";

export const getAllusers = (token: string)=>{
    fetch(apiURL + 'users', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    
      }).then((data)=>{
        return data.json()
      }).then((result) => {
        console.log(result);
      }).catch((err)=>{
        console.log(err);
      });
};
