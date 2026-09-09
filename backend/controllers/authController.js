import crypto from "crypto";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

/* ================= TOKEN ================= */

const createToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

/* ================= HELPERS ================= */

const normalizeEmail = (email) =>
  String(email || "").trim().toLowerCase();

const buildAuthResponse = (user, res, statusCode = 200) => {
  const token = createToken(user);

  return res.status(statusCode).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

/* ================= SIGNUP ================= */

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const emailValue = normalizeEmail(email);

    if (!name || !emailValue || !password) {
      return res.status(400).json({
        message: "Please provide all required fields.",
      });
    }

    const userExists = await User.findOne({
      email: emailValue,
    });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists.",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    const user = await User.create({
      name: name.trim(),
      email: emailValue,
      password: hashedPassword,
      role: "user",
    });

    return buildAuthResponse(user, res, 201);
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      message: error.message || "Signup failed.",
    });
  }
};

/* ================= NORMAL LOGIN ================= */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailValue = normalizeEmail(email);

    if (!emailValue || !password) {
      return res.status(400).json({
        message: "Please enter your email and password.",
      });
    }

    const user = await User.findOne({
      email: emailValue,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    /*
      Google-only users may have a generated password.
      They can still use Google Login.
    */

    if (!user.password) {
      return res.status(401).json({
        message:
          "This account uses Google Login. Please continue with Google.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    return buildAuthResponse(user, res);
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: error.message || "Login failed.",
    });
  }
};

/* ================= GOOGLE LOGIN ================= */

// export const googleLogin = async (req, res) => {
//   try {
//     const { credential } = req.body;

//     if (!credential) {
//       return res.status(400).json({
//         message: "Google credential is required.",
//       });
//     }

//     const googleClientId = process.env.GOOGLE_CLIENT_ID;

//     if (!googleClientId) {
//       return res.status(503).json({
//         message:
//           "Google authentication is not configured. Please set GOOGLE_CLIENT_ID in the backend .env file.",
//       });
//     }

//     /*
//       Verify Google ID token
//     */

//     const client = new OAuth2Client(
//       googleClientId
//     );

//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: googleClientId,
//     });

//     const payload = ticket.getPayload();

//     if (!payload || !payload.email) {
//       return res.status(401).json({
//         message: "Google authentication failed.",
//       });
//     }

//     const emailValue = normalizeEmail(
//       payload.email
//     );

//     /*
//       Find existing user using:
//       1. Email
//       2. Google ID
//     */

//     let user = await User.findOne({
//       $or: [
//         {
//           email: emailValue,
//         },
//         {
//           googleId: payload.sub,
//         },
//       ],
//     });

//     /*
//       Create new user if not found
//     */

//     if (!user) {
//       const randomPassword =
//         crypto.randomBytes(32).toString("hex");

//       const salt = await bcrypt.genSalt(10);

//       const hashedPassword =
//         await bcrypt.hash(
//           randomPassword,
//           salt
//         );

//       user = await User.create({
//         name:
//           payload.name ||
//           payload.email.split("@")[0],

//         email: emailValue,

//         password: hashedPassword,

//         googleId: payload.sub,

//         avatar: payload.picture || "",

//         role: "user",
//       });
//     } else {
//       /*
//         Existing user:
//         Connect Google account if not already connected.
//       */

//       if (!user.googleId) {
//         user.googleId = payload.sub;
//       }

//       if (!user.name && payload.name) {
//         user.name = payload.name;
//       }

//       if (!user.avatar && payload.picture) {
//         user.avatar = payload.picture;
//       }

//       await user.save();
//     }

//     /*
//       Login successful
//     */

//     return buildAuthResponse(user, res);
//   } catch (error) {
//     console.error("Google login error:", error);

//     return res.status(401).json({
//       message:
//         error.message ||
//         "Google authentication failed.",
//     });
//   }
// };