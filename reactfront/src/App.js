/*app.js*/
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { auth } from './firebase';
import Signin from './components/Signin';
import Map from './map';
import Home from './components/Home';
import Incident from './components/Incident';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Set up a Firebase authentication observer
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });
  
    // Cleanup the observer when the component unmounts
    return () => unsubscribe();
  }, []);
  
  const handleSignOut = () => {
    auth.signOut();
    localStorage.clear()
    window.location.reload()
  };
  
  const getFirstName = (fullName) => {
    const names = fullName.split(' ');
    return names[0];
  };

  return (
    <Router>
      <div>
        <nav>
          <div className="nav-container">
          <ul>
            <div className="tags">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/map">Map</Link>
            </li>
            <li>
              <Link to="/incident">Incidents</Link>
            </li>
            </div>
            <div className="title">
              <li>GeoJourney</li>
            </div>
            <li>
              {user ? (
                <>
                  <span className = "welcome-message">Welcome, {getFirstName(user.displayName)}!</span>
                  <button onClick={handleSignOut}>Sign Out</button>
                </>
              ) : (
                <div className = "signin">
                <Link to="/signin">Sign-in</Link>
                </div>
              )}
            </li>
          </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/incident" element={<Incident />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
