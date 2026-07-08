import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function Clients() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/accountant/clients`)
      .then((res) => res.json())
      .then((data) => setClients(data));
  }, []);

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-8">
        My Clients
      </h1>

      <div className="grid grid-cols-3 gap-6">

        {clients.map((client) => (

          <Link
            key={client.email}
            to={`/accountant/client/${client.email}`}
            className="bg-white rounded-xl shadow p-6 hover:shadow-xl transition"
          >

            <h2 className="text-xl font-semibold">
              {client.name}
            </h2>

            <p className="text-gray-500 mt-2">
              {client.email}
            </p>

          </Link>

        ))}

      </div>

    </div>
  );
}