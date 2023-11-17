import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { env } from "@/env";

export const middlewares = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'"],
        "img-src": ["'self'", "res.cloudinary.com"],
        "font-src": ["'self'"],
        "connect-src": ["'self'"],
        "object-src": ["'self'"],
        "frame-src": ["'self'"],
      },
    },
  }),
  hpp(),
  cors({
    credentials: true,
    origin: env.GITDEV_CLIENT_URL,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
  compression(),
  express.json({ limit: "50mb" }),
  express.urlencoded({ extended: true, limit: "50mb" }),
  cookieParser(),
  morgan("combined"),
];
