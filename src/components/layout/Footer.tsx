import React from 'react';
import { Car, Shield, Radio, Sparkles, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#172B4D] text-slate-400 text-xs py-10 mt-16 border-t border-[#1E3A8A]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-black shadow-xs">
              SP
            </div>
            <div>
              <span className="font-black text-white text-sm tracking-tight">SMART PARK</span>
              <p className="text-[11px] text-blue-200">
                AI Powered Smart Parking Reservation & Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-pulse"></span>
              IoT Sensor Network: 100% Operational (Simulated)
            </span>
            <span className="text-blue-300">•</span>
            <span className="flex items-center gap-1.5 text-blue-300 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Dynamic ML Demand Pricing Active
            </span>
            <span className="text-blue-300">•</span>
            <span className="text-slate-200 font-bold">
              Enterprise Mobility Edition
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} SMART PARK Inc. All rights reserved. Built with React, TypeScript & Google AI Studio.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-white transition-colors cursor-pointer">Security Safeguards</span>
            <span className="hover:text-white transition-colors cursor-pointer">Dynamic Fare Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">IoT Protocol Specs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
