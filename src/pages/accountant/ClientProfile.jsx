import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function ClientProfile() {

  const { email } = useParams();

  const [client, setClient] = useState(null);

  useEffect(() => {

    fetch(`${BASE_URL}/accountant/client/${email}`)
      .then((res) => res.json())
      .then((data) => setClient(data));

  }, [email]);

  if (!client)
    return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        {client.client.name}
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h2>Receipts</h2>

          <p className="text-3xl font-bold">
            {client.receipts.length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2>Transactions</h2>

          <p className="text-3xl font-bold">
            {client.transactions.length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2>Mileage</h2>

          <p className="text-3xl font-bold">
            {client.mileage.length}
          </p>
        </div>

      </div>

    </div>
  );
}