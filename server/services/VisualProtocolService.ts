/**
 * Visual Protocol Service - MBTQ Ecosystem
 * 
 * Synchronous Visual Protocol: Bypass audio dependency and create meaning
 * through spatial and visual logic. Human remains the focal point while
 * annotated diagrams float as contextual layer.
 * 
 * DeafAUTH Philosophy: Making invisible systems visible through real-time annotation
 * 
 * Architecture:
 * - Client: IDEA → BUILD → GROW → MANAGED
 * - Server: BUILD → SERVE → EVENT
 * 
 * Features:
 * - Visual-first communication
 * - Spatial annotation system
 * - Real-time visual state representation
 * - Transparency effects (making invisible visible)
 * - No audio dependencies
 */

import crypto from 'crypto';

// ==================== Types ====================

export type ClientPhase = 'IDEA' | 'BUILD' | 'GROW' | 'MANAGED';
export type ServerPhase = 'BUILD' | 'SERVE' | 'EVENT';

export interface VisualElement {
  id: string;
  type: 'annotation' | 'diagram' | 'status' | 'flow' | 'node' | 'edge';
  position: Position;
  content: VisualContent;
  style: VisualStyle;
  metadata: VisualMetadata;
}

export interface Position {
  x: number;
  y: number;
  z?: number; // For layering
  anchor?: 'top-left' | 'center' | 'bottom-right';
}

export interface VisualContent {
  text?: string;
  icon?: string;
  image?: string;
  shape?: 'circle' | 'rectangle' | 'diamond' | 'arrow' | 'line';
  animation?: 'pulse' | 'fade' | 'slide' | 'bounce' | 'none';
}

export interface VisualStyle {
  color: string;
  backgroundColor?: string;
  borderColor?: string;
  opacity: number;
  size: 'small' | 'medium' | 'large';
  contrast: 'normal' | 'high';
  hapticPattern?: number[]; // Vibration pattern for haptic feedback
}

export interface VisualMetadata {
  createdAt: Date;
  updatedAt: Date;
  author?: string;
  tags: string[];
  priority: 'low' | 'normal' | 'high' | 'critical';
  accessibility: AccessibilityInfo;
}

export interface AccessibilityInfo {
  altText: string;
  ariaLabel: string;
  keyboardShortcut?: string;
  screenReaderHint?: string;
}

export interface VisualState {
  id: string;
  clientPhase: ClientPhase;
  serverPhase: ServerPhase;
  elements: VisualElement[];
  flows: VisualFlow[];
  annotations: VisualAnnotation[];
  timestamp: Date;
}

export interface VisualFlow {
  id: string;
  source: string; // Element ID
  target: string; // Element ID
  label?: string;
  animated: boolean;
  direction: 'forward' | 'backward' | 'bidirectional';
}

export interface VisualAnnotation {
  id: string;
  targetId?: string; // Element this annotates
  position: Position;
  content: string;
  icon: string;
  floating: boolean; // Floats as contextual layer
  visibility: 'always' | 'hover' | 'focus';
}

// ==================== Client Phase Definitions ====================

const CLIENT_PHASES: Record<ClientPhase, {
  name: string;
  icon: string;
  color: string;
  description: string;
  actions: string[];
}> = {
  IDEA: {
    name: 'Idea',
    icon: '💡',
    color: '#FFD700',
    description: 'Conceptualization and planning phase',
    actions: ['brainstorm', 'research', 'sketch', 'validate'],
  },
  BUILD: {
    name: 'Build',
    icon: '🔨',
    color: '#4169E1',
    description: 'Development and implementation phase',
    actions: ['code', 'design', 'test', 'iterate'],
  },
  GROW: {
    name: 'Grow',
    icon: '🌱',
    color: '#32CD32',
    description: 'Scaling and expansion phase',
    actions: ['deploy', 'market', 'analyze', 'optimize'],
  },
  MANAGED: {
    name: 'Managed',
    icon: '🎯',
    color: '#9370DB',
    description: 'Operations and maintenance phase',
    actions: ['monitor', 'support', 'update', 'report'],
  },
};

// ==================== Server Phase Definitions ====================

const SERVER_PHASES: Record<ServerPhase, {
  name: string;
  icon: string;
  color: string;
  description: string;
  events: string[];
}> = {
  BUILD: {
    name: 'Build',
    icon: '🏗️',
    color: '#FF6347',
    description: 'Compilation and packaging',
    events: ['compile', 'bundle', 'optimize', 'validate'],
  },
  SERVE: {
    name: 'Serve',
    icon: '🚀',
    color: '#00CED1',
    description: 'Request handling and response',
    events: ['receive', 'process', 'respond', 'cache'],
  },
  EVENT: {
    name: 'Event',
    icon: '⚡',
    color: '#FF8C00',
    description: 'Real-time event processing',
    events: ['emit', 'broadcast', 'subscribe', 'acknowledge'],
  },
};

// ==================== Visual Protocol Service ====================

export class VisualProtocolService {
  private states: Map<string, VisualState> = new Map();
  private subscribers: Map<string, ((state: VisualState) => void)[]> = new Map();

  constructor() {
    // Initialize with default state
  }

  /**
   * Create a new visual state
   */
  createState(
    clientPhase: ClientPhase,
    serverPhase: ServerPhase
  ): VisualState {
    const state: VisualState = {
      id: this.generateId(),
      clientPhase,
      serverPhase,
      elements: [],
      flows: [],
      annotations: [],
      timestamp: new Date(),
    };

    this.states.set(state.id, state);
    this.notifySubscribers(state.id);
    return state;
  }

  /**
   * Add a visual element to state
   */
  addElement(
    stateId: string,
    type: VisualElement['type'],
    position: Position,
    content: Partial<VisualContent>,
    options?: {
      style?: Partial<VisualStyle>;
      metadata?: Partial<VisualMetadata>;
    }
  ): VisualElement | null {
    const state = this.states.get(stateId);
    if (!state) return null;

    const element: VisualElement = {
      id: this.generateId(),
      type,
      position,
      content: {
        animation: 'none',
        ...content,
      },
      style: {
        color: '#000000',
        opacity: 1,
        size: 'medium',
        contrast: 'high', // Default to high contrast for accessibility
        ...options?.style,
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        priority: 'normal',
        accessibility: {
          altText: content.text || 'Visual element',
          ariaLabel: content.text || 'Visual element',
        },
        ...options?.metadata,
      },
    };

    state.elements.push(element);
    state.timestamp = new Date();
    this.notifySubscribers(stateId);
    return element;
  }

  /**
   * Add floating annotation (DeafAUTH philosophy: making invisible visible)
   */
  addAnnotation(
    stateId: string,
    content: string,
    position: Position,
    options?: {
      targetId?: string;
      icon?: string;
      floating?: boolean;
      visibility?: VisualAnnotation['visibility'];
    }
  ): VisualAnnotation | null {
    const state = this.states.get(stateId);
    if (!state) return null;

    const annotation: VisualAnnotation = {
      id: this.generateId(),
      targetId: options?.targetId,
      position: {
        ...position,
        z: 100, // Float above elements
      },
      content,
      icon: options?.icon || '📌',
      floating: options?.floating ?? true,
      visibility: options?.visibility || 'always',
    };

    state.annotations.push(annotation);
    state.timestamp = new Date();
    this.notifySubscribers(stateId);
    return annotation;
  }

  /**
   * Create visual flow between elements
   */
  addFlow(
    stateId: string,
    sourceId: string,
    targetId: string,
    options?: {
      label?: string;
      animated?: boolean;
      direction?: VisualFlow['direction'];
    }
  ): VisualFlow | null {
    const state = this.states.get(stateId);
    if (!state) return null;

    const flow: VisualFlow = {
      id: this.generateId(),
      source: sourceId,
      target: targetId,
      label: options?.label,
      animated: options?.animated ?? true,
      direction: options?.direction || 'forward',
    };

    state.flows.push(flow);
    state.timestamp = new Date();
    this.notifySubscribers(stateId);
    return flow;
  }

  /**
   * Transition client phase
   */
  transitionClientPhase(stateId: string, newPhase: ClientPhase): boolean {
    const state = this.states.get(stateId);
    if (!state) return false;

    const oldPhase = state.clientPhase;
    state.clientPhase = newPhase;
    state.timestamp = new Date();

    // Add transition annotation
    this.addAnnotation(stateId, `Transitioned from ${oldPhase} to ${newPhase}`, {
      x: 0,
      y: 0,
      z: 200,
    }, {
      icon: CLIENT_PHASES[newPhase].icon,
      floating: true,
    });

    this.notifySubscribers(stateId);
    return true;
  }

  /**
   * Transition server phase
   */
  transitionServerPhase(stateId: string, newPhase: ServerPhase): boolean {
    const state = this.states.get(stateId);
    if (!state) return false;

    const oldPhase = state.serverPhase;
    state.serverPhase = newPhase;
    state.timestamp = new Date();

    // Add transition annotation
    this.addAnnotation(stateId, `Server: ${oldPhase} → ${newPhase}`, {
      x: 100,
      y: 0,
      z: 200,
    }, {
      icon: SERVER_PHASES[newPhase].icon,
      floating: true,
    });

    this.notifySubscribers(stateId);
    return true;
  }

  /**
   * Create system transparency visualization
   * (Making invisible systems visible - DeafAUTH philosophy)
   */
  createTransparencyView(
    stateId: string,
    systemName: string,
    components: Array<{
      name: string;
      status: 'active' | 'idle' | 'error' | 'hidden';
      metrics?: Record<string, number>;
    }>
  ): VisualElement[] {
    const state = this.states.get(stateId);
    if (!state) return [];

    const elements: VisualElement[] = [];
    let yOffset = 0;

    // System header
    const header = this.addElement(stateId, 'node', { x: 50, y: yOffset }, {
      text: `🔍 ${systemName}`,
      icon: '🔍',
      shape: 'rectangle',
    }, {
      style: {
        color: '#FFFFFF',
        backgroundColor: '#2D3748',
        opacity: 0.95,
        size: 'large',
        contrast: 'high',
      },
      metadata: {
        tags: ['system', 'transparency'],
        priority: 'high',
        accessibility: {
          altText: `System: ${systemName}`,
          ariaLabel: `System transparency view for ${systemName}`,
        },
      },
    });
    if (header) elements.push(header);

    yOffset += 60;

    // Component nodes
    components.forEach((component, index) => {
      const statusColors = {
        active: '#48BB78',
        idle: '#A0AEC0',
        error: '#F56565',
        hidden: '#718096',
      };

      const statusIcons = {
        active: '🟢',
        idle: '⚪',
        error: '🔴',
        hidden: '👁️',
      };

      const node = this.addElement(stateId, 'node', {
        x: 80,
        y: yOffset + (index * 50),
      }, {
        text: `${statusIcons[component.status]} ${component.name}`,
        shape: 'rectangle',
        animation: component.status === 'active' ? 'pulse' : 'none',
      }, {
        style: {
          color: '#FFFFFF',
          backgroundColor: statusColors[component.status],
          opacity: component.status === 'hidden' ? 0.5 : 0.9,
          size: 'medium',
          contrast: 'high',
          hapticPattern: component.status === 'error' ? [100, 50, 100] : undefined,
        },
        metadata: {
          tags: ['component', component.status],
          priority: component.status === 'error' ? 'critical' : 'normal',
          accessibility: {
            altText: `${component.name}: ${component.status}`,
            ariaLabel: `Component ${component.name} is ${component.status}`,
          },
        },
      });

      if (node) {
        elements.push(node);

        // Add metrics as floating annotations
        if (component.metrics) {
          Object.entries(component.metrics).forEach(([key, value], mIndex) => {
            this.addAnnotation(stateId, `${key}: ${value}`, {
              x: 250 + (mIndex * 100),
              y: yOffset + (index * 50),
            }, {
              targetId: node.id,
              icon: '📊',
              floating: true,
              visibility: 'hover',
            });
          });
        }
      }
    });

    return elements;
  }

  /**
   * Generate visual representation of client lifecycle
   */
  visualizeClientLifecycle(stateId: string): VisualElement[] {
    const elements: VisualElement[] = [];
    const phases = Object.entries(CLIENT_PHASES);

    phases.forEach(([key, phase], index) => {
      const element = this.addElement(stateId, 'node', {
        x: 100 + (index * 150),
        y: 50,
      }, {
        text: `${phase.icon} ${phase.name}`,
        shape: 'rectangle',
      }, {
        style: {
          color: '#FFFFFF',
          backgroundColor: phase.color,
          opacity: 0.9,
          size: 'large',
          contrast: 'high',
        },
        metadata: {
          tags: ['lifecycle', 'client', key],
          priority: 'normal',
          accessibility: {
            altText: `${phase.name} phase: ${phase.description}`,
            ariaLabel: `Client lifecycle phase: ${phase.name}`,
          },
        },
      });

      if (element) {
        elements.push(element);

        // Add flow to next phase
        if (index < phases.length - 1) {
          const nextPhase = phases[index + 1];
          this.addFlow(stateId, element.id, `phase_${nextPhase[0]}`, {
            label: '→',
            animated: true,
            direction: 'forward',
          });
        }
      }
    });

    return elements;
  }

  /**
   * Generate visual representation of server lifecycle
   */
  visualizeServerLifecycle(stateId: string): VisualElement[] {
    const elements: VisualElement[] = [];
    const phases = Object.entries(SERVER_PHASES);

    phases.forEach(([key, phase], index) => {
      const element = this.addElement(stateId, 'node', {
        x: 100 + (index * 150),
        y: 150,
      }, {
        text: `${phase.icon} ${phase.name}`,
        shape: 'rectangle',
      }, {
        style: {
          color: '#FFFFFF',
          backgroundColor: phase.color,
          opacity: 0.9,
          size: 'large',
          contrast: 'high',
        },
        metadata: {
          tags: ['lifecycle', 'server', key],
          priority: 'normal',
          accessibility: {
            altText: `${phase.name} phase: ${phase.description}`,
            ariaLabel: `Server lifecycle phase: ${phase.name}`,
          },
        },
      });

      if (element) elements.push(element);
    });

    return elements;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(stateId: string, callback: (state: VisualState) => void): () => void {
    if (!this.subscribers.has(stateId)) {
      this.subscribers.set(stateId, []);
    }

    this.subscribers.get(stateId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(stateId);
      if (subs) {
        const index = subs.indexOf(callback);
        if (index > -1) subs.splice(index, 1);
      }
    };
  }

  /**
   * Get state by ID
   */
  getState(stateId: string): VisualState | undefined {
    return this.states.get(stateId);
  }

  /**
   * Get phase info
   */
  getClientPhaseInfo(phase: ClientPhase): typeof CLIENT_PHASES[ClientPhase] {
    return CLIENT_PHASES[phase];
  }

  getServerPhaseInfo(phase: ServerPhase): typeof SERVER_PHASES[ServerPhase] {
    return SERVER_PHASES[phase];
  }

  // ==================== Helper Methods ====================

  private generateId(): string {
    return `vis_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  private notifySubscribers(stateId: string): void {
    const state = this.states.get(stateId);
    const subs = this.subscribers.get(stateId);

    if (state && subs) {
      subs.forEach(callback => callback(state));
    }
  }
}

// ==================== Export Singleton ====================

export const visualProtocolService = new VisualProtocolService();
