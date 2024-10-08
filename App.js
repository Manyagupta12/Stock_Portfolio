import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import "./App.css";

// Stocks Component to display available stocks
const Stocks = ({ watchlist, addToWatchlist, removeFromWatchlist }) => {
  const [stocks, setStocks] = useState([]);
  const [loadingSymbol, setLoadingSymbol] = useState(""); // Track which stock is being added/removed

  useEffect(() => {
    // Fetch available stocks from the server
    const getData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/stocks");
        if (!res.ok) throw new Error("Failed to fetch stocks");
        const data = await res.json();
        setStocks(data);
      } catch (error) {
        console.error("Error fetching stocks:", error);
      }
    };

    getData();
  }, []);

  // Check if a stock is in the watchlist
  const isInWatchlist = (stockSymbol) => {
    return watchlist.some((stock) => stock.symbol === stockSymbol);
  };

  return (
    <div className="App">
      <h1>Stock Market MERN App</h1>
      <h2>Stocks</h2>
      <ul>
        {stocks.map((stock) => (
          <li key={stock.symbol}>
            {stock.company} ({stock.symbol}) - 
            <span style={{ color: stock.priceChange >= 45 ? "green" : "red" }}>
              ${stock.initial_price}
            </span>
            {isInWatchlist(stock.symbol) ? (
              <button
                disabled={loadingSymbol === stock.symbol}
                onClick={() => {
                  setLoadingSymbol(stock.symbol);
                  removeFromWatchlist(stock).finally(() => setLoadingSymbol(""));
                }}
              >
                {loadingSymbol === stock.symbol ? "Removing..." : "Remove from Watchlist"}
              </button>
            ) : (
              <button
                disabled={loadingSymbol === stock.symbol}
                onClick={() => {
                  setLoadingSymbol(stock.symbol);
                  addToWatchlist(stock).finally(() => setLoadingSymbol(""));
                }}
              >
                {loadingSymbol === stock.symbol ? "Adding..." : "Add to Watchlist"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Watchlist Component to display list of stocks in the user's watchlist
const Watchlist = ({ watchlist, removeFromWatchlist }) => {
  return (
    <div className="App">
      <h1>Stock Market MERN App</h1>
      <h2>My Watchlist</h2>
      <ul>
        {watchlist.map((stock) => (
          <li key={stock.symbol}>
            {stock.company} ({stock.symbol}) - 
            <span style={{ color: stock.priceChange >= 0 ? "green" : "red" }}>
              ${stock.initial_price}
            </span>
            <button onClick={() => removeFromWatchlist(stock)}>
              Remove from Watchlist
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Main App Component
function App() {
  const [watchlist, setWatchlist] = useState([]);

  // Fetch the watchlist from the server on component mount
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/watchlist");
        if (!res.ok) throw new Error("Failed to fetch watchlist");
        const data = await res.json();
        setWatchlist(data);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      }
    };

    fetchWatchlist();
  }, []);

  // Add stock to watchlist and save to server
  const addToWatchlist = (stock) => {
    return fetch("http://localhost:5000/api/watchlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stock),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add stock to watchlist");
        return res.json();
      })
      .then(() => {
        setWatchlist([...watchlist, stock]); // Update state with new watchlist
      })
      .catch((error) => console.error("Error adding to watchlist:", error));
  };

  // Remove stock from watchlist and delete from server
  const removeFromWatchlist = (stock) => {
    return fetch(`http://localhost:5000/api/watchlist/${stock.symbol}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to remove stock from watchlist");
        return res.json();
      })
      .then(() => {
        setWatchlist(watchlist.filter((item) => item.symbol !== stock.symbol)); // Remove from local state
      })
      .catch((error) => console.error("Error removing from watchlist:", error));
  };

  return (
    <Router>
      <nav>
        <NavLink to="/stocks">Stocks</NavLink>
        <NavLink to="/watchlist">Watchlist</NavLink>
      </nav>
      <Routes>
        <Route
          path="/stocks"
          element={<Stocks watchlist={watchlist} addToWatchlist={addToWatchlist} removeFromWatchlist={removeFromWatchlist} />}
        />
        <Route
          path="/watchlist"
          element={<Watchlist watchlist={watchlist} removeFromWatchlist={removeFromWatchlist} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
