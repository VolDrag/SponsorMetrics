import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const RESEND_COOLDOWN_SECONDS = 60;

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { otpEmail, verifyOTP } = useAuth();
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const email = location.state?.email || otpEmail;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [cooldown]);

  const handleVerify = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await verifyOTP({ email, otp });
      navigate('/');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'OTP verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    setResending(true);

    try {
      await api.post('/api/auth/resend-otp', { email });
      setMessage('A new OTP has been sent to your email.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Verify OTP</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter the 6-digit code sent to <span className="font-medium text-slate-800">{email}</span>.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleVerify}>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="6-digit OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-lg tracking-[0.3em] outline-none focus:border-indigo-500"
            required
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

          <button
            type="submit"
            disabled={submitting || otp.length !== 6}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : resending ? 'Resending...' : 'Resend OTP'}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          Back to{' '}
          <Link className="font-semibold text-indigo-600 hover:text-indigo-700" to="/login">
            login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
