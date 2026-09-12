import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";

const STATUS_COPY = {
  PENDING: {
    title: "Confirming your payment...",
    body: "This usually takes just a few seconds. If it's been longer than a minute, refresh this page.",
  },
  HELD: {
    title: "Payment confirmed!",
    body: "Your payment is held securely until you confirm you've received the item — you'll find that option on the listing page once it arrives.",
  },
  RELEASED: {
    title: "Payment already released",
    body: "This transaction is complete.",
  },
  DISPUTED: {
    title: "This transaction is under dispute",
    body: "An admin is reviewing it.",
  },
  REFUNDED: {
    title: "Payment refunded",
    body: "This transaction was refunded.",
  },
};

export default function TransactionCallback() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState("");

  function load() {
    api.getTransaction(id).then(setTransaction).catch((e) => setError(e.message));
  }

  useEffect(load, [id]);

  if (error) return <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-red-600">{error}</div>;
  if (!transaction) return <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-ink-500">Loading...</div>;

  const copy = STATUS_COPY[transaction.status] || { title: transaction.status, body: "" };

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="text-xl font-semibold mb-2">{copy.title}</h1>
      <p className="text-sm text-ink-500 mb-6">{copy.body}</p>
      {transaction.status === "PENDING" && (
        <button onClick={load} className="text-sm border border-ink-300 rounded-md px-4 py-2 hover:bg-ink-100 mb-4">
          Refresh status
        </button>
      )}
      <Link to={`/listing/${transaction.listingId}`} className="block text-sm text-brand-600 underline">
        Back to listing
      </Link>
    </div>
  );
}