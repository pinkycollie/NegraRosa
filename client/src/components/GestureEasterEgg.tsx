import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Lock, Unlock, Eye, EyeOff, Fingerprint, Shield, Zap, Star } from 'lucide-react';

interface GestureSequence {
  id: string;
  name: string;
  sequence: string[];
  description: string;
  reward: {
    title: string;
    content: string;
    icon: React.ReactNode;
    color: string;
  };
}

const gestureSequences: GestureSequence[] = [
  {
    id: 'blackrose',
    name: 'Black Rose Activation',
    sequence: ['click-logo', 'click-logo', 'hold-shift', 'press-r'],
    description: 'Double click the logo, hold Shift, then press R',
    reward: {
      title: 'Black Rose Protocol Activated',
      content: 'You have discovered the hidden security layer. Advanced encryption protocols are now available.',
      icon: <Shield className="h-6 w-6" />,
      color: 'bg-gradient-to-r from-purple-600 to-pink-600'
    }
  },
  {
    id: 'fibonrose',
    name: 'FibonroseTRUST Unlock',
    sequence: ['triple-click-anywhere', 'wait-3s', 'type-trust'],
    description: 'Triple click anywhere, wait 3 seconds, then type "trust"',
    reward: {
      title: 'FibonroseTRUST Enhanced',
      content: 'Premium trust verification features unlocked. Your identity verification now includes quantum encryption.',
      icon: <Fingerprint className="h-6 w-6" />,
      color: 'bg-gradient-to-r from-blue-600 to-purple-600'
    }
  },
  {
    id: 'deafpower',
    name: 'Deaf Empowerment Mode',
    sequence: ['tap-screen-corners', 'gesture-asl-i-love-you'],
    description: 'Tap all four screen corners, then show ASL "I Love You" gesture to camera',
    reward: {
      title: 'Deaf Power Activated',
      content: 'Special accessibility features enabled. Visual communication enhancements are now active.',
      icon: <Eye className="h-6 w-6" />,
      color: 'bg-gradient-to-r from-green-600 to-blue-600'
    }
  },
  {
    id: 'quantum',
    name: 'Quantum Security',
    sequence: ['konami-code'],
    description: 'Enter the classic sequence: ↑↑↓↓←→←→BA',
    reward: {
      title: 'Quantum Security Enabled',
      content: 'Quantum-resistant encryption activated. Your data is now protected against future quantum attacks.',
      icon: <Zap className="h-6 w-6" />,
      color: 'bg-gradient-to-r from-yellow-600 to-red-600'
    }
  }
];

export function GestureEasterEgg() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const [unlockedSecrets, setUnlockedSecrets] = useState<string[]>([]);
  const [activeReward, setActiveReward] = useState<GestureSequence | null>(null);
  const [konami, setKonami] = useState<string[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [shiftHeld, setShiftHeld] = useState(false);
  const [cornerTaps, setCornerTaps] = useState<number[]>([]);
  const [typedText, setTypedText] = useState('');
  
  const clickTimeout = useRef<NodeJS.Timeout>();
  const typingTimeout = useRef<NodeJS.Timeout>();

  // Konami code sequence
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Track Shift key
      if (e.key === 'Shift') {
        setShiftHeld(true);
      }

      // Track Konami code
      setKonami(prev => {
        const newSequence = [...prev, e.code].slice(-10);
        if (newSequence.join(',') === konamiCode.join(',')) {
          checkSequenceMatch('konami-code');
          return [];
        }
        return newSequence;
      });

      // Track R key with shift for Black Rose
      if (e.key === 'r' && shiftHeld) {
        setCurrentSequence(prev => [...prev, 'press-r']);
      }

      // Track typing for "trust"
      if (e.key.length === 1) {
        setTypedText(prev => {
          const newText = (prev + e.key).slice(-5);
          if (newText === 'trust') {
            setCurrentSequence(prev => [...prev, 'type-trust']);
          }
          return newText;
        });
        
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTypedText(''), 2000);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftHeld(false);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const now = Date.now();
      const target = e.target as HTMLElement;
      
      // Check for logo clicks
      if (target.closest('[data-logo]')) {
        if (now - lastClickTime < 500) {
          setClickCount(prev => prev + 1);
          if (clickCount === 1) {
            setCurrentSequence(prev => [...prev, 'click-logo', 'click-logo']);
          }
        } else {
          setClickCount(1);
          setCurrentSequence(prev => [...prev, 'click-logo']);
        }
        setLastClickTime(now);
        
        clearTimeout(clickTimeout.current);
        clickTimeout.current = setTimeout(() => setClickCount(0), 1000);
      }

      // Check for triple clicks anywhere
      if (now - lastClickTime < 300) {
        setClickCount(prev => prev + 1);
        if (clickCount === 2) {
          setCurrentSequence(prev => [...prev, 'triple-click-anywhere']);
          setTimeout(() => {
            setCurrentSequence(prev => [...prev, 'wait-3s']);
          }, 3000);
        }
      } else {
        setClickCount(1);
      }
      setLastClickTime(now);

      // Check for corner taps
      const rect = document.documentElement.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      const margin = 50;

      if ((x < margin && y < margin) || 
          (x > rect.width - margin && y < margin) ||
          (x < margin && y > rect.height - margin) ||
          (x > rect.width - margin && y > rect.height - margin)) {
        setCornerTaps(prev => {
          const newTaps = [...prev, Date.now()];
          if (newTaps.length >= 4) {
            setCurrentSequence(prevSeq => [...prevSeq, 'tap-screen-corners']);
            return [];
          }
          return newTaps;
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('click', handleClick);
      clearTimeout(clickTimeout.current);
      clearTimeout(typingTimeout.current);
    };
  }, [clickCount, lastClickTime, shiftHeld]);

  const checkSequenceMatch = (gestureType: string) => {
    const sequence = gestureSequences.find(seq => 
      seq.sequence.includes(gestureType) || seq.id === 'quantum'
    );
    
    if (sequence && !unlockedSecrets.includes(sequence.id)) {
      setUnlockedSecrets(prev => [...prev, sequence.id]);
      setActiveReward(sequence);
      setIsVisible(true);
      
      // Dispatch custom event for hints component
      window.dispatchEvent(new CustomEvent('easterEggDiscovered', {
        detail: { easterEggId: sequence.id }
      }));
    }
  };

  useEffect(() => {
    gestureSequences.forEach(sequence => {
      const hasAllGestures = sequence.sequence.every(gesture => 
        currentSequence.includes(gesture)
      );
      
      if (hasAllGestures && !unlockedSecrets.includes(sequence.id)) {
        setUnlockedSecrets(prev => [...prev, sequence.id]);
        setActiveReward(sequence);
        setIsVisible(true);
        setCurrentSequence([]);
        
        // Dispatch custom event for hints component
        window.dispatchEvent(new CustomEvent('easterEggDiscovered', {
          detail: { easterEggId: sequence.id }
        }));
      }
    });
  }, [currentSequence, unlockedSecrets]);

  return (
    <>
      {/* Hidden gesture indicators for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs z-50">
          <div>Sequence: {currentSequence.slice(-3).join(' → ')}</div>
          <div>Unlocked: {unlockedSecrets.length}/4</div>
          <div>Shift: {shiftHeld ? 'ON' : 'OFF'}</div>
          <div>Typed: {typedText}</div>
        </div>
      )}

      <AnimatePresence>
        {isVisible && activeReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <Card className="max-w-md mx-auto border-2 border-purple-500 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-full ${activeReward.reward.color} text-white`}>
                      {activeReward.reward.icon}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsVisible(false);
                        setActiveReward(null);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{activeReward.reward.title}</h3>
                      <Badge className="mb-3">Secret Unlocked</Badge>
                      <p className="text-muted-foreground">
                        {activeReward.reward.content}
                      </p>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Secrets Found: {unlockedSecrets.length}/4
                        </span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4].map(i => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i <= unlockedSecrets.length
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {unlockedSecrets.length === 4 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg text-center"
                      >
                        <h4 className="font-bold mb-1">Master Unlocked!</h4>
                        <p className="text-sm opacity-90">
                          You've discovered all the hidden features of NegraRosa Security Framework
                        </p>
                      </motion.div>
                    )}
                    
                    <Button
                      onClick={() => {
                        setIsVisible(false);
                        setActiveReward(null);
                      }}
                      className="w-full"
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}