import React, { useState, useEffect } from 'react';
import { Reservation, ParkingSlot } from '../../types';
import {
  Compass,
  Navigation,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  Radio,
  Volume2,
  VolumeX,
  X,
  Gauge,
  ShieldAlert,
  Zap,
  CheckCircle,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

interface FuturisticNavViewProps {
  reservation: Reservation;
  onExit: () => void;
  onArrived: () => void;
}

export const FuturisticNavView: React.FC<FuturisticNavViewProps> = ({
  reservation,
  onExit,
  onArrived,
}) => {
  const [distanceRemaining, setDistanceRemaining] = useState<number>(48);
  const [currentSpeed, setCurrentSpeed] = useState<number>(9);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [navStepIndex, setNavStepIndex] = useState<number>(0);
  const [isSimulatingApproach, setIsSimulatingApproach] = useState<boolean>(true);
  const [simulatedClearance, setSimulatedClearance] = useState<number>(2.4);

  // Turn-by-turn navigation instructions
  const navSteps = [
    { instruction: 'Enter through Gate 1 & Proceed Straight 20m', icon: 'straight', lane: 'Main Access Way' },
    { instruction: 'Turn RIGHT into Corridor A at Pillar P-02', icon: 'right', lane: 'Corridor A' },
    { instruction: `Bay ${reservation.slotNumber} is 12m ahead on your LEFT`, icon: 'left', lane: `Zone ${reservation.zone}` },
    { instruction: `Align vehicle & Reverse into Bay ${reservation.slotNumber}`, icon: 'park', lane: `Bay ${reservation.slotNumber}` },
  ];

  // Dynamic simulation of vehicle moving into bay
  useEffect(() => {
    if (!isSimulatingApproach) return;

    const interval = setInterval(() => {
      setDistanceRemaining(prev => {
        if (prev <= 2) {
          setIsSimulatingApproach(false);
          return 0;
        }
        const next = Math.max(0, prev - 3);
        if (next < 35 && navStepIndex === 0) setNavStepIndex(1);
        if (next < 20 && navStepIndex === 1) setNavStepIndex(2);
        if (next < 5 && navStepIndex === 2) setNavStepIndex(3);
        return next;
      });

      setCurrentSpeed(prev => {
        if (distanceRemaining <= 4) return 0;
        if (distanceRemaining <= 15) return 4;
        return 8 + Math.floor(Math.random() * 3);
      });
    }, 1400);

    return () => clearInterval(interval);
  }, [isSimulatingApproach, distanceRemaining, navStepIndex]);

  const currentStep = navSteps[navStepIndex] || navSteps[navSteps.length - 1];

  return (
    <div className="fixed inset-0 z-50 bg-[#060913] text-white flex flex-col font-sans select-none overflow-hidden animate-fadeIn">
      {/* Background HUD Grid lines & futuristic ambiance */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d1527_1px,transparent_1px),linear-gradient(to_bottom,#0d1527_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#CCFF00]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Cockpit HUD Bar */}
      <div className="relative z-20 px-6 py-4 border-b border-[#1E293B]/80 bg-[#090E1A]/90 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Compass / Heading indicator */}
          <div className="flex items-center gap-2 bg-[#0D1527] border border-[#CCFF00]/40 px-3.5 py-1.5 rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.15)]">
            <Compass className="w-5 h-5 text-[#CCFF00] animate-spin" style={{ animationDuration: '20s' }} />
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">HEADING</div>
              <div className="text-xs font-mono font-bold text-[#CCFF00]">338° NW • LEVEL {reservation.floor.toUpperCase()}</div>
            </div>
          </div>

          <div className="hidden sm:block">
            <div className="text-[10px] font-mono uppercase text-slate-400">VEHICLE TELEMETRY</div>
            <div className="text-xs font-mono font-semibold text-white">
              {reservation.vehicle.model} • [{reservation.vehicle.licensePlate}]
            </div>
          </div>
        </div>

        {/* Center Target Bay Pill */}
        <div className="bg-[#0D1527] border border-cyan-400/50 px-5 py-2 rounded-2xl flex items-center gap-3 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
          <div className="w-3 h-3 rounded-full bg-[#CCFF00] animate-ping" />
          <div>
            <div className="text-[9px] font-mono text-cyan-300 uppercase tracking-widest">TARGET BAY</div>
            <div className="text-lg font-mono font-black text-white tracking-wider">
              BAY {reservation.slotNumber}
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            {reservation.zone}
          </span>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2.5 rounded-xl border transition-all ${
              audioEnabled
                ? 'bg-[#CCFF00]/10 border-[#CCFF00]/50 text-[#CCFF00]'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Voice HUD"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Close HUD</span>
          </button>
        </div>
      </div>

      {/* Main Driving Stage Area */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row p-6 gap-6 items-stretch justify-between overflow-hidden">
        {/* Left Column: Turn by turn instructions & Telemetry */}
        <div className="w-full md:w-80 flex flex-col justify-between space-y-4">
          {/* Primary Action Card with Neon Lime Accents */}
          <div className="bg-[#0A101F]/90 border-2 border-[#CCFF00]/60 rounded-3xl p-5 shadow-[0_0_30px_rgba(204,255,0,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#CCFF00]/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#CCFF00]">
                NEXT MANEUVER
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                STEP {navStepIndex + 1} OF {navSteps.length}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#CCFF00] text-[#060913] flex items-center justify-center shrink-0 shadow-lg">
                {currentStep.icon === 'right' ? (
                  <ArrowRight className="w-8 h-8 stroke-[3]" />
                ) : currentStep.icon === 'left' ? (
                  <ArrowLeft className="w-8 h-8 stroke-[3]" />
                ) : currentStep.icon === 'park' ? (
                  <CheckCircle className="w-8 h-8 stroke-[3]" />
                ) : (
                  <ArrowUp className="w-8 h-8 stroke-[3]" />
                )}
              </div>

              <div>
                <h4 className="text-lg font-black leading-snug text-white">
                  {currentStep.instruction}
                </h4>
                <div className="text-xs font-mono text-slate-400 mt-1">
                  Lane: {currentStep.lane}
                </div>
              </div>
            </div>

            {/* Distance to next turn */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-baseline justify-between">
              <span className="text-xs font-mono text-slate-400">DISTANCE TO BAY:</span>
              <span className="text-3xl font-mono font-black text-[#CCFF00] tracking-tight">
                {distanceRemaining}m
              </span>
            </div>
          </div>

          {/* Speed & Clearance Gauge */}
          <div className="bg-[#0A101F]/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" />
                SPEEDOMETER
              </span>
              <span className="text-cyan-400 font-bold">{currentSpeed} KM/H (LIMIT 10)</span>
            </div>

            {/* Simulated Speed Progress */}
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-[#CCFF00] transition-all duration-300"
                style={{ width: `${(currentSpeed / 10) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span>OVERHEAD CLEARANCE:</span>
              <span className="text-white font-bold">{simulatedClearance}m [SAFE]</span>
            </div>
          </div>

          {/* IoT Smart Bay Telemetry Card */}
          <div className="bg-[#0A101F]/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                BAY SENSOR TELEMETRY
              </span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                SIMULATED
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Overhead Laser Pilot:</span>
                <span className="text-[#CCFF00] font-bold">PULSING GREEN</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Bay Ultrasonic Dist:</span>
                <span className="text-white font-bold">{distanceRemaining < 5 ? '0.45m' : '3.80m'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>C-V2X Radio Latency:</span>
                <span className="text-cyan-400 font-bold">12ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right: 3D Isometric / Futuristic Lane Visualizer */}
        <div className="flex-1 bg-[#090E1A]/90 border border-slate-800 rounded-3xl p-6 relative flex flex-col justify-between shadow-2xl overflow-hidden min-h-[400px]">
          {/* Subtle Top-right Floor Ramp Indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#060913]/90 border border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-mono">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">RAMP STATUS:</span>
            <span className="text-emerald-400 font-bold">LEVEL B1 REACHED</span>
          </div>

          {/* 3D Driveway Perspective Visual */}
          <div className="relative flex-1 flex items-center justify-center my-4">
            {/* Floor perspective corridor grid */}
            <div className="relative w-full max-w-lg h-72 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 via-slate-900/60 to-[#060913] flex items-center justify-center overflow-hidden [perspective:800px]">
              {/* Floor grid plane with 3D tilt */}
              <div className="absolute inset-0 [transform:rotateX(55deg)] flex flex-col items-center justify-center pointer-events-none">
                {/* Glowing Driveway Center Line */}
                <div className="w-1.5 h-full bg-gradient-to-t from-[#CCFF00] via-cyan-400 to-transparent shadow-[0_0_15px_#CCFF00]" />

                {/* Road Lane Bounds */}
                <div className="absolute inset-x-12 inset-y-0 border-x-2 border-dashed border-cyan-400/40" />

                {/* Pillars on sides */}
                <div className="absolute left-6 top-1/4 w-4 h-16 bg-slate-800 border border-cyan-500/40 rounded" />
                <div className="absolute right-6 top-1/4 w-4 h-16 bg-slate-800 border border-cyan-500/40 rounded" />
                <div className="absolute left-6 top-3/4 w-4 h-16 bg-slate-800 border border-cyan-500/40 rounded" />
                <div className="absolute right-6 top-3/4 w-4 h-16 bg-slate-800 border border-cyan-500/40 rounded" />
              </div>

              {/* Destination Parking Slot Box in 3D Space */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative px-6 py-4 rounded-2xl bg-[#060913]/90 border-2 border-[#CCFF00] shadow-[0_0_35px_rgba(204,255,0,0.3)] text-center animate-bounce">
                  <div className="text-[10px] font-mono font-bold text-[#CCFF00] uppercase tracking-widest">
                    ALLOCATED SPACE
                  </div>
                  <div className="text-3xl font-mono font-black text-white">
                    BAY {reservation.slotNumber}
                  </div>
                  <div className="text-xs font-mono text-cyan-300 mt-0.5">
                    {reservation.floor} • {reservation.zone}
                  </div>
                </div>

                {/* Overhead Laser Beam down to slot */}
                <div className="w-1 h-12 bg-gradient-to-b from-[#CCFF00] to-transparent shadow-[0_0_20px_#CCFF00]" />

                {/* Arrival Status Banner */}
                {distanceRemaining <= 0 && (
                  <div className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs font-mono uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 fill-slate-950 text-emerald-500" />
                    <span>VEHICLE POSITIONED PERFECTLY IN BAY</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Cockpit Action Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-pulse"></span>
              <span>SMARTPARK IN-CAR GUIDANCE V4.2 • ACTIVE HUD</span>
            </div>

            <div className="flex items-center gap-3">
              {distanceRemaining <= 0 ? (
                <button
                  onClick={onArrived}
                  className="px-6 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-slate-950 font-black text-xs font-mono tracking-wider uppercase shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all cursor-pointer"
                >
                  Confirm Parked & Lock Session
                </button>
              ) : (
                <button
                  onClick={() => setDistanceRemaining(0)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
                >
                  Simulate Immediate Arrival
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
