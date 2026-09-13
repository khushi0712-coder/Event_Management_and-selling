import { useState } from "react";
import { init, send } from "@emailjs/browser";

const Contact = () => {
  const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const emailjsContactTemplateId = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID;

  if (emailjsPublicKey && !String(emailjsPublicKey).trim().toLowerCase().startsWith("your_")) {
    init({ publicKey: emailjsPublicKey });
  }

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sendStatus, setSendStatus] = useState("sending");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    const requiredFields = [form.name, form.email, form.subject, form.message];
    if (requiredFields.some((value) => String(value).trim() === "")) {
      setError("Please complete all required fields.");
      setSendStatus("error");
      setShowModal(true);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      setSendStatus("error");
      setShowModal(true);
      return;
    }

    if (!emailjsServiceId || String(emailjsServiceId).trim().startsWith("your_") || !emailjsPublicKey || String(emailjsPublicKey).trim().startsWith("your_") || !emailjsContactTemplateId || String(emailjsContactTemplateId).trim().startsWith("your_")) {
      setError("EmailJS configuration is missing.");
      setSendStatus("error");
      setShowModal(true);
      return;
    }

    const messageData = { ...form };

    setLoading(true);
    setError("");
    setSendStatus("sending");
    setShowModal(true);

    try {
      await send(emailjsServiceId, emailjsContactTemplateId, {
        user_name: form.name,
        user_email: form.email,
        message_subject: form.subject,
        message: form.message,
        submission_date: new Date().toISOString(),
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageData),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to save contact message.");
      }

      setSendStatus("success");
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setSendStatus("error");
      setError(err?.message || "We could not send your message right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);

    if (sendStatus === "error") {
      setForm((previousForm) => previousForm);
    }
  };

  return (
    <>
      <div className="contact-page">
        <h1 className="contact-title">Contact Us</h1>

        <form onSubmit={handleSubmit} className="contact-form">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) =>
              setForm({ ...form, subject: e.target.value })
            }
            required
          />

          <textarea
            placeholder="Message"
            value={form.message}
            onChange={(e) =>
              setForm({ ...form, message: e.target.value })
            }
            required
          />

          {error && !showModal && (
            <p className="form-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="send-button"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      {showModal && (
        <div className="success-overlay">
          <div className="success-card">
            {sendStatus === "sending" && (
              <>
                <div className="sending-icon">
                  <div className="sending-spinner"></div>
                  <span>✉</span>
                </div>

                <h2>Sending Message...</h2>

                <p>
                  Please wait while we send your message.
                </p>
              </>
            )}

            {sendStatus === "success" && (
              <>
                <div className="check-wrapper">
                  <svg viewBox="0 0 52 52" className="check-icon">
                    <circle
                      className="check-circle"
                      cx="26"
                      cy="26"
                      r="24"
                    />

                    <path
                      className="check-mark"
                      d="M14 27L22 35L38 18"
                    />
                  </svg>
                </div>

                <div className="confetti-container">
                  <span className="confetti confetti-one"></span>
                  <span className="confetti confetti-two"></span>
                  <span className="confetti confetti-three"></span>
                  <span className="confetti confetti-four"></span>
                  <span className="confetti confetti-five"></span>
                  <span className="confetti confetti-six"></span>
                </div>

                <h2>Thank you for contacting Eventify.</h2>
                <h2 className="success-heading">
                  Your message has been sent successfully.
                </h2>

                <p>
                  Thank you for contacting Eventify. Your message has been sent successfully.
                </p>

                <button
                  className="done-button"
                  onClick={closeModal}
                >
                  Done
                </button>
              </>
            )}

            {sendStatus === "error" && (
              <>
                <div className="error-icon">!</div>

                <h2>Message Not Sent</h2>

                <p>
                  {error ||
                    "Something went wrong. Please try again."}
                </p>

                <button
                  className="done-button"
                  onClick={closeModal}
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .contact-page {
          max-width: 600px;
          margin: 0 auto;
          padding: 100px 24px;
        }

        .contact-title {
          margin-bottom: 32px;
          text-align: center;
          color: white;
          font-size: 38px;
          font-weight: 700;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .contact-form input,
        .contact-form textarea {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #27272a;
          border-radius: 8px;
          outline: none;
          background: #18181b;
          color: white;
          font-size: 15px;
          transition: border-color 0.2s ease;
        }

        .contact-form input:focus,
        .contact-form textarea:focus {
          border-color: #f97316;
        }

        .contact-form textarea {
          min-height: 140px;
          resize: vertical;
        }

        .send-button,
        .done-button {
          border: none;
          border-radius: 9px;
          padding: 14px;
          background: #f97316;
          color: #000;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease,
            transform 0.2s ease;
        }

        .send-button:hover,
        .done-button:hover {
          background: #ea580c;
          transform: translateY(-1px);
        }

        .send-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .form-error {
          color: #f87171;
          font-size: 14px;
        }

        .success-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(5px);
          animation: overlayShow 0.2s ease-out;
        }

        .success-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          padding: 40px 30px 30px;
          overflow: hidden;
          text-align: center;
          border: 1px solid #3f3f46;
          border-radius: 18px;
          background: #18181b;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
          animation: cardShow 0.3s ease-out;
        }

        .success-card h2 {
          position: relative;
          z-index: 2;
          margin: 0;
          color: white;
          font-size: 28px;
          line-height: 1.3;
        }

        .success-heading {
          color: #22c55e !important;
        }

        .success-card p {
          position: relative;
          z-index: 2;
          margin: 18px 0 28px;
          color: #a1a1aa;
          font-size: 15px;
          line-height: 1.6;
        }

        .check-wrapper {
          position: relative;
          z-index: 2;
          width: 86px;
          height: 86px;
          margin: 0 auto 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.12);
          animation: checkPop 0.4s ease-out;
        }

        .check-icon {
          width: 62px;
          height: 62px;
        }

        .check-circle {
          fill: none;
          stroke: #22c55e;
          stroke-width: 2.5;
          stroke-dasharray: 151;
          stroke-dashoffset: 151;
          animation: drawCircle 0.5s ease-out forwards;
        }

        .check-mark {
          fill: none;
          stroke: #22c55e;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 34;
          stroke-dashoffset: 34;
          animation: drawCheck 0.4s ease-out 0.45s forwards;
        }

        .sending-icon {
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
          font-size: 34px;
        }

        .sending-spinner {
          position: absolute;
          inset: 0;
          border: 3px solid transparent;
          border-top-color: #f97316;
          border-right-color: #f97316;
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }

        .error-icon {
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

        .done-button {
          position: relative;
          z-index: 2;
          width: 100%;
        }

        .confetti-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .confetti {
          position: absolute;
          top: 42%;
          left: 50%;
          width: 6px;
          height: 12px;
          border-radius: 2px;
          opacity: 0;
          animation: confettiBurst 0.8s ease-out forwards;
        }

        .confetti-one {
          background: #f97316;
          --x: -170px;
          --y: -120px;
        }

        .confetti-two {
          background: #22c55e;
          --x: 170px;
          --y: -115px;
          animation-delay: 0.05s;
        }

        .confetti-three {
          background: #eab308;
          --x: -150px;
          --y: 100px;
          animation-delay: 0.1s;
        }

        .confetti-four {
          background: #3b82f6;
          --x: 150px;
          --y: 105px;
          animation-delay: 0.15s;
        }

        .confetti-five {
          background: #ec4899;
          --x: -210px;
          --y: 0;
          animation-delay: 0.2s;
        }

        .confetti-six {
          background: #a855f7;
          --x: 210px;
          --y: 5px;
          animation-delay: 0.25s;
        }

        @keyframes overlayShow {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes cardShow {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(15px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes checkPop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }

          70% {
            transform: scale(1.08);
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes drawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes confettiBurst {
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

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 480px) {
          .contact-page {
            padding: 70px 18px;
          }

          .contact-title {
            font-size: 30px;
          }

          .success-card {
            padding: 35px 22px 25px;
          }

          .success-card h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  );
};

export default Contact;