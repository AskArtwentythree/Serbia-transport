import React, { useState } from "react";

function AddressSearch({ onAddressSelect, placeholder, value, onClear }) {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);

  // Mock addresses in Belgrade
  const mockAddresses = [
    { name: "Republic Square, Belgrade", lat: 44.8179, lng: 20.4569 },
    { name: "Knez Mihailova Street, Belgrade", lat: 44.8172, lng: 20.4565 },
    { name: "Skadarlija, Belgrade", lat: 44.8167, lng: 20.4578 },
    { name: "Zemun, Belgrade", lat: 44.8453, lng: 20.4014 },
    { name: "New Belgrade, Belgrade", lat: 44.8056, lng: 20.4094 },
    { name: "Vračar, Belgrade", lat: 44.7992, lng: 20.4692 },
    { name: "Students' Square, Belgrade", lat: 44.8182, lng: 20.4575 },
    { name: "Kalemegdan, Belgrade", lat: 44.8236, lng: 20.4492 },
    { name: "Ada Ciganlija, Belgrade", lat: 44.7867, lng: 20.4139 },
    { name: "Nikola Tesla Airport, Belgrade", lat: 44.8184, lng: 20.2903 },
  ];

  const filteredAddresses = mockAddresses.filter((addr) =>
    addr.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (address) => {
    setInputValue(address.name);
    setIsOpen(false);
    onAddressSelect(address);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleClear = () => {
    setInputValue("");
    onClear();
  };

  return (
    <div
      className="address-search"
      style={{ position: "relative", width: "100%" }}
    >
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "12px 40px 12px 12px",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
            fontSize: "14px",
          }}
        />
        {inputValue && (
          <button
            onClick={handleClear}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontSize: "18px",
            }}
          >
            ×
          </button>
        )}
      </div>

      {isOpen && inputValue && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            boxShadow: "var(--shadow-lg)",
            zIndex: 1000,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {filteredAddresses.length > 0 ? (
            filteredAddresses.map((address, index) => (
              <div
                key={index}
                onClick={() => handleSelect(address)}
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "var(--bg-tertiary)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                }}
              >
                <div style={{ fontWeight: "500" }}>{address.name}</div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    marginTop: "2px",
                  }}
                >
                  {address.lat.toFixed(4)}, {address.lng.toFixed(4)}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "12px",
                color: "var(--text-secondary)",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              Address not found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AddressSearch;
