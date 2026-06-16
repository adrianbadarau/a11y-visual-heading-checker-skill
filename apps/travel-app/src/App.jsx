import React from 'react';

export default function App() {
  return (
    <div className="container">
      {/* Correct semantic heading */}
      <header className="hero">
        <h1>Wanderlust Destinations</h1>
        <p>Find your next adventure under the sun</p>
      </header>

      {/* VIOLATION 1 FIX: Changed span.pseudo-h2 to h2.pseudo-h2 */}
      <div className="section-container">
        <h2 className="pseudo-h2">Popular Getaways</h2>
        <div className="grid">
          <div className="card">
            {/* VIOLATION 2a FIX: Changed div.pseudo-h3 to h3.pseudo-h3 */}
            <h3 className="pseudo-h3">Explore Kyoto</h3>
            <p>Experience Japan's historical heart with its magnificent temples, bamboo forests, and traditional tea ceremonies.</p>
          </div>
          <div className="card">
            {/* VIOLATION 2b FIX: Changed div.pseudo-h3 to h3.pseudo-h3 */}
            <h3 className="pseudo-h3">Sunny Santorini</h3>
            <p>Witness iconic blue-domed churches, volcanic black sand beaches, and the world's most spectacular sunsets.</p>
          </div>
        </div>
      </div>

      {/* VIOLATION 3 FIX: Changed span.pseudo-form-title to h2.pseudo-form-title */}
      <div className="newsletter-section">
        <h2 className="pseudo-form-title">Join Our Mailing List</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Enter your email" aria-label="Email Address" />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </div>
  );
}
