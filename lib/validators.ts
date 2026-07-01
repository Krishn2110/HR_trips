import { z } from "zod";

// ── Enquiry Form Schema (Holiday Packages) ──────────────────
export const enquirySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address"),
  travelDate: z.string().min(1, "Select a travel date"),
  paxCount: z
    .number({ error: "Enter number of travelers" })
    .min(1, "At least 1 traveler required")
    .max(50, "For groups over 50, please call us"),
  message: z.string().max(500, "Message is too long").optional(),
});

export type EnquiryFormData = z.infer<typeof enquirySchema>;

// ── Booking Form Schema (Hotel Booking) ─────────────────────
export const bookingSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address"),
  checkin: z.string().min(1, "Select check-in date"),
  checkout: z.string().min(1, "Select check-out date"),
  rooms: z
    .number({ error: "Enter number of rooms" })
    .min(1, "At least 1 room required")
    .max(20, "For 20+ rooms, please call us"),
  guests: z
    .number({ error: "Enter number of guests" })
    .min(1, "At least 1 guest required")
    .max(100, "For 100+ guests, please call us"),
  roomType: z.string().min(1, "Select a room type"),
  specialRequests: z.string().max(500, "Message is too long").optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// ── Contact Form Schema ─────────────────────────────────────
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  service: z.string().min(1, "Select a service"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message is too long"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
