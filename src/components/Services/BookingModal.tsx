import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Calendar, Clock, Lock } from 'lucide-react';
import { Service } from '../../types';
import { dataService } from '../../services/dataService';
import { ChatWindow } from '../Chat/ChatWindow';
import ServiceBalanceModal from './ServiceBalanceModal';

interface BookingModalProps {
  service: Service;
  onClose: () => void;
  onBooked: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ service, onClose, onBooked }) => {
  const { user, isDemo, logout } = useAuth();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [showDemoWarning, setShowDemoWarning] = useState(false);

  // Check service balance - user can request until they have 3 more requests than completions
  const servicesCompleted = user?.services_completed || 0;
  const servicesRequested = user?.services_requested || 0;
  const serviceBalance = servicesRequested - servicesCompleted;
  const canRequest = serviceBalance < 3;

  // Show demo warning immediately if user is in demo mode
  useEffect(() => {
    if (isDemo) {
      setShowDemoWarning(true);
    }
  }, [isDemo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Show demo warning if user is in demo mode
    if (isDemo) {
      setShowDemoWarning(true);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const scheduledStart = new Date(`${date}T${startTime}`);
      const scheduledEnd = new Date(scheduledStart.getTime() + duration * 60 * 60 * 1000);

      await dataService.createBooking({
        service_id: service.id,
        provider_id: service.provider_id,
        requester_id: user.id,
        scheduled_start: scheduledStart.toISOString(),
        scheduled_end: scheduledEnd.toISOString(),
        duration_hours: duration,
        confirmation_status: 'pending'
      });

      // Only show the limit warning after booking 3 more services than provided
      const newServicesRequested = servicesRequested + 1;
      const serviceBalance = newServicesRequested - servicesCompleted;
      
      if (serviceBalance >= 3) {
        setShowLimitWarning(true);
      } else {
        onBooked();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalCredits = duration * service.credits_per_hour;

  // Handle closing the limit warning
  const handleCloseLimitWarning = () => {
    setShowLimitWarning(false);
    onClose();
  };

  // If in demo mode, only show the demo warning
  if (isDemo && showDemoWarning) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">
              <Lock className="w-16 h-16 mx-auto text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">
              You're currently browsing in demo mode. To book services, please log in with your account.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition"
              >
                Go to Login
              </button>
              <button
                onClick={() => setShowDemoWarning(false)}
                className="w-full px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Limit Reached Warning Modal */}
      {showLimitWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Service Request Limit Reached</h2>
              <p className="text-gray-600 mb-4">
                You've successfully booked this service! However, you've reached your service request quota.
              </p>
              <div className="bg-amber-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">Current Balance:</span> {serviceBalance} more requests than provided
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">To request more services:</span> Please provide a service first
                </p>
              </div>
              <button
                onClick={handleCloseLimitWarning}
                className="w-full px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition"
              >
                Got it!
              </button>
              <button
                onClick={() => {
                  setShowLimitWarning(false);
                  setShowBalanceModal(true);
                }}
                className="w-full mt-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Limit Reached Warning Modal */}
      {showLimitWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Service Request Limit Reached</h2>
              <p className="text-gray-600 mb-4">
                You've successfully booked this service! However, you've reached your service request quota.
              </p>
              <div className="bg-amber-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">Current Ratio:</span> {servicesRequested}/{servicesCompleted * 3}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">To request more services:</span> Please provide a service first
                </p>
              </div>
              <button
                onClick={handleCloseLimitWarning}
                className="w-full px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition"
              >
                Got it!
              </button>
              <button
                onClick={() => {
                  setShowLimitWarning(false);
                  setShowBalanceModal(true);
                }}
                className="w-full mt-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Only show booking form if not in demo mode or if demo warning is dismissed */}
      {!isDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Book Service</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

          {/* Main Content: Split into form and chat */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Left Column: Booking Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-1">{service.title}</h3>
            <p className="text-sm text-gray-600">{service.description}</p>
            {service.provider && (
              <p className="text-sm text-gray-500 mt-2">Provider: {service.provider.username}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="w-4 h-4 inline mr-1" />
              Start Time
            </label>
            <input
              id="time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (hours)
            </label>
            <input
              id="duration"
              type="number"
              min="1"
              max="8"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium text-gray-800">{duration} hour{duration !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Rate:</span>
              <span className="font-medium text-gray-800">{service.credits_per_hour} credit/hour</span>
            </div>
            <div className="border-t border-emerald-200 mt-2 pt-2 flex items-center justify-between">
              <span className="font-semibold text-gray-800">Credits to Hold:</span>
              <span className="text-xl font-bold text-emerald-700">{totalCredits} credits</span>
            </div>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">💡 Note:</span> Credits will be held (reserved) until the service provider confirms your booking. 
                If declined, credits will be returned to your balance.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowChat(!showChat)}
              className="flex-1 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
            >
              {showChat ? 'Hide Chat' : 'Chat Now'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Booking...' : 'Book Now'}
            </button>
          </div>
            </form>

            {/* Right Column: Chat Panel */}
            {showChat && (
              <div className="hidden lg:flex flex-col border border-gray-200 rounded-lg overflow-hidden h-[600px]">
                <ChatWindow peerId={service.provider_id} service={service} embedded={true} />
              </div>
            )}

            {/* Mobile Chat: Full width below form */}
            {showChat && (
              <div className="lg:hidden col-span-1 border border-gray-200 rounded-lg overflow-hidden h-[400px]">
                <ChatWindow peerId={service.provider_id} service={service} embedded={true} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Booking Form - only show if not in demo mode */}
      {!isDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Book Service</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                  
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-800 font-semibold">Rate:</span>
                      <span className="text-emerald-600">{service.credits_per_hour} credits/hour</span>
                    </div>
                  </div>
                </div>

                {/* Booking Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (hours)
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(hours => (
                        <option key={hours} value={hours}>{hours} hour{hours > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Credits:</span>
                      <span className="text-xl font-bold text-emerald-600">{totalCredits}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowChat(!showChat)}
                      className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
                    >
                      {showChat ? 'Hide Chat' : 'Chat First'}
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !canRequest}
                      className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Booking...
                        </>
                      ) : (
                        'Book Service'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Chat Section */}
              {showChat && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <ChatWindow 
                    currentUser={user!}
                    otherUserId={service.provider_id}
                    otherUserName={`Provider of ${service.title}`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Service Balance Modal */}
      <ServiceBalanceModal
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        servicesCompleted={servicesCompleted}
        servicesRequested={servicesRequested}
        canRequest={canRequest}
      />
    </>
  );
};