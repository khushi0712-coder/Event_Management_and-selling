import { useState } from "react";

const BookingModal = ({ event, onClose }) => {
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [bookingStatus, setBookingStatus] = useState("processing");
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("token");

  const ticketPrice = Number(event?.price || 0);
  const totalPrice = count * ticketPrice;

  const bookTicket = async () => {
    if (!token) {
      setErrorMessage("Please login to book tickets.");
      setBookingStatus("error");
      setShowResult(true);
      return;
    }

    const bookingData = {
      event: event?._id || event?.id || null,
      eventName: event?.title || "",
      eventDate: event?.date || "",
      location: event?.location || "",
      ticketCount: count,
      totalPrice,
    };

    // Result card immediately open hoga
    setBookingStatus("processing");
    setShowResult(true);
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bookingData),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("BOOKING ERROR:", data);
        throw new Error(data?.message || "Booking failed.");
      }

      setBookingStatus("success");
    } catch (error) {
      console.error("BOOKING ERROR:", error);
      setErrorMessage(
        error.message || "Server not reachable. Please try again."
      );
      setBookingStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const closeResultModal = () => {
    setShowResult(false);

    if (bookingStatus === "success") {
      onClose();
    }
  };

  return (
    <>
      {/* Booking Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
        <div className="w-full max-w-md rounded-xl bg-zinc-900 p-6 shadow-xl">
          <h2 className="mb-1 text-xl font-semibold text-white">
            {event?.title}
          </h2>

          <p className="mb-5 text-gray-400">
            ₹ {ticketPrice} per ticket
          </p>

          {/* Ticket Counter */}
          <div className="mb-5 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCount(Math.max(1, count - 1))}
              className="rounded bg-black px-3 py-1 text-lg text-white transition hover:bg-zinc-800"
            >
              −
            </button>

            <span className="min-w-6 text-center text-white">
              {count}
            </span>

            <button
              type="button"
              onClick={() => setCount(count + 1)}
              className="rounded bg-black px-3 py-1 text-lg text-white transition hover:bg-zinc-800"
            >
              +
            </button>
          </div>

          <p className="mb-6 font-semibold text-white">
            Total: ₹ {totalPrice}
          </p>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 transition hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={bookTicket}
              disabled={loading}
              className="rounded bg-orange-500 px-4 py-2 font-semibold text-black transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Processing..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Result Modal */}
      {showResult && (
        <div className="booking-result-overlay">
          <div className="booking-result-card">
            {bookingStatus === "processing" && (
              <>
                <div className="processing-icon">
                  <div className="processing-spinner"></div>
                  <span>🎟</span>
                </div>

                <h2>Processing Booking...</h2>

                <p>
                  Please wait while we confirm your booking.
                </p>
              </>
            )}

            {bookingStatus === "success" && (
              <>
                <div className="booking-confetti">
                  <span className="booking-confetti-piece piece-one"></span>
                  <span className="booking-confetti-piece piece-two"></span>
                  <span className="booking-confetti-piece piece-three"></span>
                  <span className="booking-confetti-piece piece-four"></span>
                  <span className="booking-confetti-piece piece-five"></span>
                  <span className="booking-confetti-piece piece-six"></span>
                </div>

                <div className="booking-check-wrapper">
                  <svg
                    viewBox="0 0 52 52"
                    className="booking-check-icon"
                  >
                    <circle
                      cx="26"
                      cy="26"
                      r="24"
                      className="booking-check-circle"
                    />

                    <path
                      d="M14 27L22 35L38 18"
                      className="booking-check-mark"
                    />
                  </svg>
                </div>

                <h2>Booking Confirmed!</h2>

                <h3 className="booking-success-heading">
                  Successfully Booked
                </h3>

                <p>
                  Your tickets have been booked successfully.
                  <br />
                  We hope you enjoy the event!
                </p>

                <div className="booking-summary">
                  <div>
                    <span>Tickets</span>
                    <strong>{count}</strong>
                  </div>

                  <div>
                    <span>Total Paid</span>
                    <strong>₹ {totalPrice}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeResultModal}
                  className="booking-done-button"
                >
                  Done
                </button>
              </>
            )}

            {bookingStatus === "error" && (
              <>
                <div className="booking-error-icon">!</div>

                <h2>Booking Failed</h2>

                <p>
                  {errorMessage ||
                    "Something went wrong. Please try again."}
                </p>

                <button
                  type="button"
                  onClick={() => setShowResult(false)}
                  className="booking-done-button"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .booking-result-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.76);
          backdrop-filter: blur(5px);
          animation: bookingOverlayShow 0.2s ease-out;
        }

        .booking-result-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          overflow: hidden;
          padding: 40px 30px 30px;
          text-align: center;
          border: 1px solid #3f3f46;
          border-radius: 18px;
          background: #18181b;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
          animation: bookingCardShow 0.3s ease-out;
        }

        .booking-result-card h2 {
          position: relative;
          z-index: 2;
          margin: 0;
          color: white;
          font-size: 28px;
          font-weight: 700;
          line-height: 1.3;
        }

        .booking-result-card p {
          position: relative;
          z-index: 2;
          margin: 16px 0 25px;
          color: #a1a1aa;
          font-size: 15px;
          line-height: 1.6;
        }

        .processing-icon {
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

        .processing-spinner {
          position: absolute;
          inset: 0;
          border: 3px solid transparent;
          border-top-color: #f97316;
          border-right-color: #f97316;
          border-radius: 50%;
          animation: bookingSpin 0.9s linear infinite;
        }

        .booking-check-wrapper {
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
          animation: bookingCheckPop 0.4s ease-out;
        }

        .booking-check-icon {
          width: 62px;
          height: 62px;
        }

        .booking-check-circle {
          fill: none;
          stroke: #22c55e;
          stroke-width: 2.5;
          stroke-dasharray: 151;
          stroke-dashoffset: 151;
          animation: bookingDrawCircle 0.5s ease-out forwards;
        }

        .booking-check-mark {
          fill: none;
          stroke: #22c55e;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 34;
          stroke-dashoffset: 34;
          animation: bookingDrawCheck 0.4s ease-out 0.45s forwards;
        }

        .booking-success-heading {
          position: relative;
          z-index: 2;
          margin-top: 4px;
          color: #22c55e;
          font-size: 22px;
          font-weight: 700;
        }

        .booking-summary {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 25px;
          padding: 14px;
          border: 1px solid #3f3f46;
          border-radius: 10px;
          background: #27272a;
        }

        .booking-summary div {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 5px;
        }

        .booking-summary span {
          color: #a1a1aa;
          font-size: 13px;
        }

        .booking-summary strong {
          color: white;
          font-size: 17px;
        }

        .booking-done-button {
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

        .booking-done-button:hover {
          background: #ea580c;
          transform: translateY(-1px);
        }

        .booking-error-icon {
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

        .booking-confetti {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .booking-confetti-piece {
          position: absolute;
          top: 40%;
          left: 50%;
          width: 6px;
          height: 12px;
          border-radius: 2px;
          opacity: 0;
          animation: bookingConfettiBurst 0.8s ease-out forwards;
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

        @keyframes bookingOverlayShow {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes bookingCardShow {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(15px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes bookingCheckPop {
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

        @keyframes bookingDrawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes bookingDrawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes bookingConfettiBurst {
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

        @keyframes bookingSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 480px) {
          .booking-result-card {
            padding: 35px 22px 25px;
          }

          .booking-result-card h2 {
            font-size: 24px;
          }

          .booking-success-heading {
            font-size: 20px;
          }
        }
      `}</style>
    </>
  );
};

export default BookingModal;