import React from 'react';

export default function App() {
  return (
    <div className="container">
      {/* Correct semantic heading */}
      <header className="hero">
        <div className="top-bar" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '10px' }}>
          {/* VIOLATION: Mismatching label & generic word */}
          <button aria-label="Selector" className="currency-select-btn">USD</button>
          
          {/* VIOLATION: Generic button label */}
          <button aria-label="Button" className="search-btn">🔍</button>
        </div>
        <h1>Wanderlust Destinations</h1>
        <p>Find your next adventure under the sun</p>
      </header>

      {/* VIOLATION 1: Section header styled with css but using span */}
      <div className="section-container">
        <span className="_a8b9c">Popular Getaways</span>
        <div className="grid">
          <div className="card">
            {/* VIOLATION 2a: Card title using div */}
            <div className="_x1y2z">Explore Kyoto</div>
            <p>Experience Japan's historical heart with its magnificent temples, bamboo forests, and traditional tea ceremonies.</p>
            {/* VIOLATION: Generic link label */}
            <a href="#details" aria-label="Link" className="details-link">Learn More</a>
          </div>
          <div className="card">
            {/* VIOLATION 2b: Card title using div */}
            <div className="_x1y2z">Sunny Santorini</div>
            <p>Witness iconic blue-domed churches, volcanic black sand beaches, and the world's most spectacular sunsets.</p>
          </div>
        </div>
      </div>

      {/* VIOLATION 3: Form header using span */}
      <div className="newsletter-section">
        <span className="_m5n6o">Join Our Mailing List</span>
        <form onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Enter your email" aria-label="Email Address" />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </div>
  );
}
