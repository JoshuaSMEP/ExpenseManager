import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Plus,
  Calendar,
  DollarSign,
  X,
  MapPin,
} from 'lucide-react';
import { GlassCard, Button, Input } from '../components/ui';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Trip } from '../types';

const mockTrips: Trip[] = [
  {
    id: 'trip1',
    name: 'Q4 Sales Conference - Las Vegas',
    startDate: new Date('2024-11-15'),
    endDate: new Date('2024-11-18'),
    budget: 2000,
    description: 'Annual sales kickoff conference',
  },
  {
    id: 'trip2',
    name: 'Client Visit - NYC',
    startDate: new Date('2024-11-20'),
    endDate: new Date('2024-11-21'),
    budget: 1500,
    description: 'Meeting with key accounts',
  },
  {
    id: 'trip3',
    name: 'Tech Summit 2024',
    startDate: new Date('2024-12-05'),
    endDate: new Date('2024-12-07'),
    budget: 3000,
    description: 'Industry conference and networking',
  },
];

// Mock trip expenses (linking expenses to trips)
const mockTripExpenses: Record<string, string[]> = {
  trip1: ['1', '3'],
  trip2: ['2'],
  trip3: [],
};

export function TripsPage() {
  const navigate = useNavigate();
  const { expenses } = useStore();
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [tripExpenses, setTripExpenses] = useState(mockTripExpenses);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: '',
    startDate: '',
    endDate: '',
    budget: '',
    description: '',
  });

  const getTripTotal = (tripId: string) => {
    const expenseIds = tripExpenses[tripId] || [];
    return expenseIds.reduce((sum, id) => {
      const expense = expenses.find((e) => e.id === id);
      return sum + (expense?.amount || 0);
    }, 0);
  };

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return { color: 'bg-red-500', textColor: 'text-red-400', status: 'Over Budget' };
    if (percentage >= 80) return { color: 'bg-warning', textColor: 'text-warning', status: 'Near Limit' };
    return { color: 'bg-success-primary', textColor: 'text-success-primary', status: 'On Track' };
  };

  const handleAddTrip = () => {
    if (!newTrip.name || !newTrip.startDate || !newTrip.endDate) return;

    const trip: Trip = {
      id: `trip${Date.now()}`,
      name: newTrip.name,
      startDate: new Date(newTrip.startDate),
      endDate: new Date(newTrip.endDate),
      budget: newTrip.budget ? parseFloat(newTrip.budget) : undefined,
      description: newTrip.description || undefined,
    };

    setTrips((prev) => [...prev, trip]);
    setTripExpenses((prev) => ({ ...prev, [trip.id]: [] }));
    setShowAddModal(false);
    setNewTrip({ name: '', startDate: '', endDate: '', budget: '', description: '' });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 md:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.10)' }}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Trips & Projects</h1>
            <p className="text-white/60 text-sm">{trips.length} active trips</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
            Add Trip
          </Button>
        </motion.div>

        {/* Trips List */}
        <AnimatePresence mode="popLayout">
          {trips.length > 0 ? (
            <motion.div layout className="space-y-4">
              {trips.map((trip, index) => {
                const spent = getTripTotal(trip.id);
                const budget = trip.budget || 0;
                const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
                const budgetStatus = budget > 0 ? getBudgetStatus(spent, budget) : null;
                const tripExpensesList = (tripExpenses[trip.id] || [])
                  .map((id) => expenses.find((e) => e.id === id))
                  .filter(Boolean);

                return (
                  <motion.div
                    key={trip.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard
                      className="cursor-pointer"
                      onClick={() => setSelectedTrip(selectedTrip?.id === trip.id ? null : trip)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-6 h-6 text-accent-primary" />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-white font-semibold">{trip.name}</h3>
                              <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                </span>
                              </div>
                            </div>
                            <ChevronRight
                              className={`w-5 h-5 text-white/40 transition-transform ${
                                selectedTrip?.id === trip.id ? 'rotate-90' : ''
                              }`}
                            />
                          </div>

                          {/* Budget Progress */}
                          {budget > 0 && (
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-white/60">
                                  {formatCurrency(spent)} of {formatCurrency(budget)}
                                </span>
                                {budgetStatus && (
                                  <span className={budgetStatus.textColor}>{budgetStatus.status}</span>
                                )}
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.5 }}
                                  className={`h-full ${budgetStatus?.color} rounded-full`}
                                />
                              </div>
                            </div>
                          )}

                          {/* Expanded: Show expenses */}
                          <AnimatePresence>
                            {selectedTrip?.id === trip.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-4 overflow-hidden"
                              >
                                {trip.description && (
                                  <p className="text-white/60 text-sm mb-3">{trip.description}</p>
                                )}

                                <div className="border-t border-white/10 pt-3">
                                  <p className="text-white/80 text-sm font-medium mb-2">
                                    Expenses ({tripExpensesList.length})
                                  </p>
                                  {tripExpensesList.length > 0 ? (
                                    <div className="space-y-2">
                                      {tripExpensesList.map((expense) => (
                                        <div
                                          key={expense!.id}
                                          className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/expense/${expense!.id}`);
                                          }}
                                        >
                                          <span className="text-white text-sm">
                                            {expense!.merchantName}
                                          </span>
                                          <span className="text-white font-medium text-sm">
                                            {formatCurrency(expense!.amount)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-white/40 text-sm">No expenses added yet</p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <GlassCard>
                <div className="text-6xl mb-4">🧳</div>
                <h3 className="text-xl font-semibold text-white mb-2">No trips yet</h3>
                <p className="text-white/60 mb-4">
                  Create a trip to group related expenses together
                </p>
                <Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
                  Create First Trip
                </Button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Trip Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">New Trip</h2>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-white/60" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Trip Name"
                      placeholder="e.g., Q4 Sales Conference"
                      value={newTrip.name}
                      onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                      icon={<MapPin className="w-5 h-5" />}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Start Date"
                        type="date"
                        value={newTrip.startDate}
                        onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                        icon={<Calendar className="w-5 h-5" />}
                      />
                      <Input
                        label="End Date"
                        type="date"
                        value={newTrip.endDate}
                        onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                        icon={<Calendar className="w-5 h-5" />}
                      />
                    </div>

                    <Input
                      label="Budget (optional)"
                      type="number"
                      placeholder="0.00"
                      value={newTrip.budget}
                      onChange={(e) => setNewTrip({ ...newTrip, budget: e.target.value })}
                      icon={<DollarSign className="w-5 h-5" />}
                    />

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Description (optional)
                      </label>
                      <textarea
                        placeholder="Add a description..."
                        value={newTrip.description}
                        onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
                        className="glass-input w-full px-4 py-3 text-white placeholder:text-white/40"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleAddTrip}
                        disabled={!newTrip.name || !newTrip.startDate || !newTrip.endDate}
                      >
                        Create Trip
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
