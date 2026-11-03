import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { ParkingLocation, ParkingSlot } from '../../types';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Zap,
  MapPin,
  Car,
  ArrowRight,
  Minimize2,
  Maximize2,
  RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendedLocation?: ParkingLocation;
  recommendedSlots?: ParkingSlot[];
  timestamp: string;
}

interface SmartAIAssistantProps {
  onSelectLocation: (loc: ParkingLocation) => void;
  onSelectSlot: (slot: ParkingSlot, locId: string) => void;
  currentUserId?: string;
}

export const SmartAIAssistant: React.FC<SmartAIAssistantProps> = ({
  onSelectLocation,
  onSelectSlot,
  currentUserId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Hello! I am your **SMART PARK AI Assistant**. Ask me anything about garage rates, real-time bay availability, EV charging ports, or elevator proximity.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const quickPrompts = [
    'Find the cheapest parking nearby.',
    'Show parking with EV charging.',
    'Find parking with the highest availability.',
    'Where is the closest bay to the elevator?',
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendQuery = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const response = await api.askAIAssistant(q.trim(), currentUserId);
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        recommendedLocation: response.recommendedLocation,
        recommendedSlots: response.recommendedSlots,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI assistant error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'I encountered an error looking up the live database. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-[#2563EB] via-blue-600 to-indigo-700 text-white font-extrabold text-xs shadow-[0_10px_25px_-5px_rgba(37,99,235,0.45)] hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2.5 border border-white/20 group cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-cyan-200 group-hover:rotate-12 transition-transform" />
          </div>
          <span>Ask SMART PARK AI</span>
          <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-ping"></span>
        </button>
      )}

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] border border-[#E7EBF0] overflow-hidden flex flex-col h-[560px] animate-fadeIn">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#172B4D] via-[#1E3A8A] to-[#172B4D] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white">SMART PARK AI Concierge</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-cyan-400/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-400/30">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-blue-200">Natural language parking recommendations</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-4 py-2.5 bg-[#F3F6FA] border-b border-[#E7EBF0] flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(prompt)}
                className="text-[10px] font-bold bg-white text-[#172B4D] hover:text-[#2563EB] hover:bg-blue-50 border border-[#E7EBF0] px-2.5 py-1 rounded-full whitespace-nowrap transition-all shadow-2xs cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3.5 bg-[#FAF9F6]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#2563EB] text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-[#172B4D] border border-[#E7EBF0] rounded-bl-xs shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* If assistant returned a recommended location card */}
                  {msg.recommendedLocation && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-[#F3F6FA] border border-[#E7EBF0] text-[#172B4D] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#172B4D] font-extrabold line-clamp-1">
                          {msg.recommendedLocation.name}
                        </strong>
                        <span className="text-[#2563EB] font-bold shrink-0">
                          ${msg.recommendedLocation.baseHourlyRate.toFixed(2)}/hr
                        </span>
                      </div>

                      <div className="text-[11px] text-[#718096] flex items-center gap-2">
                        <span>{msg.recommendedLocation.availableSlots} bays free</span>
                        <span>•</span>
                        <span>{msg.recommendedLocation.distanceKm} km away</span>
                      </div>

                      <button
                        onClick={() => {
                          if (msg.recommendedLocation) {
                            onSelectLocation(msg.recommendedLocation);
                            setIsOpen(false);
                          }
                        }}
                        className="w-full mt-1 py-1.5 px-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>View Garage & Reserve Bay</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* If assistant recommended specific slots */}
                  {msg.recommendedSlots && msg.recommendedSlots.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-[#718096] block">
                        Recommended Available Bays:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {msg.recommendedSlots.map(slot => (
                          <button
                            key={slot.id}
                            onClick={() => {
                              onSelectSlot(slot, slot.locationId);
                              setIsOpen(false);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-colors cursor-pointer"
                          >
                            <div className="font-bold text-emerald-950 text-[11px]">
                              Bay {slot.slotNumber}
                            </div>
                            <div className="text-[9px] text-emerald-700">
                              {slot.floor} • {slot.hasEvCharger ? 'EV 150kW' : `${slot.distanceToElevatorMeters}m lift`}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className={`text-[9px] mt-1 block text-right ${msg.sender === 'user' ? 'text-blue-100' : 'text-[#718096]'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-[#172B4D] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-[#718096] text-xs">
                <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white border border-[#E7EBF0] rounded-2xl flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  <span className="text-[11px] text-[#718096] font-medium ml-1">Analyzing real-time parking data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="p-3 bg-white border-t border-[#E7EBF0] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask AI e.g. 'Cheapest parking nearby'..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-[#E7EBF0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-[#F3F6FA] text-[#172B4D] transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
