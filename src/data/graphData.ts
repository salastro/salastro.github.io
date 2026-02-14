import type { GraphData, NodeObject, LinkObject } from 'react-force-graph-2d';
import orbMechImg from '../assets/0d0ca8890c6bd363db274f38ffd53af82194d98e.png';
import rootImg from '../assets/072d2fe6dcba0b4485129f2618be5d85ed8f7655.png';

export interface MyNode extends NodeObject {
  id: string;
  group: 'root' | 'focus' | 'project' | 'concept' | 'idea';
  title?: string; // Display name
  description?: string;
  tags?: string[];
  level: number;
  val?: number; // Size
  img?: string; // Image URL
  date?: string; // Date added/updated (ISO format)
}

export interface MyLink extends LinkObject {
  source: string | MyNode;
  target: string | MyNode;
}

export const graphData: { nodes: MyNode[]; links: MyLink[] } = {
  nodes: [
    // Root
    { id: 'root', title: 'SalahDin Rezk', group: 'root', level: 0, val: 20, img: rootImg, date: '2024-01-01' },

    // Focus Areas (Level 1)
    { id: 'signal-processing', title: 'Signal Processing', group: 'focus', level: 1, val: 10, img: 'https://images.unsplash.com/photo-1760978632061-ad00f48789ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwc2lnbmFsJTIwd2F2ZSUyMGRhcmt8ZW58MXx8fHwxNzcwODIyOTY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', date: '2024-03-15' },
    { id: 'cryptography', title: 'Cryptography', group: 'focus', level: 1, val: 10, img: 'https://images.unsplash.com/photo-1770159116807-9b2a7bb82294?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG9ncmFwaHklMjBkYXRhJTIwc2VjdXJpdHklMjBjb2RlJTIwZGFya3xlbnwxfHx8fDE3NzA4MjI5NjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', date: '2024-02-20' },
    { id: 'quantum-systems', title: 'Quantum Systems', group: 'focus', level: 1, val: 10, img: 'https://images.unsplash.com/photo-1639353014154-8b9da8815d84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWFudHVtJTIwcGh5c2ljcyUyMGFic3RyYWN0JTIwZGFya3xlbnwxfHx8fDE3NzA4MjI5NjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', date: '2024-04-10' },
    { id: 'orbital-mechanics', title: 'Orbital Mechanics', group: 'focus', level: 1, val: 10, img: orbMechImg, date: '2024-05-22' },
    { id: 'systems-modeling', title: 'Systems Modeling', group: 'focus', level: 1, val: 10, date: '2024-06-18' },
    { id: 'projects', title: 'Engineering Projects', group: 'focus', level: 1, val: 12, date: '2024-01-15' },
    { id: 'ideas', title: 'Ideas', group: 'focus', level: 1, val: 8, date: '2024-07-01' },

    // Level 2 - Signal Processing
    { id: 'dsp', title: 'Digital Signal Processing', group: 'concept', level: 2, val: 5, date: '2024-03-20' },
    { id: 'stochastic', title: 'Stochastic Processes', group: 'concept', level: 2, val: 5, date: '2024-03-25' },
    { id: 'wavelets', title: 'Wavelet Transform', group: 'concept', level: 2, val: 5, date: '2024-04-01' },

    // Level 2 - Cryptography
    { id: 'zkp', title: 'Zero-Knowledge Proofs', group: 'concept', level: 2, val: 5, date: '2024-02-25' },
    { id: 'pq-crypto', title: 'Post-Quantum Crypto', group: 'concept', level: 2, val: 5, date: '2024-05-05' },
    { id: 'ecc', title: 'Elliptic Curve', group: 'concept', level: 2, val: 5, date: '2024-02-28' },

    // Level 2 - Quantum Systems
    { id: 'entanglement', title: 'Entanglement Entropy', group: 'concept', level: 2, val: 5, date: '2024-04-15' },
    { id: 'q-error', title: 'Quantum Error Correction', group: 'concept', level: 2, val: 5, date: '2024-04-20' },
    { id: 'hamiltonian', title: 'Hamiltonian Simulation', group: 'concept', level: 2, val: 5, date: '2024-04-25' },

    // Level 2 - Orbital Mechanics
    { id: 'trajectory', title: 'Trajectory Optimization', group: 'concept', level: 2, val: 5, date: '2024-05-28' },
    { id: 'propulsion', title: 'Ionic Propulsion', group: 'concept', level: 2, val: 5, date: '2024-06-05' },

    // Level 2 - Systems Modeling
    { id: 'agent-based', title: 'Agent-Based Modeling', group: 'concept', level: 2, val: 5, date: '2024-06-22' },
    { id: 'cybernetics', title: 'Cybernetics', group: 'concept', level: 2, val: 5, date: '2024-06-25' },
    { id: 'control-theory', title: 'Control Theory', group: 'concept', level: 2, val: 5, date: '2024-06-28' },

    // Projects
    { id: 'proj-satellite', title: 'CubeSat Comms', group: 'project', level: 2, val: 7, date: '2024-08-10' },
    { id: 'proj-qkey', title: 'QKD Protocol Impl', group: 'project', level: 2, val: 7, date: '2024-09-15' },
    { id: 'proj-dsp-fpga', title: 'FPGA Audio Filter', group: 'project', level: 2, val: 7, date: '2024-10-01' },

    // Ideas
    { id: 'idea-neuromorphic', title: 'Neuromorphic Circuits', group: 'idea', level: 2, val: 4, date: '2024-07-10' },
    { id: 'idea-bci', title: 'Non-invasive BCI', group: 'idea', level: 2, val: 4, date: '2024-07-20' },
  ],
  links: [
    { source: 'root', target: 'signal-processing' },
    { source: 'root', target: 'cryptography' },
    { source: 'root', target: 'quantum-systems' },
    { source: 'root', target: 'orbital-mechanics' },
    { source: 'root', target: 'systems-modeling' },
    { source: 'root', target: 'projects' },
    { source: 'root', target: 'ideas' },

    { source: 'signal-processing', target: 'dsp' },
    { source: 'signal-processing', target: 'stochastic' },
    { source: 'signal-processing', target: 'wavelets' },

    { source: 'cryptography', target: 'zkp' },
    { source: 'cryptography', target: 'pq-crypto' },
    { source: 'cryptography', target: 'ecc' },

    { source: 'quantum-systems', target: 'entanglement' },
    { source: 'quantum-systems', target: 'q-error' },
    { source: 'quantum-systems', target: 'hamiltonian' },
    { source: 'quantum-systems', target: 'pq-crypto' }, // Cross-link

    { source: 'orbital-mechanics', target: 'trajectory' },
    { source: 'orbital-mechanics', target: 'propulsion' },

    { source: 'systems-modeling', target: 'agent-based' },
    { source: 'systems-modeling', target: 'cybernetics' },
    { source: 'systems-modeling', target: 'control-theory' },

    { source: 'projects', target: 'proj-satellite' },
    { source: 'projects', target: 'proj-qkey' },
    { source: 'projects', target: 'proj-dsp-fpga' },

    { source: 'proj-satellite', target: 'orbital-mechanics' }, // Cross-link
    { source: 'proj-qkey', target: 'cryptography' }, // Cross-link
    { source: 'proj-qkey', target: 'quantum-systems' }, // Cross-link
    { source: 'proj-dsp-fpga', target: 'signal-processing' }, // Cross-link

    { source: 'ideas', target: 'idea-neuromorphic' },
    { source: 'ideas', target: 'idea-bci' },
  ]
};

export const nodeContent: Record<string, any> = {
  'root': {
    title: 'SalahDin Rezk',
    abstract: 'Researcher focused on the intersection of information theory, physical systems, and computational modeling. My work explores how fundamental physical limits constrain and enable new forms of communication and computation.',
    equations: [
      'I(X;Y) = H(Y) - H(Y|X)',
      '\\frac{d}{dt} \\mathbf{x}(t) = \\mathbf{f}(\\mathbf{x}(t), \\mathbf{u}(t))'
    ],
    tags: ['Researcher', 'Engineer', 'Physicist'],
    projects: ['proj-satellite', 'proj-qkey'],
    concepts: ['signal-processing', 'systems-modeling']
  },
  'signal-processing': {
    title: 'Signal Processing',
    abstract: 'The analysis, synthesis, and modification of signals. My focus is on stochastic signal processing in high-noise environments and optimal estimation theory.',
    equations: [
      'y[n] = \\sum_{k=-\\infty}^{\\infty} x[k]h[n-k]',
      'S_{xx}(\\omega) = \\int_{-\\infty}^{\\infty} R_{xx}(\\tau)e^{-j\\omega\\tau} d\\tau'
    ],
    tags: ['DSP', 'Stochastic', 'Estimation'],
    projects: ['proj-dsp-fpga'],
    concepts: ['dsp', 'wavelets']
  },
  'cryptography': {
    title: 'Cryptography',
    abstract: 'Secure communication in the presence of adversarial behavior. Specifically interested in post-quantum cryptographic primitives and zero-knowledge proofs for privacy-preserving systems.',
    equations: [
      'P(A(g^a, g^b) = g^{ab}) \\approx \\frac{1}{|G|}',
      '\\text{Enc}_{pk}(m) \\rightarrow c'
    ],
    tags: ['Security', 'Privacy', 'Math'],
    projects: ['proj-qkey'],
    concepts: ['zkp', 'ecc']
  },
  'quantum-systems': {
    title: 'Quantum Systems',
    abstract: 'Study of quantum mechanical systems for information processing. Topics include quantum error correction codes and simulation of Hamiltonian dynamics.',
    equations: [
      'i\\hbar \\frac{\\partial}{\\partial t} \\Psi = \\hat{H} \\Psi',
      '\\rho = \\sum_i p_i |\\psi_i\\rangle \\langle\\psi_i|'
    ],
    tags: ['Physics', 'Quantum', 'Information'],
    projects: ['proj-qkey'],
    concepts: ['entanglement', 'q-error']
  },
  'orbital-mechanics': {
    title: 'Orbital Mechanics',
    abstract: 'Analysis of spacecraft trajectories and orbital dynamics. Focus on low-thrust trajectory optimization for deep space missions and station-keeping strategies.',
    equations: [
      "\\mathbf{r}'' + \\frac{\\mu}{r^3}\\mathbf{r} = \\mathbf{a}_p",
      '\\Delta v = v_e \\ln\\frac{m_0}{m_f}'
    ],
    tags: ['Space', 'Dynamics', 'Control'],
    projects: ['proj-satellite'],
    concepts: ['trajectory', 'propulsion']
  },
  // Default fallback for others
  'default': {
    title: 'Node Details',
    abstract: 'Detailed technical breakdown of this concept is currently being archived from physical lab notes. Please refer to the related project section for implementation details.',
    equations: ['E = mc^2'],
    tags: ['Pending', 'Archive'],
    projects: [],
    concepts: []
  }
};
