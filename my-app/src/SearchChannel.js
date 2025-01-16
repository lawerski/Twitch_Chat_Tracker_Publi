import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SearchChannel.css";

const SearchChannel = () => {
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [userQuery, setUserQuery] = useState(""); 
  const [sortOption, setSortOption] = useState("lastUpdated");
  const [startDate, setStartDate] = useState(""); 
  const [endDate, setEndDate] = useState(""); 

  const [expandedMetrics, setExpandedMetrics] = useState({});
  const [aggregatedData, setAggregatedData] = useState([]); // Nowy stan na dane agregacji
  const [showAggregation, setShowAggregation] = useState(false); // Czy wyświetlać tabelę

  // Fetch initial metrics data
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get("http://188.68.236.115:5001/metrics");
        setResult(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching metrics:", error);
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Search handler
  const handleSearch = async () => {
    try {
      const response = await axios.get("http://188.68.236.115:5001/search", {
        params: {
          channel: searchQuery,
          username: userQuery,
          startDate: startDate,
          endDate: endDate,
        },
      });
      setResult(response.data);
    } catch (error) {
      console.error("Search Error:", error);
    }
  };

  // Sorting handler
  const handleSortChange = (e) => {
    const selectedOption = e.target.value;
    setSortOption(selectedOption);

    const sortedData = [...result].sort((a, b) => {
      if (selectedOption === "lastUpdated") {
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      } else if (selectedOption === "viewer_count") {
        return b.streamInfo.viewer_count - a.streamInfo.viewer_count;
      } else if (selectedOption === "streamId") {
        return a.streamId.localeCompare(b.streamId);
      } else if (selectedOption === "messagesCount") {
        const messageCountA = Object.values(a.metrics.messages || {}).reduce(
          (acc, count) => acc + count,
          0
        );
        const messageCountB = Object.values(b.metrics.messages || {}).reduce(
          (acc, count) => acc + count,
          0
        );
        return messageCountB - messageCountA;
      } else if (selectedOption === "streamsCount") {
        return b.streamId.localeCompare(a.streamId);
      }
      return 0;
    });

    setResult(sortedData);
  };

  // Toggle metrics visibility
  const toggleMetrics = (index) => {
    setExpandedMetrics((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Fetch aggregation data
  // Fetch aggregation data
const handleAggregation = async () => {
  try {
    const response = await axios.get("http://188.68.236.115:5001/aggregate");
    setAggregatedData(response.data); // Update aggregatedData state
    setShowAggregation(true); // Set showAggregation to true to display the table
  } catch (error) {
    console.error("Error fetching aggregated data:", error);
    setShowAggregation(false); // Ensure showAggregation is false on error (optional)
  }
};


  return (
    <div className="search-channel-container">
      {/* Search input fields */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Szukaj po kanale..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Szukaj po użytkowniku w metrykach..."
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Szukaj
        </button>
        <button onClick={handleAggregation} className="aggregation-button">
          Pokaż dane agregacji
        </button>
      </div>

      {/* Date filters */}
      <div className="date-filter-container">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="date-input"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="date-input"
        />
        <button onClick={handleSearch} className="search-button">
          Filtruj po dacie
        </button>
      </div>

      {/* Sort options */}
      <div className="sort-options">
        <label>Sortuj według: </label>
        <select
          value={sortOption}
          onChange={handleSortChange}
          className="sort-dropdown"
        >
          <option value="lastUpdated">Ostatnia aktualizacja</option>
          <option value="viewer_count">Liczba widzów</option>
          <option value="streamId">ID strumienia</option>
          <option value="messagesCount">Liczba wiadomości</option>
        </select>
      </div>

      {showAggregation && aggregatedData.length > 0 ? (
  <div className="aggregation-table">
    <h3>Zagregowane dane</h3>
    <table>
      <thead>
        <tr>
          <th>Kanał</th>
          <th>Użytkownik</th>
          <th>Wiadomości</th>
        </tr>
      </thead>
      <tbody>
        {aggregatedData.map((item, index) => (
          <tr key={index}>
            <td>{item._id}</td> {/* Channel Name */}
            <td>{item.topUser}</td> {/* Top User */}
            <td>{item.messageCount}</td> {/* Message Count */}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : showAggregation && aggregatedData.length === 0 ? (
  <p>Brak danych do wyświetlenia.</p>
) : null}


      {/* Metrics results */}
      {loading ? (
        <p>Ładowanie...</p>
      ) : (
        <div className="result-container">
          {result && result.length > 0 ? (
            result.map((item, index) => (
              <div key={index} className="result-item">
                <h3 className="channel-name">Kanał: {item.channel}</h3>
                <p>
                  <strong>ID Strumienia:</strong> {item.streamId}
                </p>
                <p>
                  <strong>Ostatnia aktualizacja:</strong>{" "}
                  {new Date(item.lastUpdated).toLocaleString()}
                </p>

                <div className="stream-info-container">
                  <p>
                    <strong>Informacje o strumieniu:</strong>
                  </p>
                  <p>
                    <strong>Gra:</strong> {item.streamInfo.game_name}
                  </p>
                  <p>
                    <strong>Liczba widzów:</strong> {item.streamInfo.viewer_count}
                  </p>
                  <p>
                    <strong>Rozpoczęty:</strong>{" "}
                    {new Date(item.streamInfo.started_at).toLocaleString()}
                  </p>
                  <p>
                    <strong>Język:</strong> {item.streamInfo.language}
                  </p>
                  <p>
                    <strong>Tytuł strumienia:</strong> {item.streamInfo.title}
                  </p>
                  <p>
                    <strong>Tagi:</strong>{" "}
                    {item.streamInfo.tags.join(", ") || "Brak tagów"}
                  </p>
                  <p>
                    <strong>Treści dla dorosłych:</strong>{" "}
                    {item.streamInfo.is_mature ? "Tak" : "Nie"}
                  </p>
                </div>

                <button
                  className="toggle-metrics-button"
                  onClick={() => toggleMetrics(index)}
                >
                  {expandedMetrics[index]
                    ? "Zwiń metryki"
                    : "Pokaż metryki"}
                </button>

                {expandedMetrics[index] && (
                  <div className="metrics-container">
                    <p>
                      <strong>Metryki:</strong>
                    </p>
                    <div className="metrics-section">
                      <p>
                        <strong>Wiadomości:</strong>
                      </p>
                      {item.metrics.messages ? (
                        <ul>
                          {Object.entries(item.metrics.messages).map(
                            ([username, count]) => (
                              <li key={username}>
                                {username}: {count}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p>Brak danych o wiadomościach</p>
                      )}
                    </div>

                    <div className="metrics-section">
                      <p>
                        <strong>XD Count:</strong>
                      </p>
                      {item.metrics.xdCount ? (
                        <ul>
                          {Object.entries(item.metrics.xdCount).map(
                            ([username, count]) => (
                              <li key={username}>
                                {username}: {count}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p>Brak danych o XD count</p>
                      )}
                    </div>

                    <div className="metrics-section">
                      <p>
                        <strong>Plus One:</strong> {item.metrics.plusOne}
                      </p>
                    </div>

                    <div className="metrics-section">
                      <p>
                        <strong>Minus One:</strong> {item.metrics.minusOne}
                      </p>
                    </div>
                  </div>
                )}

                <hr />
              </div>
            ))
          ) : (
            <p>Brak wyników</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchChannel;
