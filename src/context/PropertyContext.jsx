import React, { createContext, useContext, useState } from "react";

const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([
    { id: "main", name: "Main Residence" },
    { id: "miami", name: "Condo – Miami" },
    { id: "austin", name: "Condo – Austin" },
  ]);

  const [selectedProperty, setSelectedProperty] = useState(properties[0]);

  const addProperty = (name) => {
    const id = name.toLowerCase().replace(/\s+/g, "-");
    const newProp = { id, name };
    setProperties((prev) => [...prev, newProp]);
    setSelectedProperty(newProp);
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        selectedProperty,
        setSelectedProperty,
        addProperty,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => useContext(PropertyContext);
