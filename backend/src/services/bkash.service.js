const axios = require('axios');

const baseUrl = () => (process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta').replace(/\/$/, '');
const mockMode = () =>
  process.env.BKASH_MOCK === 'true' ||
  !process.env.BKASH_APP_KEY ||
  !process.env.BKASH_APP_SECRET;

let cachedToken = { value: null, exp: 0 };

const grantToken = async () => {
  if (mockMode()) return 'mock-bkash-token';
  if (cachedToken.value && Date.now() < cachedToken.exp) return cachedToken.value;

  const { data } = await axios.post(
    `${baseUrl()}/tokenized/checkout/token/grant`,
    {
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    },
    {
      headers: {
        username: process.env.BKASH_USERNAME,
        password: process.env.BKASH_PASSWORD,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );
  cachedToken = { value: data.id_token, exp: Date.now() + 50 * 60 * 1000 };
  return data.id_token;
};

const authHeaders = async () => ({
  Authorization: await grantToken(),
  'X-APP-Key': process.env.BKASH_APP_KEY,
  'Content-Type': 'application/json',
});

exports.isMock = mockMode;

exports.createPayment = async ({ amount, invoice, callbackURL }) => {
  if (mockMode()) {
    const paymentID = `mock_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    return {
      mock: true,
      paymentID,
      bkashURL: null,
      amount: Number(amount),
      invoice,
    };
  }

  const { data } = await axios.post(
    `${baseUrl()}/tokenized/checkout/create`,
    {
      mode: '0011',
      payerReference: invoice,
      callbackURL: callbackURL || `${process.env.FRONTEND_URL}/sponsor/payments/callback`,
      amount: String(Number(amount).toFixed(2)),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: invoice,
    },
    { headers: await authHeaders(), timeout: 15000 }
  );
  return data;
};

exports.executePayment = async (paymentID) => {
  if (mockMode() || String(paymentID).startsWith('mock_')) {
    return {
      mock: true,
      paymentID,
      transactionStatus: 'Completed',
      trxID: `trx_${paymentID.slice(-8)}`,
    };
  }
  const { data } = await axios.post(
    `${baseUrl()}/tokenized/checkout/execute`,
    { paymentID },
    { headers: await authHeaders(), timeout: 15000 }
  );
  return data;
};

exports.queryPayment = async (paymentID) => {
  if (mockMode() || String(paymentID).startsWith('mock_')) {
    return { paymentID, transactionStatus: 'Completed', mock: true };
  }
  const { data } = await axios.post(
    `${baseUrl()}/tokenized/checkout/payment/status`,
    { paymentID },
    { headers: await authHeaders(), timeout: 15000 }
  );
  return data;
};

exports.refundPayment = async ({ paymentID, trxID, amount, reason }) => {
  if (mockMode() || String(paymentID).startsWith('mock_')) {
    return { paymentID, refundTrxID: `ref_${Date.now()}`, amount, mock: true };
  }
  const { data } = await axios.post(
    `${baseUrl()}/tokenized/checkout/payment/refund`,
    {
      paymentID,
      trxID,
      amount: String(Number(amount).toFixed(2)),
      sku: 'sponsorship',
      reason: reason || 'Deal cancelled',
    },
    { headers: await authHeaders(), timeout: 15000 }
  );
  return data;
};

exports.verifyWebhook = (rawBody, header) => {
  const secret = process.env.BKASH_WEBHOOK_SECRET;
  if (!secret) return true;
  const crypto = require('crypto');
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return digest === header;
};
