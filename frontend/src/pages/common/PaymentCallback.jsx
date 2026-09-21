import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { paymentApi } from '../../services/platformApi';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const paymentID = searchParams.get('paymentID');
    const status = searchParams.get('status') || 'success';
    if (!paymentID) {
      setError('Missing paymentID from the payment gateway.');
      return;
    }
    paymentApi
      .confirmCallback(paymentID, status)
      .then(() => navigate(status.toLowerCase().includes('cancel') || status.toLowerCase().includes('fail')
        ? '/payments?status=cancelled'
        : '/payments?status=funded', { replace: true }))
      .catch((err) => setError(err.response?.data?.message || 'Could not confirm payment'));
  }, [navigate, searchParams]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg rounded-xl border bg-white p-8 text-center">
        <h1 className="text-xl font-bold">Confirming payment…</h1>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : <p className="mt-3 text-sm text-slate-500">Please wait while we verify escrow with bKash.</p>}
      </div>
    </DashboardLayout>
  );
};

export default PaymentCallback;
