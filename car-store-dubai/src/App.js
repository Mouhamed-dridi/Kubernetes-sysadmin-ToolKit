import React from "react";
import "./App.css";

import bmwM4 from "./image/BMW-M4-png-952x577.webp";
import bmwI4 from "./image/bmw-i4-gran-coupe1.webp";
import toyota from "./image/toyota.avif";
import tesla from "./image/tesla.webp";
import porsche from "./image/porcha.avif";
import mercedes from "./image/mercidec.jpg";
import honda from "./image/honda.png";

const cars = [
    { name: "BMW M4 Coupe", price: 266500, tag: "Free Test Drive", image: bmwM4 },
    { name: "BMW i4 M Sport", price: 252720, tag: "Full Electric", image: bmwI4 },
    { name: "Toyota GR Supra", price: 185450, tag: "Best Seller", image: toyota },
    { name: "Tesla Model S", price: 167250, tag: "Full Electric", image: tesla },
    { name: "Honda Civic Type R", price: 95120, tag: "New Release", image: honda },
    { name: "Porsche Taycan", price: 90900, tag: "Free Test Drive", image: porsche },
    { name: "Mercedes AMG GT", price: 300000, tag: "Luxury", image: mercedes },
];

function App() {
    return (
        <div className="app">
            <header>
                <h1>Super Car Shop</h1>
                <div className="actions">
                    <button>Buy Car</button>
                    <button>Rent Car</button>
                    <button>Sell Car</button>
                </div>
            </header>

            <div className="car-grid">
                {cars.map((car, index) => (
                    <div key={index} className="car-card">
                        <img
                            src={car.image || `https://source.unsplash.com/400x200/?${car.name}`}
                            alt={car.name}
                        />
                        <h2>{car.name}</h2>
                        <p>${car.price.toLocaleString()}</p>
                        <span className="tag">{car.tag}</span>
                        <button className="pay-btn">Pay Now</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
