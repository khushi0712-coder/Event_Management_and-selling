import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTokenPayload, setToken } from "../services/auth";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invalid email or password.");
        return;
      }

      const token = data?.token || data?.accessToken;

      if (!token) {
        alert("Login failed: no authentication token received.");
        return;
      }

      setToken(token);

      const payload = getTokenPayload(token);

      if (payload?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/events", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        /* =====================================================
           MAIN PAGE
        ===================================================== */

        .eventify-login-page {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #050505;
          color: #ffffff;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* =====================================================
           ANIMATED CONCERT BACKGROUND
        ===================================================== */

        .eventify-bg {
          position: absolute;
          inset: -12%;

          background-image:
            linear-gradient(
              rgba(0, 0, 0, 0.76),
              rgba(0, 0, 0, 0.86)
            ),
            url("https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=2400&q=90");

          background-size: cover;
          background-position: center;

          filter:
            saturate(0.9)
            contrast(1.12);

          animation:
            eventifyBackgroundMove
            9s
            ease-in-out
            infinite
            alternate;

          will-change:
            transform,
            background-position;
        }

        @keyframes eventifyBackgroundMove {
          0% {
            transform:
              scale(1.02)
              translate3d(-1%, 0, 0);

            background-position:
              48% 50%;
          }

          50% {
            transform:
              scale(1.09)
              translate3d(1%, -0.5%, 0);

            background-position:
              52% 48%;
          }

          100% {
            transform:
              scale(1.14)
              translate3d(-1%, 0.5%, 0);

            background-position:
              55% 52%;
          }
        }

        /* =====================================================
           DARK OVERLAY
        ===================================================== */

        .eventify-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;

          background:
            radial-gradient(
              circle at 50% 40%,
              rgba(255, 106, 0, 0.1),
              transparent 35%
            ),
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.28),
              rgba(0, 0, 0, 0.94)
            );
        }

        /* =====================================================
           ORANGE CONCERT LIGHTS
        ===================================================== */

        .orange-light {
          position: absolute;
          top: -25%;

          width: 230px;
          height: 120vh;

          background:
            linear-gradient(
              180deg,
              rgba(255, 106, 0, 0.34),
              rgba(255, 106, 0, 0)
            );

          filter: blur(24px);

          opacity: 0.65;

          transform-origin: top center;

          z-index: 2;

          pointer-events: none;

          will-change: transform;
        }

        .orange-light::after {
          content: "";

          position: absolute;
          inset: 0;

          clip-path:
            polygon(
              38% 0,
              62% 0,
              100% 100%,
              0 100%
            );

          background:
            linear-gradient(
              180deg,
              rgba(255, 120, 0, 0.6),
              rgba(255, 80, 0, 0)
            );
        }

        .orange-light-1 {
          left: -5%;

          animation:
            concertBeam1
            5s
            ease-in-out
            infinite
            alternate;
        }

        .orange-light-2 {
          left: 25%;

          opacity: 0.35;

          animation:
            concertBeam2
            4s
            ease-in-out
            infinite
            alternate;
        }

        .orange-light-3 {
          right: 25%;

          opacity: 0.35;

          animation:
            concertBeam3
            4.5s
            ease-in-out
            infinite
            alternate;
        }

        .orange-light-4 {
          right: -5%;

          animation:
            concertBeam4
            5.5s
            ease-in-out
            infinite
            alternate;
        }

        @keyframes concertBeam1 {
          0% {
            transform:
              rotate(-35deg)
              translateX(-80px);
          }

          50% {
            transform:
              rotate(-5deg)
              translateX(40px);
          }

          100% {
            transform:
              rotate(25deg)
              translateX(100px);
          }
        }

        @keyframes concertBeam2 {
          0% {
            transform:
              rotate(-25deg)
              translateX(-40px);
          }

          50% {
            transform:
              rotate(10deg)
              translateX(60px);
          }

          100% {
            transform:
              rotate(30deg)
              translateX(-20px);
          }
        }

        @keyframes concertBeam3 {
          0% {
            transform:
              rotate(25deg)
              translateX(50px);
          }

          50% {
            transform:
              rotate(-5deg)
              translateX(-60px);
          }

          100% {
            transform:
              rotate(-30deg)
              translateX(20px);
          }
        }

        @keyframes concertBeam4 {
          0% {
            transform:
              rotate(35deg)
              translateX(80px);
          }

          50% {
            transform:
              rotate(5deg)
              translateX(-40px);
          }

          100% {
            transform:
              rotate(-25deg)
              translateX(-100px);
          }
        }

        /* =====================================================
           FLOATING PARTICLES
        ===================================================== */

        .eventify-particles {
          position: absolute;
          inset: 0;

          z-index: 3;

          pointer-events: none;
        }

        .eventify-particles span {
          position: absolute;

          width: 3px;
          height: 3px;

          border-radius: 50%;

          background: #ff7200;

          box-shadow:
            0 0 10px
              rgba(255, 106, 0, 0.95);

          animation:
            particleMove
            5s
            linear
            infinite;

          will-change:
            transform,
            opacity;
        }

        .eventify-particles span:nth-child(1) {
          left: 8%;
          top: 80%;
          animation-delay: 0s;
        }

        .eventify-particles span:nth-child(2) {
          left: 18%;
          top: 60%;
          animation-delay: 0.7s;
        }

        .eventify-particles span:nth-child(3) {
          left: 28%;
          top: 85%;
          animation-delay: 1.4s;
        }

        .eventify-particles span:nth-child(4) {
          left: 42%;
          top: 70%;
          animation-delay: 2.1s;
        }

        .eventify-particles span:nth-child(5) {
          left: 55%;
          top: 82%;
          animation-delay: 2.8s;
        }

        .eventify-particles span:nth-child(6) {
          left: 68%;
          top: 60%;
          animation-delay: 3.5s;
        }

        .eventify-particles span:nth-child(7) {
          left: 78%;
          top: 75%;
          animation-delay: 1.8s;
        }

        .eventify-particles span:nth-child(8) {
          left: 90%;
          top: 50%;
          animation-delay: 2.5s;
        }

        .eventify-particles span:nth-child(9) {
          left: 35%;
          top: 35%;
          animation-delay: 4s;
        }

        .eventify-particles span:nth-child(10) {
          left: 72%;
          top: 25%;
          animation-delay: 1.2s;
        }

        @keyframes particleMove {
          0% {
            opacity: 0;

            transform:
              translateY(80px)
              scale(0.6);
          }

          20% {
            opacity: 1;
          }

          50% {
            opacity: 0.75;

            transform:
              translateY(-40px)
              scale(1);
          }

          80% {
            opacity: 0.9;
          }

          100% {
            opacity: 0;

            transform:
              translateY(-220px)
              scale(0.4);
          }
        }

        /* =====================================================
           AUTH WRAPPER
        ===================================================== */

        .eventify-auth-wrapper {
          position: relative;
          z-index: 10;

          width: 100%;
          max-width: 520px;

          padding: 20px;

          animation:
            formEnter
            0.8s
            ease-out;
        }

        @keyframes formEnter {
          from {
            opacity: 0;

            transform:
              translateY(25px)
              scale(0.97);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }
        }

        /* =====================================================
           EVENTIFY LOGO
        ===================================================== */

        .eventify-logo {
          text-align: center;

          margin-bottom: 28px;

          color: #ff6a00;

          font-size: 25px;
          font-weight: 800;

          letter-spacing: -0.8px;

          text-shadow:
            0 0 20px
              rgba(255, 106, 0, 0.3);
        }

        /* =====================================================
           AUTH CARD
        ===================================================== */

        .eventify-auth-card {
          position: relative;

          width: 100%;

          padding: 40px 42px;

          border-radius: 22px;

          background:
            linear-gradient(
              145deg,
              rgba(22, 22, 22, 0.96),
              rgba(8, 8, 8, 0.95)
            );

          border:
            1px solid
              rgba(255, 255, 255, 0.1);

          box-shadow:
            0 35px 90px
              rgba(0, 0, 0, 0.78),
            0 0 50px
              rgba(255, 106, 0, 0.07);

          backdrop-filter:
            blur(22px);

          -webkit-backdrop-filter:
            blur(22px);

          overflow: hidden;
        }

        /* Orange top line */

        .eventify-auth-card::before {
          content: "";

          position: absolute;

          top: 0;

          left: 12%;
          right: 12%;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              #ff6a00,
              transparent
            );

          box-shadow:
            0 0 20px
              rgba(255, 106, 0, 0.7);
        }

        /* Soft orange glow */

        .eventify-auth-card::after {
          content: "";

          position: absolute;

          width: 220px;
          height: 220px;

          top: -145px;
          right: -110px;

          border-radius: 50%;

          background:
            rgba(255, 106, 0, 0.09);

          filter: blur(55px);

          pointer-events: none;
        }

        /* =====================================================
           HEADING
        ===================================================== */

        .eventify-auth-heading {
          position: relative;
          z-index: 2;

          margin-bottom: 30px;
        }

        .eventify-auth-heading h2 {
          margin: 0 0 9px;

          color: #ffffff;

          font-size: 30px;
          font-weight: 700;

          letter-spacing: -0.8px;
        }

        .eventify-auth-heading p {
          margin: 0;

          color: #999999;

          font-size: 14px;

          line-height: 1.6;
        }

        /* =====================================================
           FORM FIELD
        ===================================================== */

        .eventify-field {
          position: relative;
          z-index: 2;

          margin-bottom: 21px;
        }

        .eventify-field label {
          display: block;

          margin-bottom: 10px;

          color: #d0d0d0;

          font-size: 14px;
          font-weight: 600;
        }

        /* =====================================================
           INPUT
        ===================================================== */

        .eventify-input {
          width: 100%;
          height: 58px;

          padding:
            0 17px;

          border:
            1px solid #292929;

          border-radius: 11px;

          outline: none;

          background: #111111;

          color: #ffffff;

          font-size: 15px;
          font-weight: 500;

          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .eventify-input::placeholder {
          color: #777777;

          font-size: 14px;
        }

        .eventify-input:hover {
          border-color: #3b3b3b;
        }

        .eventify-input:focus {
          background: #151515;

          border-color: #ff6a00;

          box-shadow:
            0 0 0 3px
              rgba(255, 106, 0, 0.09),
            0 0 22px
              rgba(255, 106, 0, 0.05);
        }

        /* =====================================================
           PASSWORD
        ===================================================== */

        .eventify-password-wrapper {
          position: relative;
        }

        .eventify-password-wrapper
        .eventify-input {
          padding-right: 55px;
        }

        .eventify-password-toggle {
          position: absolute;

          right: 12px;
          top: 50%;

          transform:
            translateY(-50%);

          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 0;

          border-radius: 7px;

          background: transparent;

          color: #777777;

          cursor: pointer;

          font-size: 16px;

          transition:
            color 0.2s ease,
            background 0.2s ease;
        }

        .eventify-password-toggle:hover {
          color: #ff6a00;

          background:
            rgba(255, 106, 0, 0.07);
        }

        /* =====================================================
           OPTIONS
        ===================================================== */

        .eventify-options {
          position: relative;
          z-index: 2;

          display: flex;

          align-items: center;
          justify-content: space-between;

          margin:
            3px
            0
            25px;
        }

        .eventify-remember {
          display: flex;

          align-items: center;

          gap: 8px;

          color: #8f8f8f;

          font-size: 13px;
          font-weight: 500;

          cursor: pointer;
        }

        .eventify-remember input {
          width: 14px;
          height: 14px;

          accent-color: #ff6a00;

          cursor: pointer;
        }

        .eventify-forgot {
          padding: 0;

          border: 0;

          background: transparent;

          color: #ff6a00;

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;
        }

        .eventify-forgot:hover {
          text-decoration: underline;
        }

        /* =====================================================
           SIGN IN BUTTON
        ===================================================== */

        .eventify-login-btn {
          position: relative;
          z-index: 2;

          width: 100%;
          height: 58px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 11px;

          border: 0;

          border-radius: 11px;

          background: #ff6a00;

          color: #050505;

          font-size: 15px;
          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 12px 32px
              rgba(255, 106, 0, 0.22);

          transition:
            transform 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .eventify-login-btn:hover {
          background: #ff791a;

          transform:
            translateY(-2px);

          box-shadow:
            0 16px 38px
              rgba(255, 106, 0, 0.32);
        }

        .eventify-login-btn:active {
          transform:
            translateY(0);
        }

        .eventify-login-btn:disabled {
          opacity: 0.6;

          cursor: not-allowed;

          transform: none;
        }

        .eventify-login-btn svg {
          width: 18px;
          height: 18px;
        }

        /* =====================================================
           DIVIDER
        ===================================================== */

        .eventify-divider {
          position: relative;
          z-index: 2;

          display: flex;

          align-items: center;

          gap: 13px;

          margin:
            29px
            0
            21px;
        }

        .eventify-divider::before,
        .eventify-divider::after {
          content: "";

          flex: 1;

          height: 1px;

          background: #292929;
        }

        .eventify-divider span {
          color: #777777;

          font-size: 10px;

          font-weight: 600;

          letter-spacing: 1.4px;

          white-space: nowrap;
        }

        /* =====================================================
           SIGN UP
        ===================================================== */

        .eventify-signup {
          position: relative;
          z-index: 2;

          width: 100%;
          height: 52px;

          display: flex;

          align-items: center;
          justify-content: center;

          border:
            1px solid #292929;

          border-radius: 11px;

          background: #0d0d0d;

          color: #d0d0d0;

          text-decoration: none;

          font-size: 14px;
          font-weight: 600;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .eventify-signup:hover {
          border-color: #ff6a00;

          background:
            rgba(255, 106, 0, 0.05);

          color: #ff6a00;

          transform:
            translateY(-1px);
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .eventify-footer {
          position: relative;
          z-index: 2;

          margin:
            20px
            0
            0;

          text-align: center;

          color: #666666;

          font-size: 11px;
          font-weight: 400;

          line-height: 1.6;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {
          .eventify-auth-wrapper {
            max-width: 100%;

            padding: 15px;
          }

          .eventify-auth-card {
            padding:
              32px
              26px;

            border-radius: 18px;
          }

          .eventify-logo {
            margin-bottom: 22px;

            font-size: 23px;
          }

          .eventify-auth-heading h2 {
            font-size: 27px;
          }

          .eventify-auth-heading p {
            font-size: 13px;
          }

          .eventify-field label {
            font-size: 13px;
          }

          .eventify-input {
            height: 55px;

            font-size: 14px;
          }

          .eventify-input::placeholder {
            font-size: 13px;
          }

          .eventify-remember,
          .eventify-forgot {
            font-size: 12px;
          }

          .eventify-login-btn {
            height: 55px;

            font-size: 14px;
          }

          .eventify-signup {
            height: 50px;

            font-size: 13px;
          }

          .eventify-footer {
            font-size: 10px;
          }
        }

        @media (max-width: 400px) {
          .eventify-auth-card {
            padding:
              27px
              20px;
          }

          .eventify-options {
            gap: 10px;
          }

          .eventify-forgot {
            white-space: nowrap;
          }
        }

        /* =====================================================
           REDUCE MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .eventify-bg,
          .orange-light,
          .eventify-particles span,
          .eventify-auth-wrapper {
            animation: none !important;
          }
        }
      `}</style>

      <div className="eventify-login-page">

        {/* ===================================================
            BACKGROUND
        =================================================== */}

        <div className="eventify-bg" />

        <div className="eventify-overlay" />

        {/* ===================================================
            MOVING ORANGE LIGHT BEAMS
        =================================================== */}

        <div className="orange-light orange-light-1" />
        <div className="orange-light orange-light-2" />
        <div className="orange-light orange-light-3" />
        <div className="orange-light orange-light-4" />

        {/* ===================================================
            FLOATING PARTICLES
        =================================================== */}

        <div className="eventify-particles">
          {Array.from({ length: 10 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>

        {/* ===================================================
            AUTH CONTENT
        =================================================== */}

        <div className="eventify-auth-wrapper">

          {/* LOGO */}

          <div className="eventify-logo">
            EVENTIFY
          </div>

          {/* =================================================
              CARD
          ================================================= */}

          <div className="eventify-auth-card">

            {/* HEADING */}

            <div className="eventify-auth-heading">

              <h2>
                Welcome back
              </h2>

              <p>
                Sign in to continue to your Eventify account.
              </p>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleLogin}>

              {/* EMAIL */}

              <div className="eventify-field">

                <label>
                  Email address
                </label>

                <input
                  className="eventify-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                />

              </div>

              {/* PASSWORD */}

              <div className="eventify-field">

                <label>
                  Password
                </label>

                <div className="eventify-password-wrapper">

                  <input
                    className="eventify-input"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="eventify-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>

                </div>

              </div>

              {/* =================================================
                  REMEMBER + FORGOT
              ================================================= */}

              <div className="eventify-options">

                <label className="eventify-remember">

                  <input
                    type="checkbox"
                  />

                  <span>
                    Remember me
                  </span>

                </label>

                {/* <button
                  type="button"
                  className="eventify-forgot"
                  onClick={() =>
                    alert(
                      "Password reset functionality can be connected here."
                    )
                  }
                >
                  Forgot password?
                </button> */}

              </div>

              {/* =================================================
                  LOGIN BUTTON
              ================================================= */}

              <button
                type="submit"
                className="eventify-login-btn"
                disabled={loading}
              >

                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    <span>
                      Sign In
                    </span>

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                    >

                      <path
                        d="M5 12H19"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M13 6L19 12L13 18"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                    </svg>
                  </>
                )}

              </button>

            </form>

            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="eventify-divider">

              <span>
                NEW TO EVENTIFY?
              </span>

            </div>

            {/* =================================================
                SIGN UP
            ================================================= */}

            <Link
              to="/signup"
              className="eventify-signup"
            >
              Create an account
            </Link>

            {/* =================================================
                FOOTER
            ================================================= */}

            <p className="eventify-footer">
              By continuing, you agree to
              Eventify's Terms & Privacy Policy.
            </p>

          </div>
        </div>
      </div>
    </>
  );
};

export default Login;