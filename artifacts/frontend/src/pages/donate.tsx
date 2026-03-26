import { useState, useEffect, useMemo } from "react";
import { useListDonations } from "@workspace/api-client-react";
import { Heart, Package, ShieldCheck, CheckCircle, Loader2, Smartphone, AlertCircle, CreditCard } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const BASE = import.meta.env.BASE_URL;
const apiUrl = (path: string) => `${BASE}api/${path}`;

interface PaymentConfig {
  publishableKey: string;
}

const monetarySchema = z.object({
  donorName: z.string().min(1, "Name required"),
  donorPhone: z.string().min(1, "Phone required"),
  amount: z.string().min(1, "Amount required"),
  paymentMethod: z.enum(["Visa", "Mastercard", "CliQ"]),
});

const suppliesSchema = z.object({
  donorName: z.string().min(1, "Name required"),
  donorPhone: z.string().min(1, "Phone required"),
  donationTypeLabel: z.string().min(1, "Select supply type"),
  description: z.string().min(5, "Please describe the supplies"),
});

type DonationStatus = "idle" | "processing" | "success" | "error";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1E2A3A",
      fontFamily: "inherit",
      "::placeholder": { color: "#94a3b8" },
    },
    invalid: { color: "#ef4444" },
  },
};

function StripeCardForm({
  donorName,
  donorPhone,
  amount,
  paymentMethodLabel,
  onSuccess,
  onError,
}: {
  donorName: string;
  donorPhone: string;
  amount: string;
  paymentMethodLabel: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setCardError("");
    try {
      const resp = await fetch(apiUrl("payments/stripe/create-intent"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, donorName, donorPhone, frequency: "one_time" }),
      });
      if (!resp.ok) throw new Error("Could not initiate payment");
      const { clientSecret } = await resp.json();

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const paymentIntentId = clientSecret.split("_secret_")[0];

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (result.error) {
        setCardError(result.error.message ?? "Payment failed");
        await fetch(apiUrl("payments/stripe/confirm"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId, status: "failed" }),
        });
        onError(result.error.message ?? "Payment declined");
      } else if (result.paymentIntent?.status === "succeeded") {
        await fetch(apiUrl("payments/stripe/confirm"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: result.paymentIntent.id, status: "success" }),
        });
        onSuccess();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setCardError(message);
      onError(message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-muted/50 rounded-xl p-4 border border-border">
        <label className="text-xs font-bold text-muted-foreground block mb-3 uppercase tracking-wide">
          Card Details
        </label>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      {cardError && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {cardError}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 transition-all hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {processing ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
        ) : (
          `Donate ${amount || 0} JOD via ${paymentMethodLabel}`
        )}
      </button>
    </form>
  );
}

function CliQSection({
  amount,
  donorName,
  donorPhone,
  onSuccess,
  onError,
}: {
  amount: string;
  donorName: string;
  donorPhone: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const resp = await fetch(apiUrl("payments/cliq/confirm"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, donorName, donorPhone, frequency: "one_time" }),
      });
      if (!resp.ok) throw new Error("Could not save donation");
      onSuccess();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Failed to confirm");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="font-bold text-foreground">CliQ Transfer Instructions</p>
            <p className="text-sm text-muted-foreground">Send {amount || "0"} JOD to:</p>
          </div>
        </div>
        <div className="space-y-3 bg-white rounded-xl p-4 border border-teal-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Phone / CliQ Number</span>
            <span className="font-bold text-foreground font-mono">00962799476182</span>
          </div>
          <div className="border-t border-border/50" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Account Name</span>
            <span className="font-bold text-foreground">Sara Ibrahim Bader</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          After completing the transfer, click the button below to confirm. We will verify and mark your donation as complete.
        </p>
      </div>
      <button
        onClick={handleConfirm}
        disabled={confirming}
        className="w-full bg-secondary hover:bg-secondary/90 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-secondary/25 transition-all hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {confirming ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Confirming...</>
        ) : (
          "I've Completed the Transfer ✓"
        )}
      </button>
    </div>
  );
}

function SuccessScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <div>
        <h3 className="font-display font-bold text-2xl text-foreground mb-2">Thank You! 🐾</h3>
        <p className="text-muted-foreground max-w-sm">
          Your donation helps rescued animals across Jordan find loving homes. You're making a real difference!
        </p>
      </div>
      <button
        onClick={onReset}
        className="bg-primary/10 hover:bg-primary/20 text-primary font-bold px-8 py-3 rounded-2xl transition-colors"
      >
        Donate Again
      </button>
    </div>
  );
}

function GoFundMeSection() {
  const raised = 8450;
  const goal = 15000;
  const pct = Math.min(100, Math.round((raised / goal) * 100));

  return (
    <div className="mt-16">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">Support Our GoFundMe Campaign</h2>
        <p className="text-muted-foreground">Help us reach our goal and transform more lives</p>
      </div>
      <div
        className="group relative bg-gradient-to-br from-orange-50 via-white to-teal-50 border border-border rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl"
        style={{ transform: "perspective(1000px)", transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "perspective(1000px) rotateX(2deg) rotateY(-1deg) translateY(-8px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 30px 60px rgba(255, 107, 53, 0.15), 0 0 0 1px rgba(255, 107, 53, 0.1)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "";
        }}
      >
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative h-56 md:h-auto overflow-hidden">
            <img
              src={`${BASE}images/hero-pets.png`}
              alt="Pets waiting for adoption"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-orange-50/30 md:block hidden" />
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-center space-y-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                GoFundMe Campaign
              </span>
              <h3 className="font-display font-bold text-2xl text-foreground mt-3 mb-2">
                Every Pet Deserves a Loving Home
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Help us rescue, rehabilitate, and rehome stray and abandoned animals across Jordan. Your support pays for medical care, food, and shelter while we find them their forever families.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-primary">{raised.toLocaleString()} JOD raised</span>
                <span className="text-muted-foreground">of {goal.toLocaleString()} JOD goal</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{pct}% funded · 47 donors</p>
            </div>
            <a
              href="https://www.gofundme.com/f/tabbani-pet-adoption-jordan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0 text-center"
            >
              <Heart className="w-5 h-5" />
              Donate on GoFundMe
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Donate() {
  const [tab, setTab] = useState<"monetary" | "supplies">("monetary");
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [configError, setConfigError] = useState(false);
  const [donationStatus, setDonationStatus] = useState<DonationStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [suppliesSubmitting, setSuppliesSubmitting] = useState(false);
  const { data: recentDonors, refetch: refetchDonors } = useListDonations({ limit: 5 });

  const monetaryForm = useForm<z.infer<typeof monetarySchema>>({
    resolver: zodResolver(monetarySchema),
    defaultValues: { donorName: "", donorPhone: "", amount: "25", paymentMethod: "Visa" },
  });

  const suppliesForm = useForm<z.infer<typeof suppliesSchema>>({
    resolver: zodResolver(suppliesSchema),
    defaultValues: { donorName: "", donorPhone: "", donationTypeLabel: "Food", description: "" },
  });

  const watchedAmount = monetaryForm.watch("amount");
  const watchedMethod = monetaryForm.watch("paymentMethod");
  const watchedName = monetaryForm.watch("donorName");
  const watchedPhone = monetaryForm.watch("donorPhone");

  useEffect(() => {
    fetch(apiUrl("payments/config"))
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((cfg: PaymentConfig) => setConfig(cfg))
      .catch(() => setConfigError(true));
  }, []);

  const stripePromise = useMemo(
    () => (config?.publishableKey ? loadStripe(config.publishableKey) : null),
    [config?.publishableKey],
  );

  const handleSuccess = () => {
    setDonationStatus("success");
    refetchDonors();
  };

  const handleError = (msg: string) => {
    setDonationStatus("error");
    setErrorMsg(msg);
  };

  const handleReset = () => {
    setDonationStatus("idle");
    setErrorMsg("");
    monetaryForm.reset({ donorName: "", donorPhone: "", amount: "25", paymentMethod: "Visa" });
  };

  const onSuppliesSubmit = async (values: z.infer<typeof suppliesSchema>) => {
    setSuppliesSubmitting(true);
    try {
      const resp = await fetch(apiUrl("donations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, type: "supplies" }),
      });
      if (!resp.ok) throw new Error("Failed");
      setDonationStatus("success");
      refetchDonors();
    } catch {
      setDonationStatus("error");
      setErrorMsg("Failed to submit. Please try again.");
    } finally {
      setSuppliesSubmitting(false);
    }
  };

  const isCardMethod = watchedMethod === "Visa" || watchedMethod === "Mastercard";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
          Support Our Mission
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          100% of your donation goes directly towards food, medical care, and shelter for rescued animals across Jordan. Every dinar makes a difference.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 bg-card rounded-3xl border border-border shadow-xl shadow-black/5 overflow-hidden">
          <div className="flex border-b border-border">
            <button
              onClick={() => { setTab("monetary"); handleReset(); }}
              className={`flex-1 py-6 flex items-center justify-center gap-2 font-bold text-sm transition-colors ${
                tab === "monetary" ? "bg-white text-primary border-b-2 border-primary" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Heart className="w-5 h-5" /> Monetary Donation
            </button>
            <button
              onClick={() => { setTab("supplies"); handleReset(); }}
              className={`flex-1 py-6 flex items-center justify-center gap-2 font-bold text-sm transition-colors ${
                tab === "supplies" ? "bg-white text-secondary border-b-2 border-secondary" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Package className="w-5 h-5" /> Donate Supplies
            </button>
          </div>

          <div className="p-8 md:p-12">
            {donationStatus === "success" ? (
              <SuccessScreen onReset={handleReset} />
            ) : tab === "monetary" ? (
              <div className="space-y-8">
                <div>
                  <label className="text-sm font-bold block mb-4">Select Amount (JOD)</label>
                  <div className="grid grid-cols-4 gap-3">
                    {["10", "25", "50", "100"].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => monetaryForm.setValue("amount", amt)}
                        className={`py-3 rounded-2xl font-bold text-lg transition-all ${
                          watchedAmount === amt
                            ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                            : "bg-muted text-foreground hover:bg-muted/80"
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <input
                      type="number"
                      placeholder="Other Amount"
                      {...monetaryForm.register("amount")}
                      className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Your Name</label>
                    <input
                      {...monetaryForm.register("donorName")}
                      className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                    />
                    {monetaryForm.formState.errors.donorName && (
                      <p className="text-xs text-red-500">{monetaryForm.formState.errors.donorName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Phone Number</label>
                    <input
                      {...monetaryForm.register("donorPhone")}
                      className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold block">Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "Visa", label: "💳 Visa" },
                      { value: "Mastercard", label: "💳 Mastercard" },
                      { value: "CliQ", label: "📱 CliQ" },
                    ].map(method => (
                      <label
                        key={method.value}
                        className={`flex items-center justify-center gap-2 p-4 rounded-2xl cursor-pointer transition-colors border ${
                          watchedMethod === method.value
                            ? "bg-primary/10 border-primary text-primary font-bold"
                            : "bg-muted/50 border-border hover:bg-muted"
                        }`}
                      >
                        <input
                          type="radio"
                          value={method.value}
                          {...monetaryForm.register("paymentMethod")}
                          className="accent-primary sr-only"
                        />
                        <span className="font-bold text-sm text-center">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {isCardMethod && (
                  <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-border">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">SARA I BADER</p>
                        <p className="text-xs text-muted-foreground">Safwa Islamic Bank · ···· 2769</p>
                      </div>
                    </div>
                    {configError ? (
                      <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
                        Payment provider not available. Please try CliQ instead.
                      </div>
                    ) : !stripePromise ? (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading payment form...
                      </div>
                    ) : (
                      <Elements stripe={stripePromise} options={{ appearance: { theme: "stripe" } }}>
                        <StripeCardForm
                          donorName={watchedName}
                          donorPhone={watchedPhone}
                          amount={watchedAmount}
                          paymentMethodLabel={watchedMethod}
                          onSuccess={handleSuccess}
                          onError={handleError}
                        />
                      </Elements>
                    )}
                  </div>
                )}

                {watchedMethod === "CliQ" && (
                  <CliQSection
                    amount={watchedAmount}
                    donorName={watchedName}
                    donorPhone={watchedPhone}
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                )}

                {donationStatus === "error" && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg || "Payment failed. Please try again."}
                    <button
                      onClick={() => setDonationStatus("idle")}
                      className="ml-auto text-xs underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <ShieldCheck className="w-4 h-4 text-secondary" />
                  Secure encrypted checkout
                </div>
              </div>
            ) : (
              <form onSubmit={suppliesForm.handleSubmit(onSuppliesSubmit)} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold block">What are you donating?</label>
                  <select
                    {...suppliesForm.register("donationTypeLabel")}
                    className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50 outline-none"
                  >
                    <option value="Food">Pet Food (Dry/Wet)</option>
                    <option value="Blankets">Blankets & Beds</option>
                    <option value="Toys">Toys</option>
                    <option value="Medicine">Medicine & Supplies</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Description of items</label>
                  <textarea
                    {...suppliesForm.register("description")}
                    placeholder="E.g. 2 large bags of adult dog food, 3 new fleece blankets..."
                    className="w-full min-h-[120px] bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50 outline-none resize-none"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Your Name</label>
                    <input
                      {...suppliesForm.register("donorName")}
                      className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Phone Number</label>
                    <input
                      {...suppliesForm.register("donorPhone")}
                      className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50"
                    />
                  </div>
                </div>
                {donationStatus === "error" && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={suppliesSubmitting}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-secondary/25 transition-all hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {suppliesSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                  ) : (
                    "Schedule Drop-off"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-foreground text-white p-8 rounded-3xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-display font-bold text-2xl mb-4">Why donate?</h3>
              <ul className="space-y-4 text-white/80 text-sm">
                <li className="flex gap-3"><span className="text-primary font-bold">✓</span> Helps rescue injured animals from the streets</li>
                <li className="flex gap-3"><span className="text-primary font-bold">✓</span> Pays for vaccinations and sterilization</li>
                <li className="flex gap-3"><span className="text-primary font-bold">✓</span> Provides food for fosters who can't afford it</li>
              </ul>
            </div>
            <Heart className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5" />
          </div>

          <div className="bg-card border border-border p-8 rounded-3xl">
            <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" /> Recent Donors
            </h3>
            <div className="space-y-4">
              {recentDonors?.slice(0, 5).map(donor => (
                <div key={donor.id} className="flex justify-between items-center pb-4 border-b border-border/50 last:border-0 last:pb-0">
                  <span className="font-medium text-sm">{donor.donorName}</span>
                  {donor.type === "monetary" ? (
                    <span className="text-primary font-bold text-sm">{donor.amount} JOD</span>
                  ) : (
                    <span className="text-secondary font-bold text-xs px-2 py-1 bg-secondary/10 rounded-md">Supplies</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <GoFundMeSection />
    </div>
  );
}
