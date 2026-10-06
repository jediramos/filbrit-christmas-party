"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  eventConfig,
  formatEventDate,
  formatPrice,
  getStageStatus,
  type TicketStage,
} from "@/config/event";
import {
  buildOrderLines,
  CHECKOUT_DRAFT_KEY,
  EMPTY_BUYER_DETAILS,
  orderTicketCount,
  orderTotal,
  validateBuyerDetails,
  type BuyerDetails as Details,
  type BuyerDetailsErrors as DetailsErrors,
  type OrderLine,
  type TicketQuantities,
} from "@/lib/order";

type Step = "tickets" | "details" | "review";

const STEPS: { id: Step; label: string }[] = [
  { id: "tickets", label: "Tickets" },
  { id: "details", label: "Details" },
  { id: "review", label: "Review" },
];

type CheckoutDraft = { quantities: TicketQuantities; details: Details };

function loadDraft(): CheckoutDraft | null {
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<CheckoutDraft>;
    return {
      quantities: draft.quantities ?? {},
      details: { ...EMPTY_BUYER_DETAILS, ...draft.details },
    };
  } catch {
    return null;
  }
}

function formatOpensOn(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/London",
  });
}

export function BuyTickets({
  testMode,
  disabled = false,
}: {
  testMode: boolean;
  disabled?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => () => {
    document.body.style.overflow = "";
  }, []);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setNow(new Date());
          setOpen(true);
          setHasOpened(true);
        }}
        className="rounded-full bg-[var(--gold)] px-10 py-3.5 font-display text-lg text-[var(--evergreen-deep)] shadow-[0_0_24px_rgba(201,162,39,0.25)] transition hover:bg-[var(--gold-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:bg-[var(--gold)]"
      >
        Buy Tickets
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="buy-tickets-title"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        className="m-auto h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-left text-[var(--ivory)] backdrop:bg-black/70 backdrop:backdrop-blur-sm sm:h-fit sm:max-h-[min(92dvh,52rem)] sm:w-[calc(100%-2rem)] sm:max-w-2xl"
      >
        {/* Mounted only after first open so server/client clocks can't cause a hydration mismatch. */}
        {hasOpened && (
          <Checkout now={now} testMode={testMode} onClose={() => setOpen(false)} />
        )}
      </dialog>
    </>
  );
}

type CheckoutProps = {
  now: Date;
  testMode: boolean;
  onClose: () => void;
};

function Checkout({ now, testMode, onClose }: CheckoutProps) {
  const detailsFormId = useId();
  const [draft] = useState(loadDraft);
  const [step, setStep] = useState<Step>("tickets");
  const [quantities, setQuantities] = useState<TicketQuantities>(
    draft?.quantities ?? {},
  );
  const [details, setDetails] = useState<Details>(
    draft?.details ?? EMPTY_BUYER_DETAILS,
  );
  const [errors, setErrors] = useState<DetailsErrors>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        CHECKOUT_DRAFT_KEY,
        JSON.stringify({ quantities, details }),
      );
    } catch {
      // Storage can be unavailable (e.g. private browsing); the draft just won't persist.
    }
  }, [quantities, details]);

  const stages = eventConfig.stages;
  const orderLines = buildOrderLines(quantities, now);
  const ticketCount = orderTicketCount(orderLines);
  const total = orderTotal(orderLines);

  const startPayment = async () => {
    setPaying(true);
    setPaymentError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantities, details }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "We couldn't start the payment. Please try again.");
      }
      window.location.assign(data.url);
    } catch (err) {
      setPaymentError(
        err instanceof Error ? err.message : "We couldn't start the payment. Please try again.",
      );
      setPaying(false);
    }
  };

  const changeQuantity = (stageId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[stageId] ?? 0;
      const othersTotal = ticketCount - current;
      const next = Math.min(
        Math.max(current + delta, 0),
        eventConfig.maxTicketsPerOrder - othersTotal,
      );
      return { ...prev, [stageId]: next };
    });
  };

  const updateDetail = (field: keyof Details, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const submitDetails = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validateBuyerDetails(details);
    setErrors(nextErrors);
    const nextTermsError = termsAccepted
      ? null
      : "Please confirm you have read and understood the Terms & Conditions.";
    setTermsError(nextTermsError);
    if (Object.keys(nextErrors).length === 0 && !nextTermsError) {
      setStep("review");
    }
  };

  const changeTermsAccepted = (accepted: boolean) => {
    setTermsAccepted(accepted);
    if (accepted) setTermsError(null);
  };

  return (
    <div className="flex h-full max-h-[inherit] flex-col overflow-hidden border-[var(--gold)]/30 bg-[var(--evergreen-deep)] shadow-2xl sm:rounded-lg sm:border">
      <header className="relative border-b border-[var(--pine-line)] px-12 pb-4 pt-5 text-center">
        <h2
          id="buy-tickets-title"
          className="font-display text-xl text-[var(--ivory)] sm:text-2xl"
        >
          {eventConfig.orgName} {eventConfig.eventName}
        </h2>
        <p className="mt-1 text-xs text-[var(--mist)] sm:text-sm">
          {formatEventDate(eventConfig.eventStart)} · {eventConfig.eventTime} ·{" "}
          {eventConfig.venue}
        </p>
        <ol className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--pine-line)] px-3 py-1 text-xs">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2">
              {i > 0 && (
                <span className="text-[var(--mist)]" aria-hidden="true">
                  ›
                </span>
              )}
              <span
                aria-current={s.id === step ? "step" : undefined}
                className={
                  s.id === step
                    ? "font-semibold text-[var(--gold)]"
                    : "text-[var(--mist)]"
                }
              >
                {s.label}
              </span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-[var(--mist)] transition hover:bg-white/5 hover:text-[var(--ivory)]"
        >
          ×
        </button>
      </header>

      {testMode && (
        <p className="border-b border-[var(--gold)]/40 bg-[var(--gold)]/15 px-5 py-2 text-center text-xs text-[var(--gold-bright)] sm:px-6">
          <strong className="font-semibold">Test mode</strong> – no real
          payments are taken. Pay with card 4242 4242 4242 4242, any future
          expiry and any CVC.
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 [scrollbar-color:var(--pine-line)_transparent] [scrollbar-width:thin] sm:px-6">
        {step === "tickets" && (
          <TicketsStep
            stages={stages}
            now={now}
            quantities={quantities}
            ticketCount={ticketCount}
            onChange={changeQuantity}
          />
        )}
        {step === "details" && (
          <DetailsStep
            formId={detailsFormId}
            details={details}
            errors={errors}
            onChange={updateDetail}
            termsAccepted={termsAccepted}
            termsError={termsError}
            onTermsChange={changeTermsAccepted}
            onSubmit={submitDetails}
          />
        )}
        {step === "review" && (
          <ReviewStep
            orderLines={orderLines}
            total={total}
            details={details}
            paymentError={paymentError}
            onEditTickets={() => setStep("tickets")}
            onEditDetails={() => setStep("details")}
          />
        )}
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-[var(--pine-line)] bg-[var(--night)]/60 px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--mist)]">
            {step === "review" ? "Total" : "Subtotal"}
          </p>
          <p className="font-display text-2xl text-[var(--ivory)]">
            {formatPrice(total)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {step !== "tickets" && (
            <button
              type="button"
              onClick={() => setStep(step === "review" ? "details" : "tickets")}
              className="rounded-full border border-[var(--pine-line)] px-5 py-2.5 text-sm text-[var(--ivory-soft)] transition hover:border-[var(--gold)]/60 hover:text-[var(--ivory)]"
            >
              Back
            </button>
          )}
          {step === "tickets" && (
            <PrimaryButton
              disabled={ticketCount === 0}
              onClick={() => setStep("details")}
            >
              Next
            </PrimaryButton>
          )}
          {step === "details" && (
            <PrimaryButton type="submit" form={detailsFormId}>
              Next
            </PrimaryButton>
          )}
          {step === "review" && (
            <PrimaryButton
              disabled={paying || ticketCount === 0}
              onClick={startPayment}
            >
              {paying ? "Redirecting…" : "Continue to payment"}
            </PrimaryButton>
          )}
        </div>
      </footer>
    </div>
  );
}

type PrimaryButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  form?: string;
  title?: string;
};

function PrimaryButton({
  children,
  type = "button",
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      {...rest}
      className="rounded-full bg-[var(--gold)] px-6 py-2.5 text-sm font-semibold text-[var(--evergreen-deep)] transition hover:bg-[var(--gold-bright)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[var(--gold)]"
    >
      {children}
    </button>
  );
}

type TicketsStepProps = {
  stages: TicketStage[];
  now: Date;
  quantities: Record<string, number>;
  ticketCount: number;
  onChange: (stageId: string, delta: number) => void;
};

function TicketsStep({
  stages,
  now,
  quantities,
  ticketCount,
  onChange,
}: TicketsStepProps) {
  const atLimit = ticketCount >= eventConfig.maxTicketsPerOrder;

  return (
    <section aria-labelledby="select-tickets-heading">
      <h3
        id="select-tickets-heading"
        className="font-display text-2xl text-[var(--ivory)]"
      >
        Select tickets
      </h3>
      <ul className="mt-4 divide-y divide-[var(--pine-line)] overflow-hidden rounded-md border border-[var(--pine-line)] bg-[var(--evergreen)]/40">
        {stages.map((stage) => {
          const status = getStageStatus(stage, now);
          const quantity = quantities[stage.id] ?? 0;

          return (
            <li
              key={stage.id}
              className="flex items-start justify-between gap-4 px-4 py-4"
            >
              <div className="min-w-0">
                <p
                  className={`font-display text-xl ${
                    status === "current"
                      ? "text-[var(--ivory)]"
                      : "text-[var(--mist)]"
                  }`}
                >
                  {stage.name}
                </p>
                <p
                  className={`mt-0.5 font-display text-lg ${
                    status === "current"
                      ? "text-[var(--gold)]"
                      : "text-[var(--gold-dim)]"
                  }`}
                >
                  {formatPrice(stage.price)}
                </p>
                <p className="mt-1 text-sm text-[var(--mist)]">
                  {stage.description}
                </p>
              </div>

              {status === "current" ? (
                <div className="flex shrink-0 items-center gap-2">
                  <StepperButton
                    label={`${stage.name}: remove 1 ticket`}
                    disabled={quantity === 0}
                    onClick={() => onChange(stage.id, -1)}
                  >
                    −
                  </StepperButton>
                  <span
                    className="w-6 text-center tabular-nums text-[var(--ivory)]"
                    aria-live="polite"
                    aria-label={`${quantity} ${stage.name} tickets selected`}
                  >
                    {quantity}
                  </span>
                  <StepperButton
                    label={`${stage.name}: add 1 ticket`}
                    disabled={atLimit}
                    onClick={() => onChange(stage.id, 1)}
                  >
                    +
                  </StepperButton>
                </div>
              ) : (
                <span
                  className={`shrink-0 rounded-sm px-2 py-1 text-[0.65rem] uppercase tracking-[0.16em] ${
                    status === "past"
                      ? "bg-[var(--crimson)] text-[var(--ivory)]"
                      : "border border-[var(--crimson-soft)]/60 text-[var(--crimson-soft)]"
                  }`}
                >
                  {status === "past"
                    ? "Closed"
                    : `Opens ${formatOpensOn(stage.startsAt)}`}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {atLimit && (
        <p className="mt-3 text-sm text-[var(--mist)]">
          You can buy up to {eventConfig.maxTicketsPerOrder} tickets per order.
        </p>
      )}
      <p className="mt-4 text-sm leading-relaxed text-[var(--mist)]">
        Before you continue, please take a moment to read our refund policy,
        which can be found under section 2 of our{" "}
        <a
          href={eventConfig.termsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--gold)] underline decoration-[var(--gold)]/50 underline-offset-4 hover:decoration-[var(--gold)]"
        >
          Terms &amp; Conditions
        </a>
        .
      </p>
    </section>
  );
}

function StepperButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--gold)]/50 text-lg leading-none text-[var(--gold)] transition hover:bg-[var(--gold)]/10 disabled:cursor-not-allowed disabled:border-[var(--pine-line)] disabled:text-[var(--pine-line)] disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

type DetailsStepProps = {
  formId: string;
  details: Details;
  errors: DetailsErrors;
  onChange: (field: keyof Details, value: string) => void;
  termsAccepted: boolean;
  termsError: string | null;
  onTermsChange: (accepted: boolean) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

const DETAIL_FIELDS: {
  field: keyof Details;
  label: string;
  type: string;
  autoComplete: string;
}[] = [
  { field: "firstName", label: "First name", type: "text", autoComplete: "given-name" },
  { field: "lastName", label: "Last name", type: "text", autoComplete: "family-name" },
  { field: "email", label: "Email", type: "email", autoComplete: "email" },
  { field: "confirmEmail", label: "Repeat email", type: "email", autoComplete: "email" },
  { field: "phone", label: "Phone number", type: "tel", autoComplete: "tel" },
];

function DetailsStep({
  formId,
  details,
  errors,
  onChange,
  termsAccepted,
  termsError,
  onTermsChange,
  onSubmit,
}: DetailsStepProps) {
  const termsId = `${formId}-terms`;
  return (
    <section aria-labelledby="details-step-heading">
      <h3
        id="details-step-heading"
        className="font-display text-2xl text-[var(--ivory)]"
      >
        Your details
      </h3>
      <form
        id={formId}
        noValidate
        onSubmit={onSubmit}
        className="mt-4 space-y-4 rounded-md border border-[var(--pine-line)] bg-[var(--evergreen)]/40 p-4 sm:p-5"
      >
        <div className="flex items-baseline justify-between">
          <p className="font-display text-lg text-[var(--ivory)]">
            Checkout details
          </p>
          <p className="text-xs text-[var(--mist)]">
            <span className="text-[var(--crimson-soft)]">*</span> Required
            fields
          </p>
        </div>
        {DETAIL_FIELDS.map(({ field, label, type, autoComplete }) => {
          const inputId = `${formId}-${field}`;
          const error = errors[field];
          return (
            <div key={field}>
              <label
                htmlFor={inputId}
                className="text-sm text-[var(--ivory-soft)]"
              >
                {label} <span className="text-[var(--crimson-soft)]">*</span>
              </label>
              <input
                id={inputId}
                name={field}
                type={type}
                autoComplete={autoComplete}
                required
                value={details[field]}
                onChange={(e) => onChange(field, e.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${inputId}-error` : undefined}
                className={`mt-1.5 w-full rounded-md border bg-[var(--night)]/60 px-3 py-2.5 text-[var(--ivory)] outline-none transition placeholder:text-[var(--mist)]/60 focus:border-[var(--gold)] ${
                  error
                    ? "border-[var(--crimson-soft)]"
                    : "border-[var(--pine-line)]"
                }`}
              />
              {error && (
                <p
                  id={`${inputId}-error`}
                  className="mt-1 text-sm text-[var(--crimson-soft)]"
                >
                  {error}
                </p>
              )}
            </div>
          );
        })}
        <div className="border-t border-[var(--pine-line)] pt-4">
          <div className="flex items-start gap-3">
            <input
              id={termsId}
              name="termsAccepted"
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => onTermsChange(e.target.checked)}
              aria-invalid={Boolean(termsError)}
              aria-describedby={termsError ? `${termsId}-error` : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--gold)]"
            />
            <label
              htmlFor={termsId}
              className="text-sm leading-relaxed text-[var(--ivory-soft)]"
            >
              I confirm that I have read and understood the{" "}
              <a
                href={eventConfig.termsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--gold)] underline decoration-[var(--gold)]/50 underline-offset-4 hover:decoration-[var(--gold)]"
              >
                Terms &amp; Conditions
              </a>{" "}
              of my purchase.{" "}
              <span className="text-[var(--crimson-soft)]">*</span>
            </label>
          </div>
          {termsError && (
            <p
              id={`${termsId}-error`}
              className="mt-1 text-sm text-[var(--crimson-soft)]"
            >
              {termsError}
            </p>
          )}
        </div>
      </form>
      <p className="mt-4 text-sm leading-relaxed text-[var(--mist)]">
        Once your purchase is complete, a confirmation email including a meal
        choice form will be sent to the email address above.
      </p>
    </section>
  );
}

type ReviewStepProps = {
  orderLines: OrderLine[];
  total: number;
  details: Details;
  paymentError: string | null;
  onEditTickets: () => void;
  onEditDetails: () => void;
};

function ReviewStep({
  orderLines,
  total,
  details,
  paymentError,
  onEditTickets,
  onEditDetails,
}: ReviewStepProps) {
  return (
    <section aria-labelledby="review-step-heading" className="space-y-5">
      <h3
        id="review-step-heading"
        className="font-display text-2xl text-[var(--ivory)]"
      >
        Review your order
      </h3>

      <ReviewCard title="Order summary" onEdit={onEditTickets}>
        <ul className="space-y-2">
          {orderLines.map(({ stage, quantity }) => (
            <li key={stage.id} className="flex justify-between gap-4 text-sm">
              <span className="text-[var(--ivory-soft)]">{stage.name}</span>
              <span className="tabular-nums text-[var(--ivory)]">
                {formatPrice(stage.price * quantity)} · ×{quantity}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-[var(--pine-line)] pt-3">
          <span className="font-display text-lg text-[var(--ivory)]">Total</span>
          <span className="font-display text-lg text-[var(--gold)]">
            {formatPrice(total)}
          </span>
        </div>
      </ReviewCard>

      <ReviewCard title="Your details" onEdit={onEditDetails}>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-[var(--mist)]">Name</dt>
          <dd className="break-words text-[var(--ivory)]">
            {details.firstName.trim()} {details.lastName.trim()}
          </dd>
          <dt className="text-[var(--mist)]">Email</dt>
          <dd className="break-all text-[var(--ivory)]">{details.email.trim()}</dd>
          <dt className="text-[var(--mist)]">Phone</dt>
          <dd className="text-[var(--ivory)]">{details.phone.trim()}</dd>
        </dl>
      </ReviewCard>

      {orderLines.length === 0 && (
        <p className="text-sm text-[var(--crimson-soft)]">
          The tickets you selected are no longer on sale. Please choose again.
        </p>
      )}

      {paymentError && (
        <p role="alert" className="text-sm text-[var(--crimson-soft)]">
          {paymentError}
        </p>
      )}

      <p className="text-sm text-[var(--mist)]">
        You&apos;ll be taken to Stripe to pay securely by card, Apple Pay or
        Google Pay. Your receipt will be emailed to {details.email.trim()}.
      </p>
    </section>
  );
}

function ReviewCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-[var(--pine-line)] bg-[var(--evergreen)]/40 p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="font-display text-lg text-[var(--ivory)]">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm text-[var(--gold)] underline decoration-[var(--gold)]/50 underline-offset-4 hover:decoration-[var(--gold)]"
        >
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}
