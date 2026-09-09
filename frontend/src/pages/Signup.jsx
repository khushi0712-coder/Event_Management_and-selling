import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/* =========================================================
   PASSWORD STRENGTH
========================================================= */

const PasswordStrength = ({ password }) => {
  if (!password) return null;

  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const levels = [
    "Very Weak",
    "Weak",
    "Medium",
    "Strong",
    "Very Strong",
  ];

  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
  ];

  const activeColor =
    strength > 0
      ? colors[Math.min(strength - 1, 3)]
      : "#3f3f46";

  return (
    <div className="eventify-password-strength">
      <div className="eventify-strength-bars">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="eventify-strength-bar"
            style={{
              background:
                strength > index
                  ? activeColor
                  : "#292929",
              boxShadow:
                strength > index
                  ? `0 0 8px ${activeColor}55`
                  : "none",
            }}
          />
        ))}
      </div>

      <div className="eventify-strength-text">
        Strength:
        <span
          style={{
            color:
              strength > 0
                ? activeColor
                : "#777777",
          }}
        >
          {levels[strength]}
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   CAPTCHA GENERATOR
========================================================= */

const generateCaptcha = () => {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let text = "";

  for (let i = 0; i < 5; i++) {
    text += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return text;
};

/* =========================================================
   SIGNUP
========================================================= */

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [captchaText, setCaptchaText] =
    useState(generateCaptcha());

  const [captchaInput, setCaptchaInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* =======================================================
     REFRESH CAPTCHA
  ======================================================= */

  const refreshCaptcha = () => {
    setCaptchaText(generateCaptcha());
    setCaptchaInput("");
  };

  /* =======================================================
     SIGNUP
  ======================================================= */

  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (password.length < 8) {
      alert(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (
      captchaInput.trim().toUpperCase() !==
      captchaText
    ) {
      alert("Captcha incorrect ❌");
      refreshCaptcha();
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Signup failed. Please try again."
        );
        return;
      }

      /* =================================================
         AUTO LOGIN IF TOKEN IS RETURNED
      ================================================= */

      const token =
        data?.token ||
        data?.accessToken;

      if (token) {
        localStorage.setItem(
          "token",
          token
        );

        alert(
          "Account created successfully ✅"
        );

        navigate("/events", {
          replace: true,
        });
      } else {
        alert(
          "Account created successfully ✅"
        );

        navigate("/login", {
          replace: true,
        });
      }
    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      alert(
        "Unable to connect to server. Please try again."
      );
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

        .eventify-signup-page {
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

        .eventify-signup-bg {
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
            signupBackgroundMove
            9s
            ease-in-out
            infinite
            alternate;

          will-change:
            transform,
            background-position;
        }

        @keyframes signupBackgroundMove {

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

        .eventify-signup-overlay {
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
           ORANGE LIGHT BEAMS
        ===================================================== */

        .signup-orange-light {
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

        .signup-orange-light::after {
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

        .signup-light-1 {
          left: -5%;

          animation:
            signupBeam1
            5s
            ease-in-out
            infinite
            alternate;
        }

        .signup-light-2 {
          left: 25%;

          opacity: 0.35;

          animation:
            signupBeam2
            4s
            ease-in-out
            infinite
            alternate;
        }

        .signup-light-3 {
          right: 25%;

          opacity: 0.35;

          animation:
            signupBeam3
            4.5s
            ease-in-out
            infinite
            alternate;
        }

        .signup-light-4 {
          right: -5%;

          animation:
            signupBeam4
            5.5s
            ease-in-out
            infinite
            alternate;
        }

        @keyframes signupBeam1 {

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

        @keyframes signupBeam2 {

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

        @keyframes signupBeam3 {

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

        @keyframes signupBeam4 {

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
           PARTICLES
        ===================================================== */

        .eventify-signup-particles {
          position: absolute;

          inset: 0;

          z-index: 3;

          pointer-events: none;
        }

        .eventify-signup-particles span {
          position: absolute;

          width: 3px;
          height: 3px;

          border-radius: 50%;

          background: #ff7200;

          box-shadow:
            0 0 10px
              rgba(255, 106, 0, 0.95);

          animation:
            signupParticleMove
            5s
            linear
            infinite;

          will-change:
            transform,
            opacity;
        }

        .eventify-signup-particles span:nth-child(1) {
          left: 8%;
          top: 80%;
          animation-delay: 0s;
        }

        .eventify-signup-particles span:nth-child(2) {
          left: 18%;
          top: 60%;
          animation-delay: 0.7s;
        }

        .eventify-signup-particles span:nth-child(3) {
          left: 28%;
          top: 85%;
          animation-delay: 1.4s;
        }

        .eventify-signup-particles span:nth-child(4) {
          left: 42%;
          top: 70%;
          animation-delay: 2.1s;
        }

        .eventify-signup-particles span:nth-child(5) {
          left: 55%;
          top: 82%;
          animation-delay: 2.8s;
        }

        .eventify-signup-particles span:nth-child(6) {
          left: 68%;
          top: 60%;
          animation-delay: 3.5s;
        }

        .eventify-signup-particles span:nth-child(7) {
          left: 78%;
          top: 75%;
          animation-delay: 1.8s;
        }

        .eventify-signup-particles span:nth-child(8) {
          left: 90%;
          top: 50%;
          animation-delay: 2.5s;
        }

        .eventify-signup-particles span:nth-child(9) {
          left: 35%;
          top: 35%;
          animation-delay: 4s;
        }

        .eventify-signup-particles span:nth-child(10) {
          left: 72%;
          top: 25%;
          animation-delay: 1.2s;
        }

        @keyframes signupParticleMove {

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

        .eventify-signup-wrapper {
          position: relative;

          z-index: 10;

          width: 100%;

          max-width: 560px;

          padding: 20px;

          animation:
            signupEnter
            0.8s
            ease-out;
        }

        @keyframes signupEnter {

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
           LOGO
        ===================================================== */

        .eventify-signup-logo {
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
           CARD
        ===================================================== */

        .eventify-signup-card {
          position: relative;

          width: 100%;

          padding: 44px 46px;

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

        /* =====================================================
           CARD ORANGE TOP LINE
        ===================================================== */

        .eventify-signup-card::before {
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

        /* =====================================================
           CARD GLOW
        ===================================================== */

        .eventify-signup-card::after {
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

        .eventify-signup-heading {
          position: relative;

          z-index: 2;

          margin-bottom: 30px;
        }

        .eventify-signup-heading h2 {
          margin: 0 0 10px;

          color: #ffffff;

          font-size: 32px;

          font-weight: 700;

          letter-spacing: -0.8px;
        }

        .eventify-signup-heading p {
          margin: 0;

          color: #a5a5a5;

          font-size: 15px;

          line-height: 1.6;
        }

        /* =====================================================
           FIELD
        ===================================================== */

        .eventify-signup-field {
          position: relative;

          z-index: 2;

          margin-bottom: 20px;
        }

        .eventify-signup-field label,
        .eventify-captcha-label {
          display: block;

          margin-bottom: 10px;

          color: #d6d6d6;

          font-size: 15px;

          font-weight: 600;
        }

        /* =====================================================
           INPUT
        ===================================================== */

        .eventify-signup-input {
          width: 100%;

          height: 58px;

          padding:
            0 18px;

          border:
            1px solid #292929;

          border-radius: 11px;

          outline: none;

          background: #111111;

          color: #ffffff;

          font-size: 16px;

          font-weight: 500;

          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .eventify-signup-input::placeholder {
          color: #777777;

          font-size: 15px;
        }

        .eventify-signup-input:hover {
          border-color: #3b3b3b;
        }

        .eventify-signup-input:focus {
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

        .eventify-signup-password {
          position: relative;
        }

        .eventify-signup-password
        .eventify-signup-input {
          padding-right: 55px;
        }

        .eventify-signup-eye {
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

        .eventify-signup-eye:hover {
          color: #ff6a00;

          background:
            rgba(255, 106, 0, 0.07);
        }

        /* =====================================================
           PASSWORD STRENGTH
        ===================================================== */

        .eventify-password-strength {
          margin-top: 9px;

          margin-bottom: 2px;
        }

        .eventify-strength-bars {
          display: flex;

          gap: 5px;

          margin-bottom: 6px;
        }

        .eventify-strength-bar {
          height: 4px;

          flex: 1;

          border-radius: 10px;

          transition:
            background 0.25s ease,
            box-shadow 0.25s ease;
        }

        .eventify-strength-text {
          color: #858585;

          font-size: 12px;

          font-weight: 500;
        }

        .eventify-strength-text span {
          margin-left: 5px;

          font-size: 12px;

          font-weight: 700;
        }

        /* =====================================================
           CAPTCHA
        ===================================================== */

        .eventify-captcha-section {
          position: relative;

          z-index: 2;

          margin-top: 22px;

          margin-bottom: 22px;
        }

        .eventify-captcha-box {
          width: 100%;

          min-height: 62px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          padding:
            8px
            10px
            8px
            17px;

          margin-bottom: 10px;

          border:
            1px solid #292929;

          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #101010,
              #171717
            );
        }

        .eventify-captcha-code {
          position: relative;

          min-width: 145px;

          padding:
            9px
            15px;

          border-radius: 7px;

          background:
            repeating-linear-gradient(
              135deg,
              rgba(255, 106, 0, 0.04) 0px,
              rgba(255, 106, 0, 0.04) 2px,
              transparent 2px,
              transparent 6px
            );

          color: #ff6a00;

          font-family:
            "Courier New",
            monospace;

          font-size: 22px;

          font-weight: 800;

          letter-spacing: 7px;

          text-align: center;

          text-shadow:
            0 0 12px
              rgba(255, 106, 0, 0.25);

          user-select: none;

          overflow: hidden;
        }

        .eventify-captcha-code::before {
          content: "";

          position: absolute;

          left: -10%;

          right: -10%;

          top: 50%;

          height: 1px;

          background:
            rgba(255, 106, 0, 0.25);

          transform:
            rotate(-8deg);
        }

        .eventify-refresh-btn {
          display: flex;

          align-items: center;

          gap: 7px;

          padding:
            9px
            12px;

          border: 0;

          border-radius: 7px;

          background: transparent;

          color: #ff6a00;

          font-size: 13px;

          font-weight: 600;

          cursor: pointer;

          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .eventify-refresh-btn:hover {
          background:
            rgba(255, 106, 0, 0.08);

          transform:
            translateY(-1px);
        }

        .eventify-refresh-icon {
          font-size: 18px;

          line-height: 1;
        }

        /* =====================================================
           CAPTCHA INPUT
        ===================================================== */

        .eventify-captcha-input {
          width: 100%;

          height: 58px;

          padding:
            0 18px;

          border:
            1px solid #292929;

          border-radius: 11px;

          outline: none;

          background: #111111;

          color: #ffffff;

          font-size: 16px;

          font-weight: 500;

          text-transform: uppercase;

          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .eventify-captcha-input::placeholder {
          color: #777777;

          font-size: 15px;

          text-transform: none;
        }

        .eventify-captcha-input:hover {
          border-color: #3b3b3b;
        }

        .eventify-captcha-input:focus {
          background: #151515;

          border-color: #ff6a00;

          box-shadow:
            0 0 0 3px
              rgba(255, 106, 0, 0.09);
        }

        /* =====================================================
           SIGNUP BUTTON
        ===================================================== */

        .eventify-signup-btn {
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

          font-size: 16px;

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

        .eventify-signup-btn:hover {
          background: #ff791a;

          transform:
            translateY(-2px);

          box-shadow:
            0 16px 38px
              rgba(255, 106, 0, 0.32);
        }

        .eventify-signup-btn:active {
          transform:
            translateY(0);
        }

        .eventify-signup-btn:disabled {
          opacity: 0.6;

          cursor: not-allowed;

          transform: none;
        }

        .eventify-signup-btn svg {
          width: 18px;

          height: 18px;
        }

        /* =====================================================
           DIVIDER
        ===================================================== */

        .eventify-login-divider {
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

        .eventify-login-divider::before,
        .eventify-login-divider::after {
          content: "";

          flex: 1;

          height: 1px;

          background: #292929;
        }

        .eventify-login-divider span {
          color: #777777;

          font-size: 11px;

          font-weight: 600;

          letter-spacing: 1.4px;

          white-space: nowrap;
        }

        /* =====================================================
           LOGIN LINK
        ===================================================== */

        .eventify-login-link {
          position: relative;

          z-index: 2;

          width: 100%;

          height: 53px;

          display: flex;

          align-items: center;

          justify-content: center;

          border:
            1px solid #292929;

          border-radius: 11px;

          background: #0d0d0d;

          color: #d0d0d0;

          text-decoration: none;

          font-size: 15px;

          font-weight: 600;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .eventify-login-link:hover {
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

        .eventify-signup-footer {
          position: relative;

          z-index: 2;

          margin:
            20px
            0
            0;

          text-align: center;

          color: #666666;

          font-size: 12px;

          line-height: 1.6;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {

          .eventify-signup-wrapper {
            max-width: 100%;

            padding: 15px;
          }

          .eventify-signup-card {
            padding:
              32px
              26px;

            border-radius: 18px;
          }

          .eventify-signup-logo {
            margin-bottom: 22px;

            font-size: 23px;
          }

          .eventify-signup-heading h2 {
            font-size: 27px;
          }

          .eventify-signup-heading p {
            font-size: 13px;
          }

          .eventify-signup-field label,
          .eventify-captcha-label {
            font-size: 13px;
          }

          .eventify-signup-input,
          .eventify-captcha-input {
            height: 55px;

            font-size: 14px;
          }

          .eventify-signup-input::placeholder,
          .eventify-captcha-input::placeholder {
            font-size: 13px;
          }

          .eventify-captcha-code {
            min-width: 110px;

            font-size: 18px;

            letter-spacing: 5px;
          }

          .eventify-refresh-btn {
            font-size: 11px;
          }

          .eventify-signup-btn {
            height: 55px;

            font-size: 14px;
          }

          .eventify-login-link {
            height: 50px;

            font-size: 13px;
          }

          .eventify-signup-footer {
            font-size: 10px;
          }
        }

        @media (max-width: 400px) {

          .eventify-signup-card {
            padding:
              27px
              20px;
          }

          .eventify-captcha-box {
            padding-left: 10px;

            gap: 7px;
          }

          .eventify-captcha-code {
            min-width: 100px;

            font-size: 16px;

            letter-spacing: 4px;
          }

          .eventify-refresh-btn {
            padding: 7px;

            font-size: 10px;
          }
        }

        /* =====================================================
           REDUCE MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {

          .eventify-signup-bg,
          .signup-orange-light,
          .eventify-signup-particles span,
          .eventify-signup-wrapper {
            animation: none !important;
          }
        }

      `}</style>

      {/* =====================================================
          PAGE
      ===================================================== */}

      <div className="eventify-signup-page">

        {/* Background */}

        <div className="eventify-signup-bg" />

        {/* Overlay */}

        <div className="eventify-signup-overlay" />

        {/* ===================================================
            MOVING LIGHTS
        =================================================== */}

        <div
          className="
            signup-orange-light
            signup-light-1
          "
        />

        <div
          className="
            signup-orange-light
            signup-light-2
          "
        />

        <div
          className="
            signup-orange-light
            signup-light-3
          "
        />

        <div
          className="
            signup-orange-light
            signup-light-4
          "
        />

        {/* ===================================================
            PARTICLES
        =================================================== */}

        <div className="eventify-signup-particles">

          {Array.from({
            length: 10,
          }).map((_, index) => (
            <span key={index} />
          ))}

        </div>

        {/* ===================================================
            AUTH CONTENT
        =================================================== */}

        <div className="eventify-signup-wrapper">

          {/* LOGO */}

          <div className="eventify-signup-logo">
            EVENTIFY
          </div>

          {/* =================================================
              CARD
          ================================================= */}

          <div className="eventify-signup-card">

            {/* HEADING */}

            <div className="eventify-signup-heading">

              <h2>
                Create your account
              </h2>

              <p>
                Join Eventify and discover unforgettable events.
              </p>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleSignup}>

              {/* FULL NAME */}

              <div className="eventify-signup-field">

                <label>
                  Full name
                </label>

                <input
                  className="eventify-signup-input"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  autoComplete="name"
                />

              </div>

              {/* EMAIL */}

              <div className="eventify-signup-field">

                <label>
                  Email address
                </label>

                <input
                  className="eventify-signup-input"
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

              <div className="eventify-signup-field">

                <label>
                  Password
                </label>

                <div className="eventify-signup-password">

                  <input
                    className="eventify-signup-input"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="eventify-signup-eye"
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
                    {showPassword
                      ? "🙈"
                      : "👁"}
                  </button>

                </div>

                <PasswordStrength
                  password={password}
                />

              </div>

              {/* =================================================
                  CAPTCHA
              ================================================= */}

              <div className="eventify-captcha-section">

                <label className="eventify-captcha-label">
                  Security verification
                </label>

                {/* CAPTCHA DISPLAY */}

                <div className="eventify-captcha-box">

                  <div className="eventify-captcha-code">
                    {captchaText}
                  </div>

                  <button
                    type="button"
                    className="eventify-refresh-btn"
                    onClick={refreshCaptcha}
                  >
                    <span className="eventify-refresh-icon">
                      ↻
                    </span>

                    Refresh
                  </button>

                </div>

                {/* CAPTCHA INPUT */}

                <input
                  className="eventify-captcha-input"
                  type="text"
                  placeholder="Enter the code above"
                  value={captchaInput}
                  onChange={(e) =>
                    setCaptchaInput(
                      e.target.value.toUpperCase()
                    )
                  }
                  maxLength={5}
                  autoComplete="off"
                />

              </div>

              {/* =================================================
                  CREATE ACCOUNT
              ================================================= */}

              <button
                type="submit"
                className="eventify-signup-btn"
                disabled={loading}
              >

                {loading ? (
                  "Creating account..."
                ) : (
                  <>
                    <span>
                      Create Account
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

            <div className="eventify-login-divider">

              <span>
                ALREADY HAVE AN ACCOUNT?
              </span>

            </div>

            {/* =================================================
                LOGIN
            ================================================= */}

            <Link
              to="/login"
              className="eventify-login-link"
            >
              Sign in to Eventify
            </Link>

            {/* =================================================
                FOOTER
            ================================================= */}

            <p className="eventify-signup-footer">
              By creating an account, you agree to
              Eventify's Terms & Privacy Policy.
            </p>

          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;