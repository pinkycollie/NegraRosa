import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, MousePointer, Keyboard, Hand, Star, Sparkles } from 'lucide-react';

interface Hint {
  id: string;
  title: string;
  description: string;
  gesture: string;
  icon: React.ReactNode;
  difficulty: 'easy' | 'medium' | 'hard';
}

const hints: Hint[] = [
  {
    id: 'blackrose',
    title: 'Black Rose Protocol',
    description: 'Something magical happens when you show love to our logo...',
    gesture: 'Try double-clicking the NegraRosa Security logo, then hold Shift and press R',
    icon: <MousePointer className="h-5 w-5" />,
    difficulty: 'easy'
  },
  {
    id: 'fibonrose',
    title: 'FibonroseTRUST Unlock',
    description: 'Trust is built through patience and the right words...',
    gesture: 'Triple-click anywhere, wait 3 seconds, then type "trust"',
    icon: <Keyboard className="h-5 w-5" />,
    difficulty: 'medium'
  },
  {
    id: 'deafpower',
    title: 'Deaf Empowerment',
    description: 'Touch the boundaries, then show your love in ASL...',
    gesture: 'Tap all four corners of the screen, then show the "I Love You" gesture',
    icon: <Hand className="h-5 w-5" />,
    difficulty: 'hard'
  },
  {
    id: 'quantum',
    title: 'Quantum Security',
    description: 'The classic sequence that unlocks infinite possibilities...',
    gesture: 'Enter the Konami Code: ↑↑↓↓←→←→BA',
    icon: <Keyboard className="h-5 w-5" />,
    difficulty: 'hard'
  }
];

export function EasterEggHints() {
  const [isVisible, setIsVisible] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [discoveredHints, setDiscoveredHints] = useState<string[]>([]);

  useEffect(() => {
    // Show hints after user has been on the page for a while
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10000); // Show after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Listen for custom events when easter eggs are discovered
    const handleEasterEggDiscovered = (event: CustomEvent) => {
      const { easterEggId } = event.detail;
      setDiscoveredHints(prev => {
        if (!prev.includes(easterEggId)) {
          return [...prev, easterEggId];
        }
        return prev;
      });
    };

    window.addEventListener('easterEggDiscovered', handleEasterEggDiscovered as EventListener);
    
    return () => {
      window.removeEventListener('easterEggDiscovered', handleEasterEggDiscovered as EventListener);
    };
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 50 }}
          className="fixed bottom-20 right-4 z-40 max-w-sm"
        >
          <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-sm">Hidden Features</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  ×
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3">
                Discover secret features hidden throughout NegraRosa Security
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-xs">
                  {discoveredHints.length}/4 Found
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHints(!showHints)}
                  className="text-xs h-6 px-2"
                >
                  {showHints ? 'Hide' : 'Show'} Hints
                </Button>
              </div>
              
              <div className="flex space-x-1 mb-3">
                {[1, 2, 3, 4].map(i => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i <= discoveredHints.length
                        ? 'text-yellow-500 fill-current'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              
              <AnimatePresence>
                {showHints && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {hints.map((hint) => (
                      <div
                        key={hint.id}
                        className={`border rounded-lg p-2 text-xs ${
                          discoveredHints.includes(hint.id)
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                            : 'bg-white/50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-1">
                            {hint.icon}
                            <span className="font-medium">{hint.title}</span>
                          </div>
                          <Badge className={`text-xs ${getDifficultyColor(hint.difficulty)}`}>
                            {hint.difficulty}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-1">{hint.description}</p>
                        <p className="text-purple-600 dark:text-purple-400 font-mono text-xs">
                          {hint.gesture}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {discoveredHints.length === 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-center"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-bold">Master Explorer!</span>
                  </div>
                  <p className="text-xs opacity-90 mt-1">
                    You've found all hidden features
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}