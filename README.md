# Montego e-subscription (React)

The buyer flow from the Montego Skyline prototype as a React app driven by your API.

1. **Unit:** pick a unit. Each card shows "N left", AVAILABLE or SOLD OUT.
2. **Plan:** a slider over the plan lengths, with deposit, monthly amount, documentation fee and a payment chart.
3. **Details:** email → 6-digit code → details. A returning buyer's details are filled in and locked; a new buyer types them.
4. **Payment:** amount due, bank accounts, transfer reference. "I've made payment" checks the status until it's confirmed.

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173/?listing=montego-skyline&agent=gbemileke`.

In `.env`, either:

- set `VITE_API_BASE_URL` to your API, or
- set `VITE_USE_MOCK=true` to use sample data (code **123456**; an email containing "new" acts like a first-time buyer).

`npm run build` writes static files to `dist/`. `npm run format` tidies the code with Prettier.

---

## Plugging in the backend

Everything lives in `src/api/`. You will usually touch only the first two files.

| File               | What to change there                                                                 |
| ------------------ | ------------------------------------------------------------------------------------ |
| **`endpoints.ts`** | The method and path of each call.                                                    |
| **`mappers.ts`**   | Convert your response into the form's types, if your field names differ.             |
| `client.ts`        | Auth headers (`extraHeaders`), cookies (`credentials`), how error messages are read. |
| `types.ts`         | The shapes the form uses. Read this to see what each response needs.                 |
| `mock.ts`          | Sample data used when `VITE_USE_MOCK=true`.                                          |
| `index.ts`         | Wires the above together. No need to edit.                                           |

### The six calls

| #   | Call                 | Default endpoint                          | Sends                     | Expects back                                                                  |
| --- | -------------------- | ----------------------------------------- | ------------------------- | ----------------------------------------------------------------------------- |
| 1   | `getListing`         | `GET /listings/:listingId?agent=:agentId` |                           | `Listing`                                                                     |
| 2   | `sendOtp`            | `POST /auth/otp`                          | `{ email }`               | anything (ignored)                                                            |
| 3   | `verifyOtp`          | `POST /auth/otp/verify`                   | `{ email, code }`         | `{ verificationToken, customer }`, where `customer` is `null` for a new buyer |
| 4   | `createSubscription` | `POST /subscriptions`                     | `CreateSubscriptionInput` | `Subscription`                                                                |
| 5   | `markPaymentSent`    | `POST /subscriptions/:id/payment-sent`    | `{}`                      | anything (ignored)                                                            |
| 6   | `getPaymentStatus`   | `GET /subscriptions/:id/payment-status`   |                           | `{ status: "pending" }` or `{ status: "confirmed", amountPaid, totalAmount }` |

**Errors:** return a non-2xx status with `{ "message": "..." }`. The message is shown to the buyer as-is (e.g. "That code is not right."). If your errors look different, edit `errorMessage()` in `client.ts`.

### Example: different field names

Say your listing endpoint returns `{ estate_name, units: [{ unit_id, available }] }`. In `mappers.ts`:

```ts
export const toListing = (raw: any): Listing => ({
  id: raw.id,
  name: raw.estate_name,
  // ...
  units: raw.units.map((u: any) => ({
    id: u.unit_id,
    unitsLeft: u.available,
    // ...
  })),
});
```

Components never see your raw response, so nothing else changes.

### Notes for the backend

- `verifyOtp` → `customer`: any field you send is shown read-only; blank, null or missing fields stay editable for the buyer to fill in.
- `createSubscription` can be called again for the same buyer if they go back from payment and continue. Make it safe to repeat (e.g. return the existing pending subscription for the same email + unit + plan).
- `unitsLeft`: `null` = AVAILABLE, `1`, `2`, … = "N left", `0` = SOLD OUT (the card can't be tapped).
- The plan page previews figures from `listing.plan` (`depositRate`, `annualInterestRate`, `documentationFeeRate`). The payment page shows what `createSubscription` returns, so the backend has the final say on amounts.
- `plan.monthOptions` can be any list of months. Whole years show as 1, 2 … 8 YRS on the slider, and anything else shows as months (e.g. 18M).
- Card colours come from `unit.color`, then `listing.palette`, then a default earth palette.
- Payment status is checked every 3 seconds for up to 3 minutes, then the buyer gets "Check again". Change this at the top of `src/hooks/usePaymentStatus.ts`.

---

## Code map

```
src/
  App.tsx                 holds the step state and creates the subscription
  api/                    everything that talks to the backend (see above)
  hooks/
    useListing.ts         loads the listing, with retry
    usePaymentStatus.ts   polls payment status
    useCountdown.ts       "Resend code in 30s"
    useShake.ts           shakes the form when Continue is tapped too early
  lib/
    plan.ts               plan maths (total, deposit, monthly)
    format.ts             ₦ amounts, account numbers, dates
    colors.ts             unit colours → CSS variables
  components/             small pieces used by the steps
    Hero, ListingHeader, Stepper, ActionBar, Spinner, CheckIcon
    UnitCard, UnitTicket, PlanSlider, PlanSummary, OtpInput, BankAccountCard
  steps/
    UnitStep.tsx          step 1
    PlanStep.tsx          step 2
    DetailsStep.tsx       step 3 (email → code → details)
    PaymentStep.tsx       step 4
    PaymentConfirmed.tsx  shown once payment is confirmed
  styles/global.css       all styles, grouped by step
public/mock/              sample images used by the mock
```

The share link carries `?listing=` (which estate, required) and `?agent=` (who shared it, optional). Both are read at the top of `App.tsx`. A link without `?listing=` shows "This link is incomplete".
