import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PremiumUpload from "../components/PremiumUpload";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const SellTicket = () => {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [resultStatus, setResultStatus] = useState("processing");
  const [resultMessage, setResultMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        const res = await axios.get(`${API}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(res.data);
      } catch (err) {
        console.error("PROFILE ERROR:", err);
      }
    };

    const fetchBookings = async () => {
      if (!token) return;

      try {
        const res = await axios.get(`${API}/api/bookings/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("BOOKINGS ERROR:", err);
        setBookings([]);
      }
    };

    fetchProfile();
    fetchBookings();
  }, [token]);

  const selectedBooking = useMemo(
    () =>
      bookings.find(
        (booking) =>
          String(booking._id) === String(selectedBookingId)
      ),
    [bookings, selectedBookingId]
  );

  useEffect(() => {
    if (selectedBooking) {
      setLocation(selectedBooking.location || "");
    }
  }, [selectedBooking]);

  const originalPrice = useMemo(() => {
    if (!selectedBooking) return "";

    const count =
      selectedBooking.ticketCount ||
      selectedBooking.tickets ||
      1;

    const total =
      selectedBooking.totalPrice ||
      selectedBooking.totalAmount ||
      0;

    const per = count
      ? Math.round(Number(total) / Number(count))
      : 0;

    return per || "";
  }, [selectedBooking]);

  const resetForm = () => {
    setSelectedBookingId("");
    setPhone("");
    setLocation("");
    setExpectedPrice("");
    setReason("");
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!token) {
      setResultStatus("error");
      setResultMessage("Please login first.");
      setResultModal(true);
      return;
    }

    if (!selectedBookingId) {
      setResultStatus("error");
      setResultMessage("Please choose an event.");
      setResultModal(true);
      return;
    }

    if (!phone) {
      setResultStatus("error");
      setResultMessage("Phone number is required.");
      setResultModal(true);
      return;
    }

    if (!expectedPrice) {
      setResultStatus("error");
      setResultMessage("Expected selling price is required.");
      setResultModal(true);
      return;
    }

    if (!file) {
      setResultStatus("error");
      setResultMessage("Please upload ticket proof.");
      setResultModal(true);
      return;
    }

    if (Number(expectedPrice) >= Number(originalPrice)) {
      setResultStatus("error");
      setResultMessage(
        "Expected price must be lower than original price."
      );
      setResultModal(true);
      return;
    }

    const formData = new FormData();

    formData.append(
      "eventName",
      selectedBooking.event?.title ||
        selectedBooking.eventName ||
        ""
    );

    formData.append(
      "location",
      location || selectedBooking.location || ""
    );

    formData.append(
      "eventDate",
      selectedBooking.event?.date ||
        selectedBooking.eventDate ||
        ""
    );

    formData.append("originalPrice", originalPrice);
    formData.append("expectedPrice", expectedPrice);
    formData.append("reason", reason || "");
    formData.append("proof", file);

    setLoading(true);
    setResultStatus("processing");
    setResultMessage("");
    setResultModal(true);

    try {
      const res = await axios.post(
        `${API}/api/sell-ticket`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 201) {
        setResultStatus("success");
        resetForm();
      } else {
        setResultStatus("error");
        setResultMessage("Submission failed.");
      }
    } catch (err) {
      console.error("SELL TICKET ERROR:", err);

      setResultStatus("error");
      setResultMessage(
        err?.response?.data?.message ||
          "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const closeResultModal = () => {
    setResultModal(false);
  };

  return (
    <>
      <div className="page pt-20 px-4 flex justify-center">
        <div className="w-full max-w-3xl">
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-semibold text-white">
              Sell Your Tickets
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Select an event you booked and submit a ticket resale
              request.
            </p>
          </header>

          <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="space-y-6">
              {/* Seller Information */}
              <section className="rounded-xl border border-white/6 bg-slate-950/50 p-4">
                <h3 className="text-sm font-medium text-slate-300">
                  Seller Information
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-slate-400">
                      Full name
                    </label>

                    <input
                      readOnly
                      value={profile?.name || ""}
                      className="mt-1 w-full rounded-lg bg-slate-900/60 px-3 py-2 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400">
                      Email
                    </label>

                    <input
                      readOnly
                      value={profile?.email || ""}
                      className="mt-1 w-full rounded-lg bg-slate-900/60 px-3 py-2 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400">
                      Phone
                    </label>

                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone number"
                      className="mt-1 w-full rounded-lg bg-slate-900/60 px-3 py-2 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400">
                      City / Location
                    </label>

                    <input
                      value={location}
                      onChange={(e) =>
                        setLocation(e.target.value)
                      }
                      placeholder="City or location"
                      className="mt-1 w-full rounded-lg bg-slate-900/60 px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* Ticket Information */}
              <section className="rounded-xl border border-white/6 bg-slate-950/50 p-4">
                <h3 className="text-sm font-medium text-slate-300">
                  Ticket Information
                </h3>

                <div className="mt-3 space-y-3">
                  <label className="text-xs text-slate-400">
                    Event (booked events only)
                  </label>

                  <select
                    value={selectedBookingId}
                    onChange={(e) =>
                      setSelectedBookingId(e.target.value)
                    }
                    className="mt-1 w-full rounded-lg bg-slate-900/60 px-3 py-2 text-white outline-none"
                  >
                    <option value="">Choose an event</option>

                    {bookings.map((booking) => (
                      <option
                        key={booking._id}
                        value={booking._id}
                      >
                        {booking.event?.title ||
                          booking.eventName}{" "}
                        —{" "}
                        {formatDate(
                          booking.event?.date ||
                            booking.eventDate
                        )}
                      </option>
                    ))}
                  </select>

                  {selectedBooking && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-slate-400">
                          Event Name
                        </label>

                        <div className="mt-1 text-white">
                          {selectedBooking.event?.title ||
                            selectedBooking.eventName}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400">
                          Purchase Date
                        </label>

                        <div className="mt-1 text-white">
                          {formatDate(
                            selectedBooking.event?.date ||
                              selectedBooking.eventDate
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400">
                          Ticket Quantity
                        </label>

                        <div className="mt-1 text-white">
                          {selectedBooking.ticketCount ||
                            selectedBooking.tickets}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400">
                          Original Ticket Price
                        </label>

                        <div className="mt-1 text-white">
                          {formatCurrency(originalPrice)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-slate-400">
                      Expected Selling Price
                    </label>

                    <input
                      value={expectedPrice}
                      onChange={(e) =>
                        setExpectedPrice(e.target.value)
                      }
                      type="number"
                      placeholder="Enter expected price"
                      className="mt-1 w-full rounded-lg bg-slate-900/60 px-3 py-2 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400">
                      Reason for Selling
                    </label>

                    <textarea
                      value={reason}
                      onChange={(e) =>
                        setReason(e.target.value)
                      }
                      rows={3}
                      className="mt-1 w-full rounded-lg bg-slate-900/60 px-3 py-2 text-white outline-none"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </section>

              {/* Ticket Proof */}
              <section className="rounded-xl border border-white/6 bg-slate-950/50 p-4">
                <h3 className="text-sm font-medium text-slate-300">
                  Ticket Proof
                </h3>

                <div className="mt-3">
                  <PremiumUpload
                    file={file}
                    onChange={setFile}
                  />
                </div>
              </section>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-black font-semibold hover:bg-orange-600 disabled:opacity-60"
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Ticket for Review"}
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500 text-center">
            Tickets are verified before approval. Uploaded files are
            securely reviewed.
          </p>
        </div>
      </div>

      {/* Animated Result Modal */}
      {resultModal && (
        <div className="sell-result-overlay">
          <div className="sell-result-card">
            {resultStatus === "processing" && (
              <>
                <div className="sell-processing-icon">
                  <div className="sell-spinner"></div>
                  <span>🎟</span>
                </div>

                <h2>Submitting Ticket...</h2>

                <p>
                  Please wait while your ticket is submitted for
                  review.
                </p>
              </>
            )}

            {resultStatus === "success" && (
              <>
                <div className="sell-confetti">
                  <span className="sell-piece piece-one"></span>
                  <span className="sell-piece piece-two"></span>
                  <span className="sell-piece piece-three"></span>
                  <span className="sell-piece piece-four"></span>
                  <span className="sell-piece piece-five"></span>
                  <span className="sell-piece piece-six"></span>
                </div>

                <div className="sell-check-wrapper">
                  <svg
                    viewBox="0 0 52 52"
                    className="sell-check-icon"
                  >
                    <circle
                      cx="26"
                      cy="26"
                      r="24"
                      className="sell-check-circle"
                    />

                    <path
                      d="M14 27L22 35L38 18"
                      className="sell-check-mark"
                    />
                  </svg>
                </div>

                <h2>Ticket Submitted!</h2>

                <h3>Successfully Sent for Review</h3>

                <p>
                  Your ticket resale request has been submitted
                  successfully.
                  <br />
                  Our team will review it shortly.
                </p>

                <button
                  onClick={closeResultModal}
                  className="sell-done-button"
                >
                  Done
                </button>
              </>
            )}

            {resultStatus === "error" && (
              <>
                <div className="sell-error-icon">!</div>

                <h2>Submission Failed</h2>

                <p>
                  {resultMessage ||
                    "Something went wrong. Please try again."}
                </p>

                <button
                  onClick={closeResultModal}
                  className="sell-done-button"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .sell-result-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.76);
          backdrop-filter: blur(5px);
          animation: sellOverlayShow 0.2s ease-out;
        }

        .sell-result-card {
          position: relative;
          width: 100%;
          max-width: 430px;
          overflow: hidden;
          padding: 40px 30px 30px;
          text-align: center;
          border: 1px solid #3f3f46;
          border-radius: 18px;
          background: #18181b;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
          animation: sellCardShow 0.3s ease-out;
        }

        .sell-result-card h2 {
          position: relative;
          z-index: 2;
          margin: 0;
          color: white;
          font-size: 28px;
          font-weight: 700;
          line-height: 1.3;
        }

        .sell-result-card h3 {
          position: relative;
          z-index: 2;
          margin-top: 7px;
          color: #22c55e;
          font-size: 20px;
          font-weight: 700;
        }

        .sell-result-card p {
          position: relative;
          z-index: 2;
          margin: 16px 0 25px;
          color: #a1a1aa;
          font-size: 15px;
          line-height: 1.6;
        }

        .sell-processing-icon {
          position: relative;
          z-index: 2;
          width: 82px;
          height: 82px;
          margin: 0 auto 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(249, 115, 22, 0.12);
          color: #f97316;
          font-size: 32px;
        }

        .sell-spinner {
          position: absolute;
          inset: 0;
          border: 3px solid transparent;
          border-top-color: #f97316;
          border-right-color: #f97316;
          border-radius: 50%;
          animation: sellSpin 0.9s linear infinite;
        }

        .sell-check-wrapper {
          position: relative;
          z-index: 2;
          width: 86px;
          height: 86px;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.12);
          animation: sellCheckPop 0.4s ease-out;
        }

        .sell-check-icon {
          width: 62px;
          height: 62px;
        }

        .sell-check-circle {
          fill: none;
          stroke: #22c55e;
          stroke-width: 2.5;
          stroke-dasharray: 151;
          stroke-dashoffset: 151;
          animation: sellDrawCircle 0.5s ease-out forwards;
        }

        .sell-check-mark {
          fill: none;
          stroke: #22c55e;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 34;
          stroke-dashoffset: 34;
          animation: sellDrawCheck 0.4s ease-out 0.45s forwards;
        }

        .sell-done-button {
          position: relative;
          z-index: 2;
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 9px;
          background: #f97316;
          color: black;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease,
            transform 0.2s ease;
        }

        .sell-done-button:hover {
          background: #ea580c;
          transform: translateY(-1px);
        }

        .sell-error-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          font-size: 48px;
          font-weight: 700;
        }

        .sell-confetti {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .sell-piece {
          position: absolute;
          top: 40%;
          left: 50%;
          width: 6px;
          height: 12px;
          border-radius: 2px;
          opacity: 0;
          animation: sellConfettiBurst 0.8s ease-out forwards;
        }

        .piece-one {
          background: #f97316;
          --x: -165px;
          --y: -115px;
        }

        .piece-two {
          background: #22c55e;
          --x: 165px;
          --y: -110px;
          animation-delay: 0.05s;
        }

        .piece-three {
          background: #eab308;
          --x: -145px;
          --y: 100px;
          animation-delay: 0.1s;
        }

        .piece-four {
          background: #3b82f6;
          --x: 145px;
          --y: 105px;
          animation-delay: 0.15s;
        }

        .piece-five {
          background: #ec4899;
          --x: -205px;
          --y: 0;
          animation-delay: 0.2s;
        }

        .piece-six {
          background: #a855f7;
          --x: 205px;
          --y: 5px;
          animation-delay: 0.25s;
        }

        @keyframes sellOverlayShow {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes sellCardShow {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(15px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes sellCheckPop {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }

          70% {
            transform: scale(1.08);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes sellDrawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes sellDrawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes sellConfettiBurst {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg);
          }

          100% {
            opacity: 0;
            transform: translate(var(--x), var(--y))
              rotate(220deg);
          }
        }

        @keyframes sellSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 480px) {
          .sell-result-card {
            padding: 35px 22px 25px;
          }

          .sell-result-card h2 {
            font-size: 24px;
          }

          .sell-result-card h3 {
            font-size: 18px;
          }
        }
      `}</style>
    </>
  );
};

export default SellTicket;