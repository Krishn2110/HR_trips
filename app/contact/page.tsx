"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Phone, Mail, MapPin, Clock, Send, Loader2, CheckCircle2,
} from "lucide-react";
import { contactSchema, type ContactFormData } from "@/lib/validators";
import { submitContact } from "@/lib/api";
import { CONTACT, SERVICES } from "@/lib/constants";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus("loading");
    try {
      await submitContact(data);
      setStatus("success");
      reset();
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <>
      {/* Hero */}
      <div className="relative h-52 lg:h-64 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1400&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        </div>
        <div className="container-wide relative z-10 pb-8">
          <h1 
            style={{ color: '#ffffff' }}
            className="font-heading text-3xl lg:text-4xl font-bold !text-white mb-1"
          >
            Contact Us
          </h1>
          <p 
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            className="text-sm lg:text-base !text-white/80"
          >
            We&apos;d love to hear from you
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <Breadcrumbs items={[{ label: "Contact" }]} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            {status === "success" ? (
              <div className="bg-white rounded-2xl border border-border/50 p-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-ink text-xl mb-2">
                  Message Sent Successfully!
                </h3>
                <p className="text-muted">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border/50 p-6 lg:p-8">
                <h2 className="font-heading font-semibold text-ink text-xl mb-6">
                  Send us a Message
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        Your Name *
                      </label>
                      <input
                        {...register("name")}
                        className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        Email *
                      </label>
                      <input
                        {...register("email")}
                        type="email"
                        className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                        placeholder="you@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        Phone *
                      </label>
                      <input
                        {...register("phone")}
                        className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                        placeholder="+91 98765 43210"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        Service Interested In *
                      </label>
                      <select
                        {...register("service")}
                        className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
                      >
                        <option value="">Select a service</option>
                        {SERVICES.map((s) => (
                          <option key={s.slug} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                        <option value="other">Other</option>
                      </select>
                      {errors.service && (
                        <p className="text-red-500 text-xs mt-1">{errors.service.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">
                      Message *
                    </label>
                    <textarea
                      {...register("message")}
                      rows={5}
                      className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors resize-none"
                      placeholder="Tell us about your requirements..."
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="px-8 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>

                  {status === "error" && (
                    <p className="text-red-500 text-sm">
                      Something went wrong. Please try again.
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border/50 p-6">
              <h3 className="font-heading font-semibold text-ink text-lg mb-5">
                Contact Information
              </h3>
              <ul className="space-y-5">
                <li>
                  <a
                    href={`tel:${CONTACT.phone}`}
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted">Phone</p>
                      <p className="text-ink font-medium group-hover:text-primary transition-colors">
                        {CONTACT.phoneFormatted}
                      </p>
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted">Email</p>
                      <p className="text-ink font-medium group-hover:text-primary transition-colors text-sm">
                        {CONTACT.email}
                      </p>
                    </div>
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Address</p>
                    <p className="text-ink text-sm">{CONTACT.address}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Business Hours</p>
                    <p className="text-ink text-sm">{CONTACT.businessHours}</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-border/50 h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3597.9!2d85.1!3d25.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDM2JzAwLjAiTiA4NcKwMDYnMDAuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="HR Trips Office Location"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
