import React from 'react';

export default function App() {
  return (
    <div className="container">
      {/* Correct semantic heading */}
      <header className="hero">
        <h1>Wanderlust Destinations</h1>
        <p>Find your next adventure under the sun</p>
      </header>

      {/* VIOLATION 1: Section header styled with css but using span */}
      <div className="section-container">
        <span className="pseudo-h2">Popular Getaways</span>
        <div className="grid">
          <div className="card">
            {/* VIOLATION 2a: Card title using div */}
            <div className="pseudo-h3">Explore Kyoto</div>
            <p>Experience Japan's historical heart with its magnificent temples, bamboo forests, and traditional tea ceremonies.</p>
          </div>
          <div className="card">
            {/* VIOLATION 2b: Card title using div */}
            <div className="pseudo-h3">Sunny Santorini</div>
            <p>Witness iconic blue-domed churches, volcanic black sand beaches, and the world's most spectacular sunsets.</p>
          </div>
        </div>
      </div>

      {/* VIOLATION 3: Form header using span */}
      <div className="newsletter-section">
        <span className="pseudo-form-title">Join Our Mailing List</span>
        <form onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Enter your email" aria-label="Email Address" />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </div>
  );
}
