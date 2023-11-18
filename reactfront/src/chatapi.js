import axios from 'axios';

const carApi = axios.create({
  baseURL: 'https://api.api-ninjas.com/v1/cars',
  headers: {
    'X-Api-Key': 'b1awqZAS5ObZ1zClBT5/JQ==WOkLgM0Bu8zFlx3K', // Replace with your actual API key
  }
});

export const fetchCarData = async (make, model, year) => {
    try {
      const response = await carApi.get('', {
        params: { make, model, year }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching car data:', error.response.status, error.response.data);
      throw error; // rethrow the error to propagate it up the call stack
    }
  };
  