"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { enquirySchema, type EnquiryFormData } from "@/lib/validators";
import { submitEnquiry } from "@/lib/api";

interface PackageEnquiryFormProps {
  packageId?: string;
  packageTitle?: string;
}

export default function PackageEnquiryForm({
  packageId,
  packageTitle,
}: PackageEnquiryFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      paxCount: 2,
    },
  });

  const onSubmit = async (data: EnquiryFormData) => {
    setStatus("loading");
    try {
      await submitEnquiry({
        ...data,
        paxCount: Number(data.paxCount),
        packageId,
        message: data.message || "",
      });
      setStatus("success");
      reset();
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl border border-border/50 p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-heading font-semibold text-ink text-lg mb-2">
          Enquiry Submitted!
        </h3>
        <p className="text-muted text-sm">
          Thank you! Our team will contact you shortly with the best deals.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border/50 p-6 lg:p-8">
      <h3 className="font-heading font-semibold text-ink text-lg mb-1">
        Send Enquiry
      </h3>
      {packageTitle && (
        <p className="text-muted text-sm mb-6">
          Interested in <span className="text-primary font-medium">{packageTitle}</span>
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <input
            {...register("name")}
            placeholder="Your Name *"
            className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <input
            {...register("phone")}
            placeholder="Phone Number *"
            className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            {...register("email")}
            type="email"
            placeholder="Email Address *"
            className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Travel Date + Pax */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              {...register("travelDate")}
              type="date"
              className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
            />
            {errors.travelDate && (
              <p className="text-red-500 text-xs mt-1">
                {errors.travelDate.message}
              </p>
            )}
          </div>
          <div>
            <input
              {...register("paxCount", { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="Travelers"
              className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors"
            />
            {errors.paxCount && (
              <p className="text-red-500 text-xs mt-1">
                {errors.paxCount.message}
              </p>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <textarea
            {...register("message")}
            rows={3}
            placeholder="Any special requirements? (optional)"
            className="w-full px-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full px-6 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Enquiry
            </>
          )}
        </button>

        {status === "error" && (
          <p className="text-red-500 text-sm text-center">
            Something went wrong. Please try again or call us directly.
          </p>
        )}
      </form>
    </div>
  );
}
