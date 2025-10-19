import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Clock, Lock, Mail, Phone, Timer } from 'lucide-react';
import { ResetPasswordModal } from './ResetPasswordModal';

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const { login, loginWithPhone, loginWithGoogle, loginDemo } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sendOTP = async (phoneNumber: string) => {
    if (!phoneNumber.trim()) return;
    
    setOtpLoading(true);
    setError('');
    
    // Simulate API delay
    setTimeout(() => {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOTP(otp);
      setOtpSent(true);
      setOtpLoading(false);
      
      // For demo purposes, we'll also set the verification code automatically after 2 seconds
      setTimeout(() => {
        setVerificationCode(otp);
      }, 2000);
    }, 1500);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setOtpSent(false);
    setGeneratedOTP('');
    setVerificationCode('');
    setError('');
    
    // Auto-send OTP when phone number looks complete
    if (value.length >= 10) {
      sendOTP(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginMethod === 'email') {
        await login(email, password);
      } else {
        await loginWithPhone(phone, verificationCode);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => setShowReset(true);
  
  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await loginDemo();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)
          `,
          backgroundSize: '400px 400px',
          animation: 'float 20s ease-in-out infinite'
        }} />
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Main Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          
          {/* Header with Clock */}
          <div className="text-center mb-8">
            {/* Digital Clock - Compact & Clean */}
            <div className="inline-block mb-6">
              <div className="bg-black/20 backdrop-blur-md px-6 py-2 rounded-xl border border-cyan-400/30 shadow-lg">
                <div className="text-xl font-mono font-bold text-cyan-300 tracking-wider">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-xs text-cyan-400/60">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl mb-4 shadow-xl">
              <Clock className="w-8 h-8 text-white" />
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-2">TimeBank</h1>
            <p className="text-cyan-300/80 text-sm">Exchange Time, Not Money</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
            
            {/* Error Message */}
            {error && !error.includes('auth/api-key-not-valid') && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Quick Access Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Google Sign-In */}
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await loginWithGoogle();
                  } catch (err: any) {
                    setError(err.message);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl hover:bg-red-500/30 transition-all duration-300 disabled:opacity-50"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">G</div>
                  <div className="text-sm text-white font-medium">Google</div>
                </div>
              </button>

              {/* Demo User */}
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await login('demo@timebank.com', 'demo123');
                  } catch (err: any) {
                    setError(err.message);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="p-4 bg-cyan-500/20 border border-cyan-500/50 rounded-xl hover:bg-cyan-500/30 transition-all duration-300 disabled:opacity-50"
              >
                <div className="text-center">
                  <Timer className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm text-white font-medium">Demo</div>
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/60">or continue with</span>
              </div>
            </div>

            {/* Method Toggle */}
            <div className="flex bg-white/10 rounded-xl p-1 mb-6">
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${
                  loginMethod === 'email' 
                    ? 'bg-cyan-500 text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
                onClick={() => setLoginMethod('email')}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${
                  loginMethod === 'phone' 
                    ? 'bg-cyan-500 text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
                onClick={() => setLoginMethod('phone')}
              >
                <Phone className="w-4 h-4" />
                Phone
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {loginMethod === 'email' && (
                <>
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-cyan-400 outline-none transition-all text-white placeholder-white/40"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-cyan-400 outline-none transition-all text-white placeholder-white/40"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {loginMethod === 'phone' && (
                <>
                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="+1-555-DEMO"
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-cyan-400 outline-none transition-all text-white placeholder-white/40"
                        required
                      />
                    </div>
                    {phone.length >= 10 && (
                      <div className="mt-2 text-sm">
                        {otpLoading && (
                          <div className="flex items-center gap-2 text-blue-300">
                            <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                            Sending OTP...
                          </div>
                        )}
                        {otpSent && !otpLoading && (
                          <div className="flex items-center gap-2 text-green-300">
                            <Timer className="w-4 h-4 animate-pulse" />
                            OTP sent to {phone}
                            {generatedOTP && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded font-mono text-xs border border-green-400/30">
                                {generatedOTP}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Verification Code Field */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Verification Code</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        onFocus={() => setFocusedField('verificationCode')}
                        onBlur={() => setFocusedField(null)}
                        placeholder={otpSent ? "Enter OTP or wait for auto-fill..." : "Enter OTP"}
                        className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl focus:border-cyan-400 outline-none transition-all text-white placeholder-white/40 ${
                          verificationCode === generatedOTP && generatedOTP ? 'border-green-400 bg-green-500/10' : 'border-white/20'
                        }`}
                        required
                      />
                    </div>
                    {verificationCode === generatedOTP && generatedOTP && (
                      <div className="mt-2 text-sm text-green-300 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-400 animate-pulse" />
                        Code verified • Ready to proceed
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5" />
                    Enter TimeBank
                  </>
                )}
              </button>
            </form>

            {/* Footer Actions */}
            <div className="mt-6 text-center space-y-3">
              <button
                type="button"
                onClick={onToggleMode}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Create Account
              </button>
              
              <div className="text-white/40">•</div>
              
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-cyan-400/70 hover:text-cyan-300 text-sm transition-colors"
              >
                Forgot Password?
              </button>
              
              <div className="text-white/40">•</div>
              
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition-colors"
              >
                Browse as Demo
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-cyan-300 mb-2">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-semibold">Gmail Integration</span>
            </div>
            <p className="text-xs text-cyan-200/80">
              Any Gmail account • 6+ character password • Instant access
            </p>
          </div>
        </div>
      </div>

      {showReset && <ResetPasswordModal onClose={() => setShowReset(false)} />}

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
};