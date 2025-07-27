import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [esgData, setEsgData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState('');

  useEffect(() => {
    const fetchEsgData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/esg-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEsgData(data);
        if (data.length > 0) {
            const uniqueDivs = [...new Set(data.map(item => item.Division))];
            if (uniqueDivs.length > 0) {
                setSelectedDivision(uniqueDivs[0]); // Set first division as default
            }
        }
      } catch (e) {
        setError(e);
        console.error("Failed to fetch ESG data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchEsgData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Arial' }}>Loading ESG data...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Arial', color: 'red' }}>Error: {error.message}. Make sure your backend API is running at http://127.0.0.1:8000</div>;
  }

  const uniqueDivisions = [...new Set(esgData.map(item => item.Division))];

  const filteredData = esgData.filter(item =>
    selectedDivision ? item.Division === selectedDivision : true
  );

  // --- NEW: Calculate Summary Data ---
  const latestYearData = filteredData.length > 0
    ? filteredData.reduce((prev, current) => (prev.Year > current.Year ? prev : current))
    : null;

  const latestCarbonEmissions = latestYearData ? latestYearData.CarbonEmissions_Tons : 'N/A';
  const latestWaterUsage = latestYearData ? latestYearData.WaterUsage_KL : 'N/A';
  const latestEmployeeDiversity = latestYearData ? latestYearData.EmployeeDiversity_Percentage : 'N/A';
  // --- End NEW Summary Data ---

  // --- Carbon Emissions Chart Data ---
  const yearsCarbon = filteredData.map(item => item.Year);
  const carbonEmissions = filteredData.map(item => item.CarbonEmissions_Tons);

  const chartDataCarbon = {
    labels: yearsCarbon,
    datasets: [
      {
        label: `Carbon Emissions (Tons)`,
        data: carbonEmissions,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
        fill: false
      },
    ],
  };

  const chartOptionsCarbon = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `${selectedDivision || 'All Divisions'} Carbon Emissions Over Time` },
    },
    scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Carbon Emissions (Tons)' } },
        x: { title: { display: true, text: 'Year' } }
    }
  };

  // --- Water Usage Chart Data ---
  const yearsWater = filteredData.map(item => item.Year);
  const waterUsage = filteredData.map(item => item.WaterUsage_KL);

  const chartDataWater = {
    labels: yearsWater,
    datasets: [
      {
        label: `Water Usage (KL)`,
        data: waterUsage,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
        fill: false
      },
    ],
  };

  const chartOptionsWater = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `${selectedDivision || 'All Divisions'} Water Usage Over Time` },
    },
    scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Water Usage (KL)' } },
        x: { title: { display: true, text: 'Year' } }
    }
  };

  // --- Employee Diversity Chart Data ---
  const yearsDiversity = filteredData.map(item => item.Year);
  const employeeDiversity = filteredData.map(item => item.EmployeeDiversity_Percentage);

  const chartDataDiversity = {
    labels: yearsDiversity,
    datasets: [
      {
        label: `Employee Diversity (%)`,
        data: employeeDiversity,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
        fill: false
      },
    ],
  };

  const chartOptionsDiversity = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `${selectedDivision || 'All Divisions'} Employee Diversity Over Time` },
    },
    scales: {
        y: { beginAtZero: true, min: 0, max: 100, title: { display: true, text: 'Diversity Percentage (%)' } },
        x: { title: { display: true, text: 'Year' } }
    }
  };


  return (
    <div style={{ fontFamily: 'Arial', padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Tata Quick Insights ESG Dashboard</h1>
        <p>Visualizing key environmental and social data.</p>
      </header>
      <main>
        {/* Division Selection Dropdown */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <label htmlFor="division-select" style={{ marginRight: '10px', fontSize: '1.1em' }}>Select Division:</label>
          <select
            id="division-select"
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">-- Select a Division --</option>
            {uniqueDivisions.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </select>
        </div>

        {/* Conditional rendering based on filtered data availability */}
        {filteredData.length > 0 ? (
          <div>
            {/* NEW: Summary Cards Section */}
            {latestYearData && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        backgroundColor: '#e8f5e9', // Light green
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        borderLeft: '5px solid #4CAF50' // Green border
                    }}>
                        <h3>Carbon Emissions ({latestYearData.Year})</h3>
                        <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#333' }}>
                            {latestCarbonEmissions} Tons
                        </p>
                    </div>
                    <div style={{
                        backgroundColor: '#e3f2fd', // Light blue
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        borderLeft: '5px solid #2196F3' // Blue border
                    }}>
                        <h3>Water Usage ({latestYearData.Year})</h3>
                        <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#333' }}>
                            {latestWaterUsage} KL
                        </p>
                    </div>
                    <div style={{
                        backgroundColor: '#fbe9e7', // Light red/pink
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        borderLeft: '5px solid #FF5722' // Orange/red border
                    }}>
                        <h3>Employee Diversity ({latestYearData.Year})</h3>
                        <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#333' }}>
                            {latestEmployeeDiversity}%
                        </p>
                    </div>
                </div>
            )}
            {/* End NEW Summary Cards Section */}

            {/* Carbon Emissions Chart Section */}
            <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <h2>Carbon Emissions ({selectedDivision || 'All Divisions'})</h2>
              <Line data={chartDataCarbon} options={chartOptionsCarbon} />
            </div>

            {/* Water Usage Chart Section */}
            <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <h2>Water Usage ({selectedDivision || 'All Divisions'})</h2>
              <Line data={chartDataWater} options={chartOptionsWater} />
            </div>

            {/* Employee Diversity Chart Section */}
            <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <h2>Employee Diversity ({selectedDivision || 'All Divisions'})</h2>
              <Line data={chartDataDiversity} options={chartOptionsDiversity} />
            </div>

          </div>
        ) : (
          <p style={{ textAlign: 'center', fontSize: '1.2em', color: '#666' }}>No data available for the selected division. Please choose another.</p>
        )}
      </main>
    </div>
  );
}

export default App;