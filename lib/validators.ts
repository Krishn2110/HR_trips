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
  adults: z
    .number({ error: "Enter number of adults" })
    .min(1, "At least 1 adult required")
    .max(100, "For 100+ adults, please call us"),
  children: z
    .number({ error: "Enter number of children" })
    .min(0, "Children count cannot be negative")
    .max(50, "For 50+ children, please call us"),
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

// ── Admin Login Schema ──────────────────────────────────────
export const adminLoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

// ── Admin Package Schema ────────────────────────────────────
export const adminPackageSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title is too long"),
  destination: z.string().min(2, "Destination must be at least 2 characters"),
  duration: z.string().min(2, "Duration must be specified (e.g. 4 Nights / 5 Days)"),
  startingPrice: z
    .number({ error: "Starting price must be a valid number" })
    .min(100, "Price must be at least ₹100"),
  overview: z
    .string()
    .min(20, "Overview description must be at least 20 characters"),
  highlights: z.array(z.string()).min(1, "Add at least one highlight"),
  placesCovered: z.array(z.string()).min(1, "Add at least one place covered"),
  category: z.enum(["domestic", "international"]),
  featured: z.boolean().default(false),
});

export type AdminPackageFormData = z.infer<typeof adminPackageSchema>;

// ── Hotel Owner Registration Schema ─────────────────────────
export const hotelRegistrationSchema = z.object({
  ownerName: z
    .string()
    .min(2, "Owner name must be at least 2 characters")
    .max(100, "Name is too long"),
  ownerContact: z
    .string()
    .min(10, "Enter a valid owner phone number")
    .max(15, "Phone is too long"),
  propertyManagerName: z
    .string()
    .min(2, "Property manager name must be at least 2 characters")
    .max(100, "Manager name is too long"),
  propertyManagerPhone: z
    .string()
    .min(10, "Enter a valid manager phone number")
    .max(15, "Phone is too long"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .min(10, "Enter a valid hotel contact number")
    .max(15, "Phone is too long"),
  hotelName: z
    .string()
    .min(2, "Hotel name must be at least 2 characters")
    .max(150, "Hotel name is too long"),
  gst: z
    .string()
    .min(15, "GST must be exactly 15 characters")
    .max(15, "GST must be exactly 15 characters"),
  hotelRegistrationNumber: z
    .string()
    .min(2, "Hotel registration number is required"),
  fireSafetyNoc: z
    .string()
    .min(2, "Fire safety NOC details are required"),
  cctvCamera: z
    .string()
    .min(2, "CCTV configuration details are required"),
  bankName: z
    .string()
    .min(2, "Bank name must be at least 2 characters"),
  bankHolder: z
    .string()
    .min(2, "Account holder name must be at least 2 characters"),
  bankAccount: z
    .string()
    .min(5, "Account number must be at least 5 digits"),
  bankIfsc: z
    .string()
    .min(4, "IFSC code is required"),
  
  // Pluralized array fields for multiple native file uploads
  roomPics: z
    .array(z.any())
    .min(1, "At least 1 room photo is required"),
  receptionPics: z
    .array(z.any())
    .min(1, "At least 1 reception photo is required"),
  bathroomPics: z
    .array(z.any())
    .min(1, "At least 1 bathroom photo is required"),
  interiorExteriorPics: z
    .array(z.any())
    .min(1, "At least 1 interior/exterior photo is required"),
  
  location: z
    .string()
    .min(2, "Specify Google Maps URL or coordinates"),
  hotelAddress: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(300, "Address is too long"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z
    .string()
    .min(4, "Enter a valid pincode")
    .max(10, "Pincode is too long"),
});

export type HotelRegistrationFormData = z.infer<typeof hotelRegistrationSchema>;

// ── Cab Owner Registration Schema ───────────────────────────
export const cabRegistrationSchema = z.object({
  // Cab Details
  cabName: z
    .string()
    .min(2, "Cab name must be at least 2 characters (e.g. Toyota Innova)"),
  cabNo: z
    .string()
    .min(4, "Vehicle registration number required (e.g. BR 01 AB 1234)"),
  engineNo: z
    .string()
    .min(3, "Engine number is required"),
  chassisNo: z
    .string()
    .min(3, "Chassis number is required"),
  insurance: z
    .string()
    .min(2, "Insurance details / policy number required"),
  fitness: z
    .string()
    .min(2, "Fitness certificate details required"),
  permit: z
    .string()
    .min(2, "Permit details / validity required"),
  drivingLicenceNo: z
    .string()
    .min(4, "Driving licence number required"),
  fireSafety: z
    .string()
    .min(2, "Fire safety equipment status required"),
  cabType: z.enum(["Commercial", "Private"]),

  // Photos & Document Uploads (Data URLs or File Uploads)
  cabPic: z
    .string()
    .min(1, "Cab photo is required"),
  interiorPic: z
    .string()
    .min(1, "Interior photo is required"),
  rcPic: z
    .string()
    .min(1, "Registration Certificate (RC) image is required"),
  dlPic: z
    .string()
    .min(1, "Driving Licence image is required"),
  insurancePic: z
    .string()
    .min(1, "Insurance document image is required"),
  permitPic: z
    .string()
    .min(1, "Permit document image is required"),
  pucPic: z
    .string()
    .min(1, "Pollution (PUC) certificate image is required"),

  // Owner Details
  ownerName: z
    .string()
    .min(2, "Owner name must be at least 2 characters"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters"),
  city: z
    .string()
    .min(2, "City is required"),
  state: z
    .string()
    .min(2, "State is required"),
  pincode: z
    .string()
    .min(4, "Enter a valid pincode"),
  contactNo: z
    .string()
    .min(10, "Enter a valid contact phone number")
    .max(15, "Contact number is too long"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),

  // Bank Details
  bankName: z
    .string()
    .min(2, "Bank name is required"),
  accountNo: z
    .string()
    .min(5, "Account number must be at least 5 digits"),
  ifscCode: z
    .string()
    .min(4, "IFSC code is required"),

  // Driver Details
  driverName: z
    .string()
    .min(2, "Driver name is required"),
  driverContactNo: z
    .string()
    .min(10, "Valid driver contact number is required"),
  driverDlNo: z
    .string()
    .min(4, "Driver DL number is required"),
});

export type CabRegistrationFormData = z.infer<typeof cabRegistrationSchema>;