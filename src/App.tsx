/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  AlertCircle, 
  MapPin, 
  DollarSign, 
  Star,
  Activity,
  User,
  LogOut,
  ArrowRight,
  CheckCircle2,
  Clock,
  Building2,
  History as HistoryIcon,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SYMPTOMS, FACILITIES, BASE_COSTS, Symptom, Facility } from './data/medicalData';
import { cn } from '@/lib/utils';

type Step = 'welcome' | 'login' | 'symptoms' | 'severity' | 'result' | 'map' | 'feedback' | 'history';

interface HistoryItem {
  id: string;
  timestamp: number;
  symptoms: string[];
  recommendation: {
    specialist: string;
    facility: string;
    costRange: { min: number; max: number };
  };
  severity: number;
}

export default function App() {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<number>(50); // 0-100
  const [duration, setDuration] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<{ phone: string } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('medical_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('medical_history', JSON.stringify(history));
  }, [history]);

  const filteredSymptoms = useMemo(() => {
    return SYMPTOMS.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const recommendation = useMemo(() => {
    if (selectedSymptoms.length === 0) return null;

    // Logic: Find most common specialist or prioritize severe ones
    const specialists = selectedSymptoms.map(id => SYMPTOMS.find(s => s.id === id)?.specialist);
    const primarySpecialist = specialists[0] || 'General Physician';

    // Facility logic
    let facility: Facility = FACILITIES[0]; // Default Clinic
    if (severity > 70) {
      facility = FACILITIES[2]; // Tertiary
    } else if (severity > 30) {
      facility = FACILITIES[1]; // Secondary
    }

    // Cost calculation
    const base = BASE_COSTS[primarySpecialist] || { min: 300, max: 600 };
    const costMin = base.min * facility.costMultiplier;
    const costMax = base.max * facility.costMultiplier;

    return {
      specialist: primarySpecialist,
      facility,
      costRange: { min: costMin, max: costMax },
      advisory: severity > 80 ? 'Emergency care recommended. Please visit the nearest tertiary hospital immediately.' : 
                severity > 40 ? 'Specialist consultation advised within 24-48 hours.' :
                'Routine consultation recommended.'
    };
  }, [selectedSymptoms, severity]);

  const handleNext = () => {
    if (step === 'welcome') setStep('login');
    else if (step === 'login') setStep('symptoms');
    else if (step === 'symptoms') setStep('severity');
    else if (step === 'severity') setStep('result');
    else if (step === 'result') setStep('map');
    else if (step === 'map') setStep('feedback');
  };

  const handleBack = () => {
    if (step === 'login') setStep('welcome');
    else if (step === 'symptoms') setStep('login');
    else if (step === 'severity') setStep('symptoms');
    else if (step === 'result') setStep('severity');
    else if (step === 'map') setStep('result');
    else if (step === 'feedback') setStep('map');
    else if (step === 'history') setStep('symptoms');
  };

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const saveToHistory = () => {
    if (!recommendation) return;
    
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      symptoms: [...selectedSymptoms],
      recommendation: {
        specialist: recommendation.specialist,
        facility: recommendation.facility.name,
        costRange: recommendation.costRange,
      },
      severity
    };
    
    setHistory(prev => [newItem, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900 selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('welcome')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Stethoscope size={20} />
            </div>
            <span className="font-bold tracking-tight text-slate-900">SMART Referral</span>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(step === 'history' && "text-blue-600 bg-blue-50")}
                onClick={() => setStep('history')}
              >
                <HistoryIcon size={18} />
              </Button>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                {user.phone}
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => { setUser(null); setStep('welcome'); }}>
                <LogOut size={18} />
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-lg p-4 pb-40 lg:pb-24">
        <AnimatePresence mode="wait">
          {/* Welcome Screen */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-inner">
                <Activity size={48} className="animate-pulse" />
              </div>
              <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900">
                Find the Right Doctor, <br />
                <span className="text-blue-600">Instantly.</span>
              </h1>
              <p className="mb-10 text-lg text-slate-500">
                A smart referral system that maps your symptoms to the best specialists and facilities.
              </p>
              <Button size="lg" className="h-14 w-full rounded-2xl bg-blue-600 text-lg font-semibold hover:bg-blue-700" onClick={handleNext}>
                Get Started
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </motion.div>
          )}

          {/* Login Screen */}
          {step === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-none shadow-xl shadow-slate-200/50">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                  <CardDescription>Enter your mobile number to continue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">+91</span>
                      <Input id="phone" placeholder="9876543210" className="pl-12 h-12 rounded-xl" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full h-12 rounded-xl bg-blue-600" onClick={() => { setUser({ phone: '9876543210' }); handleNext(); }}>
                    Send OTP
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* Symptom Selection */}
          {step === 'symptoms' && (
            <motion.div
              key="symptoms"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">What symptoms are you experiencing?</h2>
                <p className="text-slate-500">Select all that apply to get an accurate referral.</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  placeholder="Search symptoms or categories..." 
                  className="pl-10 h-12 rounded-xl border-slate-200 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="grid gap-3">
                  {filteredSymptoms.map((symptom) => (
                    <div 
                      key={symptom.id}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all duration-200",
                        selectedSymptoms.includes(symptom.id) 
                          ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500" 
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          selectedSymptoms.includes(symptom.id) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                        )}>
                          <Activity size={20} />
                        </div>
                        <div>
                          <p className="font-semibold">{symptom.name}</p>
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">{symptom.category}</p>
                        </div>
                      </div>
                      <Checkbox checked={selectedSymptoms.includes(symptom.id)} className="rounded-full" />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-white p-4 lg:relative lg:bottom-0 lg:border-none lg:bg-transparent lg:p-0">
                <div className="mx-auto max-w-lg flex gap-3">
                   <Button variant="outline" className="h-12 w-1/3 rounded-xl" onClick={handleBack}>Back</Button>
                   <Button 
                     className="h-12 flex-1 rounded-xl bg-blue-600" 
                     disabled={selectedSymptoms.length === 0}
                     onClick={handleNext}
                   >
                     Continue ({selectedSymptoms.length})
                   </Button>
                 </div>
               </div>
            </motion.div>
          )}

          {/* Severity & Duration */}
          {step === 'severity' && (
            <motion.div
              key="severity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">How severe is it?</h2>
                <p className="text-slate-500">This helps us determine the level of facility you need.</p>
              </div>

              <Card className="border-none bg-white shadow-sm">
                <CardContent className="pt-6 space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Severity Level</Label>
                      <Badge className={cn(
                        "px-3 py-1",
                        severity < 30 ? "bg-green-100 text-green-700" :
                        severity < 70 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {severity < 30 ? 'Mild' : severity < 70 ? 'Moderate' : 'Severe'}
                      </Badge>
                    </div>
                    <Slider 
                      value={[severity]} 
                      onValueChange={(v) => setSeverity(v[0])} 
                      max={100} 
                      step={1} 
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs font-medium text-slate-400">
                      <span>MILD</span>
                      <span>MODERATE</span>
                      <span>SEVERE</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Duration (Days)</Label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {[1, 2, 3, 5, 7, 14].map((d) => (
                        <Button
                          key={d}
                          variant={duration === d ? 'default' : 'outline'}
                          className={cn(
                            "h-12 min-w-[60px] rounded-xl",
                            duration === d ? "bg-blue-600" : "border-slate-200"
                          )}
                          onClick={() => setDuration(d)}
                        >
                          {d}{d === 14 ? '+' : ''}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-white p-4 lg:relative lg:bottom-0 lg:border-none lg:bg-transparent lg:p-0">
                <div className="mx-auto max-w-lg flex gap-3">
                  <Button variant="outline" className="h-12 w-1/3 rounded-xl" onClick={handleBack}>Back</Button>
                  <Button className="h-12 flex-1 rounded-xl bg-blue-600" onClick={handleNext}>
                    Show Recommendation
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Result Screen */}
          {step === 'result' && recommendation && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
                <CheckCircle2 size={16} />
                Analysis Complete
              </div>

              <Card className="overflow-hidden border-none shadow-xl shadow-blue-900/5">
                <div className="bg-blue-600 p-6 text-white">
                  <p className="text-blue-100 text-sm font-medium mb-1">Recommended Specialist</p>
                  <h2 className="text-3xl font-bold">{recommendation.specialist}</h2>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 font-bold uppercase">Facility Level</p>
                      <div className="flex items-center gap-2">
                        <Building2 size={18} className="text-blue-600" />
                        <span className="font-semibold">{recommendation.facility.name}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 font-bold uppercase">Estimated Cost</p>
                      <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-green-600" />
                        <span className="font-semibold">₹{recommendation.costRange.min} - ₹{recommendation.costRange.max}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <div className="flex gap-3">
                      <AlertCircle className="shrink-0 text-blue-600" size={20} />
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {recommendation.advisory}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="font-bold text-lg">Why this recommendation?</h3>
                <div className="space-y-3">
                  {selectedSymptoms.map(id => {
                    const s = SYMPTOMS.find(sym => sym.id === id);
                    return (
                      <div key={id} className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        <span><strong>{s?.name}</strong> is typically handled by a {s?.specialist}.</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-white p-4 lg:relative lg:bottom-0 lg:border-none lg:bg-transparent lg:p-0">
                <div className="mx-auto max-w-lg flex gap-3">
                  <Button variant="outline" className="h-12 w-1/3 rounded-xl" onClick={handleBack}>Back</Button>
                  <Button className="h-12 flex-1 rounded-xl bg-blue-600" onClick={handleNext}>
                    Find Nearby Facilities
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Map Screen */}
          {step === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Nearby Facilities</h2>
                <p className="text-slate-500">Showing {recommendation?.facility.name}s near you.</p>
              </div>

              <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-slate-200 shadow-inner">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 flex-col gap-2">
                  <MapPin size={48} className="animate-bounce" />
                  <span className="font-medium">Map View (Simulated)</span>
                </div>
                {/* Mock Map Markers */}
                <div className="absolute top-1/4 left-1/3 h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow-lg" />
                <div className="absolute bottom-1/3 right-1/4 h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow-lg" />
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-none bg-white hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer">
                    <CardContent className="p-4 flex gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                        <Building2 className="text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold">City {recommendation?.facility.name} #{i}</h4>
                          <Badge variant="secondary" className="text-[10px]">0.{i} km</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">123 Medical Drive, Health City</p>
                        <div className="flex items-center gap-4 text-xs font-medium">
                          <span className="flex items-center gap-1 text-green-600">
                            <Clock size={12} /> Open Now
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" /> 4.{i} (200+)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-white p-4 lg:relative lg:bottom-0 lg:border-none lg:bg-transparent lg:p-0">
                <div className="mx-auto max-w-lg flex gap-3">
                  <Button variant="outline" className="h-12 w-1/3 rounded-xl" onClick={handleBack}>Back</Button>
                  <Button className="h-12 flex-1 rounded-xl bg-blue-600" onClick={handleNext}>
                    Complete Visit
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Feedback Screen */}
          {step === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 text-center py-8"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">How was your experience?</h2>
                <p className="text-slate-500">Your feedback helps us improve our recommendations.</p>
              </div>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button key={star} variant="ghost" size="icon" className="h-12 w-12 hover:bg-yellow-50">
                    <Star size={32} className="text-slate-200 hover:text-yellow-400 hover:fill-yellow-400 transition-colors" />
                  </Button>
                ))}
              </div>

              <div className="space-y-4 text-left">
                <Label>Actual cost incurred (optional)</Label>
                <Input placeholder="e.g. 1200" type="number" className="h-12 rounded-xl" />
              </div>

              <Button className="w-full h-14 rounded-2xl bg-blue-600 text-lg font-bold" onClick={() => {
                saveToHistory();
                setSelectedSymptoms([]);
                setSeverity(50);
                setStep('welcome');
              }}>
                Submit & Finish
              </Button>
            </motion.div>
          )}

          {/* History Screen */}
          {step === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Your History</h2>
                <p className="text-slate-500">Past symptom selections and recommendations.</p>
              </div>

              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <HistoryIcon size={32} />
                  </div>
                  <p className="text-slate-500">No history found yet.</p>
                  <Button variant="outline" onClick={() => setStep('symptoms')}>Start New Checkup</Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {history.map((item) => (
                      <Card key={item.id} className="border-none bg-white shadow-sm overflow-hidden">
                        <CardHeader className="p-4 bg-slate-50 border-b">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <Calendar size={14} />
                              {new Date(item.timestamp).toLocaleDateString()}
                            </div>
                            <Badge className={cn(
                              "text-[10px]",
                              item.severity < 30 ? "bg-green-100 text-green-700" :
                              item.severity < 70 ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            )}>
                              {item.severity < 30 ? 'Mild' : item.severity < 70 ? 'Moderate' : 'Severe'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase">Symptoms</p>
                            <div className="flex flex-wrap gap-1">
                              {item.symptoms.map(sId => (
                                <Badge key={sId} variant="outline" className="text-[10px] bg-white">
                                  {SYMPTOMS.find(s => s.id === sId)?.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Specialist</p>
                              <p className="font-bold text-sm text-blue-600">{item.recommendation.specialist}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Facility</p>
                              <p className="font-bold text-sm">{item.recommendation.facility}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-white p-4 lg:relative lg:bottom-0 lg:border-none lg:bg-transparent lg:p-0">
                <div className="mx-auto max-w-lg">
                  <Button className="w-full h-12 rounded-xl bg-blue-600" onClick={() => setStep('symptoms')}>
                    Start New Checkup
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar (Mobile) */}
      {user && step !== 'welcome' && step !== 'feedback' && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/80 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setStep('symptoms')}
              className={cn("flex flex-col gap-1 h-auto py-1", step === 'symptoms' && "text-blue-600")}
            >
              <Activity size={20} />
              <span className="text-[10px] font-bold uppercase">Symptoms</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setStep('history')}
              className={cn("flex flex-col gap-1 h-auto py-1", step === 'history' && "text-blue-600")}
            >
              <HistoryIcon size={20} />
              <span className="text-[10px] font-bold uppercase">History</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setStep('map')}
              className={cn("flex flex-col gap-1 h-auto py-1", step === 'map' && "text-blue-600")}
            >
              <MapPin size={20} />
              <span className="text-[10px] font-bold uppercase">Nearby</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col gap-1 h-auto py-1">
              <User size={20} />
              <span className="text-[10px] font-bold uppercase">Profile</span>
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
