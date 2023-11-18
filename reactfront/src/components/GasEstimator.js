import React, { useState, useEffect } from 'react';
import { useCollapse } from 'react-collapsed'; // Correct import
import { fetchCarData } from '../chatapi'; // Assuming carApi.js is in the same directory

function GasEstimator({ totalDistance }) {
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [years, setYears] = useState([]);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [tankFullness, setTankFullness] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const carData = await fetchCarData();
      setMakes(carData.makes);
      setModels(carData.models);
      setYears(carData.years);
    };

    fetchData();
  }, []);

  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const carData = await fetchCarData(make, model, year);
      // Assuming carData contains fuelEconomy
      const fuelEconomy = carData.fuelEconomy;
      const gasConsumption = totalDistance / fuelEconomy;
      const remainingGas = tankFullness - gasConsumption;

      setResult(remainingGas);
    } catch (error) {
      console.error('Failed to fetch car data:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <select value={make} onChange={e => setMake(e.target.value)}>
          {makes.map(make => <option key={make} value={make}>{make}</option>)}
        </select>
        <select value={model} onChange={e => setModel(e.target.value)}>
          {models.map(model => <option key={model} value={model}>{model}</option>)}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)}>
          {years.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
        <input type="text" value={tankFullness} onChange={e => setTankFullness(e.target.value)} placeholder="Tank Fullness" />
        <button type="submit">Estimate</button>
      </form>
      <div {...getCollapseProps()}>
        {result && <p>Estimated remaining gas: {result}</p>}
      </div>
    </div> // Close the div element
  );
}
export default GasEstimator;
