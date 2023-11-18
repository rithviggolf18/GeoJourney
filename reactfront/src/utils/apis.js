// utils/api.js
import axios from 'axios';


const appId = process.env.REACT_APP_APP_ID;
const hashToken = process.env.REACT_APP_HASH_TOKEN;
const apiToken = process.env.ACCESS_TOKEN
const apiEndPoint = process.env.ENDPOINT

// export const getApiToken = () => {
//   return axios.get('https://api.iq.inrix.com/auth/v1/appToken?appId=m78ia9kkql&hashToken=bTc4aWE5a2txbHw1c2FCc3gzNUhlN3NHWGJSNjVpT3k3aWdLamtpMWpPTTE2cVl0QUhM');
// };

export const getIncidents = () => {
    // Replace 'IncidentsApiEndpoint' and 'YourApiToken' with your actual values
    return axios.get('apiEndPoint', {
      headers: {
        'Authorization': `Bearer ${'apiToken'}`
      }
    });
  };