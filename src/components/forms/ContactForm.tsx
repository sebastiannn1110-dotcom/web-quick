"use client";

import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export function ContactForm({
  type = "contact",
  locale = "en",
}: {
  type?: "contact" | "rfq";
  locale?: string;
}) {
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const form = event.currentTarget;
    const data = new FormData(form);
    const endpoint = type === "rfq" ? "/api/rfq" : "/api/contact";
    const body =
      type === "rfq"
        ? data
        : JSON.stringify(Object.fromEntries(data.entries()));

    const response = await fetch(endpoint, {
      method: "POST",
      headers: type === "contact" ? { "content-type": "application/json" } : undefined,
      body,
    }).catch(() => null);

    if (response?.ok) {
      form.reset();
      setState("success");
    } else {
      setState("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Company
          <input required name="company" className="focus-ring h-12 rounded-md border border-slate-200 px-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Name
          <input required name={type === "rfq" ? "contactName" : "name"} className="focus-ring h-12 rounded-md border border-slate-200 px-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Email
          <input required type="email" name="email" className="focus-ring h-12 rounded-md border border-slate-200 px-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Phone
          <input name="phone" className="focus-ring h-12 rounded-md border border-slate-200 px-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Country
          <input required name="country" className="focus-ring h-12 rounded-md border border-slate-200 px-3 font-normal" />
        </label>
        {type === "contact" ? (
          <>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Region
              <input required name="region" className="focus-ring h-12 rounded-md border border-slate-200 px-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
              Request type
              <input required name="requestType" className="focus-ring h-12 rounded-md border border-slate-200 px-3 font-normal" />
            </label>
          </>
        ) : (
          <>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Part number
              <input required name="partNumber" className="focus-ring h-12 rounded-md border border-slate-200 px-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Manufacturer
              <input name="manufacturer" className="focus-ring h-12 rounded-md border border-slate-200 px-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Quantity
              <input required type="number" min="1" name="quantity" className="focus-ring h-12 rounded-md border border-slate-200 px-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Target price
              <input name="targetPrice" className="focus-ring h-12 rounded-md border border-slate-200 px-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Required date
              <input name="requiredDate" className="focus-ring h-12 rounded-md border border-slate-200 px-3 font-normal" />
            </label>
          </>
        )}
      </div>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Message
        <textarea
          required={type === "contact"}
          name={type === "rfq" ? "notes" : "message"}
          rows={5}
          className="focus-ring rounded-md border border-slate-200 px-3 py-3 font-normal"
        />
      </label>
      {type === "rfq" ? (
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          BOM upload
          <input name="bom" type="file" accept=".pdf,.csv,.xls,.xlsx" className="focus-ring rounded-md border border-slate-200 px-3 py-3 font-normal" />
        </label>
      ) : null}
      <label className="flex items-start gap-3 text-sm text-slate-700">
        <input required type="checkbox" name="consent" value="true" className="mt-1" />
        I agree to be contacted about this request.
      </label>
      <button
        type="submit"
        disabled={state === "loading"}
        className="focus-ring min-h-12 rounded-md bg-orange-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {state === "loading" ? "Sending..." : "Submit"}
      </button>
      {state === "success" ? (
        <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
          Request received.
        </p>
      ) : null}
      {state === "error" ? (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          The request could not be sent. Please try again.
        </p>
      ) : null}
    </form>
  );
}
