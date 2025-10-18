# SecretVote - Frontend Development Documentation

## Overview

This document provides comprehensive frontend development specifications for SecretVote, a privacy-preserving DAO governance voting application. The frontend is built with Next.js 14, TypeScript, and integrates with fhEVM for encrypted voting.

## Technology Stack

### Core Framework
- **Next.js 14**: App Router with React Server Components
- **TypeScript**: Strict mode for type safety
- **React 18**: Latest features including Suspense and Concurrent Mode

### Web3 Integration
- **Wagmi v2**: React hooks for Ethereum
- **RainbowKit**: Wallet connection UI
- **Viem**: TypeScript Ethereum library
- **fhevmjs**: Client-side FHE encryption

### Styling & UI
- **Tailwind CSS**: Utility-first styling
- **Headless UI**: Accessible components
- **Lucide React**: Icon library
- **Framer Motion**: Animations

### State Management
- **Wagmi State**: For blockchain data
- **React Context**: For app-wide state
- **Local Storage**: For user preferences

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing page (marketing/intro)
│   ├── app/
│   │   ├── page.tsx            # DApp home - proposal list
│   │   ├── proposal/
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Individual proposal page
│   │   ├── create/
│   │   │   └── page.tsx        # Create proposal page
│   │   └── admin/
│   │       └── page.tsx        # Admin dashboard
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Navigation header
│   │   ├── Footer.tsx          # Page footer
│   │   └── Sidebar.tsx         # Mobile sidebar
│   ├── proposal/
│   │   ├── ProposalCard.tsx    # Proposal preview card
│   │   ├── ProposalDetail.tsx  # Full proposal view
│   │   ├── VoteButton.tsx      # Vote action button
│   │   └── ResultsChart.tsx    # Vote results visualization
│   ├── voting/
│   │   ├── VoteModal.tsx       # Vote submission modal
│   │   ├── VoteConfirm.tsx     # Vote confirmation
│   │   └── EncryptionStatus.tsx # Encryption progress
│   ├── admin/
│   │   ├── CreateProposalForm.tsx
│   │   ├── RoleManager.tsx
│   │   └── ProposalManager.tsx
│   ├── landing/
│   │   ├── Hero.tsx            # Hero section
│   │   ├── Features.tsx        # Features showcase
│   │   ├── HowItWorks.tsx      # Process explanation
│   │   ├── Stats.tsx           # Platform statistics
│   │   └── CTA.tsx             # Call-to-action section
│   └── ui/
│       ├── Button.tsx          # Reusable button
│       ├── Card.tsx            # Card container
│       ├── Modal.tsx           # Modal dialog
│       ├── Badge.tsx           # Status badge
│       ├── LoadingSpinner.tsx  # Loading indicator
│       └── ErrorMessage.tsx    # Error display
├── hooks/
│   ├── useSecretVote.ts        # Main contract interaction
│   ├── useFhevm.ts             # FHE encryption utilities
│   ├── useProposals.ts         # Proposal data fetching
│   ├── useVoting.ts            # Vote submission logic
│   └── useRoles.ts             # User role management
├── lib/
│   ├── fhevm.ts                # FHE initialization
│   ├── contract.ts             # Contract ABIs and addresses
│   ├── constants.ts            # App constants
│   └── utils.ts                # Helper functions
├── types/
│   ├── contract.ts             # Contract type definitions
│   ├── proposal.ts             # Proposal types
│   └── vote.ts                 # Vote types
├── config/
│   ├── wagmi.ts                # Wagmi configuration
│   └── chains.ts               # Network configurations
├── styles/
│   └── globals.css             # Global styles
├── public/
│   ├── images/
│   └── icons/
└── package.json
```

## Design System

### Color Palette (❤️ Theme)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Primary - Professional Red
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',   // Main red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Neutral - Professional Gray
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Success - Green
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        // Warning - Amber
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        // Error - Red
        error: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
    },
  },
};
```

### Typography

```typescript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['Fira Code', 'monospace'],
},
fontSize: {
  'xs': '0.75rem',      // 12px
  'sm': '0.875rem',     // 14px
  'base': '1rem',       // 16px
  'lg': '1.125rem',     // 18px
  'xl': '1.25rem',      // 20px
  '2xl': '1.5rem',      // 24px
  '3xl': '1.875rem',    // 30px
  '4xl': '2.25rem',     // 36px
  '5xl': '3rem',        // 48px
}
```

### Spacing & Layout

```typescript
// Consistent spacing scale
spacing: {
  'xs': '0.5rem',   // 8px
  'sm': '1rem',     // 16px
  'md': '1.5rem',   // 24px
  'lg': '2rem',     // 32px
  'xl': '3rem',     // 48px
  '2xl': '4rem',    // 64px
}

// Container max widths
container: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

## Core Components

### 1. ProposalCard Component

**File**: `components/proposal/ProposalCard.tsx`

**Purpose**: Displays proposal summary in list view

**Props**:
```typescript
interface ProposalCardProps {
  proposal: {
    id: bigint;
    title: string;
    description: string;
    status: ProposalStatus;
    startTime: bigint;
    endTime: bigint;
    votesFor?: number;
    votesAgainst?: number;
    votesAbstain?: number;
  };
  onVote?: (proposalId: bigint) => void;
  showResults?: boolean;
}
```

**Features**:
- Proposal title and truncated description
- Status badge (Active/Ended/Finalized)
- Time remaining indicator
- Vote button (if active)
- Results preview (if finalized)
- Responsive design

**Styling**:
- Card with hover effect
- Primary color accents
- Clean typography
- Professional spacing

### 2. VoteModal Component

**File**: `components/voting/VoteModal.tsx`

**Purpose**: Modal for submitting encrypted votes

**Props**:
```typescript
interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: bigint;
  proposalTitle: string;
  onVoteSubmit: (choice: VoteChoice) => Promise<void>;
}

enum VoteChoice {
  FOR = 0,
  AGAINST = 1,
  ABSTAIN = 2
}
```

**Features**:
- Vote choice selection (For/Against/Abstain)
- Client-side encryption indicator
- Transaction confirmation
- Error handling
- Loading states

**Flow**:
1. User selects vote choice
2. Display encryption progress
3. Encrypt vote locally with fhevmjs
4. Show transaction preview
5. Submit to blockchain
6. Display confirmation

**Styling**:
- Centered modal overlay
- Large, clear vote buttons
- Professional animations
- Accessible keyboard navigation

### 3. Header Component

**File**: `components/layout/Header.tsx`

**Purpose**: Main navigation header

**Features**:
- Logo/branding
- Navigation links
- RainbowKit connect button
- User role badge
- Mobile responsive menu

**Navigation Items**:
- Proposals (Home)
- Create Proposal (if has proposer role)
- Admin Panel (if has admin role)
- Documentation

**Styling**:
- Fixed/sticky positioning
- Backdrop blur effect
- Primary color highlights
- Smooth transitions

### 4. ResultsChart Component

**File**: `components/proposal/ResultsChart.tsx`

**Purpose**: Visualizes decrypted vote results

**Props**:
```typescript
interface ResultsChartProps {
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotes: number;
}
```

**Features**:
- Horizontal bar chart
- Percentage calculations
- Color-coded segments
- Vote count labels
- Responsive sizing

**Colors**:
- For: Success green
- Against: Error red
- Abstain: Neutral gray

## Hooks Implementation

### useSecretVote Hook

**File**: `hooks/useSecretVote.ts`

**Purpose**: Main contract interaction hook

**Functions**:

```typescript
interface UseSecretVoteReturn {
  // Read functions
  getProposal: (id: bigint) => Promise<Proposal>;
  isVotingActive: (id: bigint) => Promise<boolean>;
  hasVoted: (id: bigint, address: Address) => Promise<boolean>;
  getDecryptedResults: (id: bigint) => Promise<VoteResults>;

  // Write functions
  createProposal: (title: string, description: string, duration: number) => Promise<void>;
  castVote: (proposalId: bigint, choice: VoteChoice) => Promise<void>;
  requestDecryption: (proposalId: bigint) => Promise<void>;

  // Role management
  hasRole: (role: string, address: Address) => Promise<boolean>;

  // State
  isLoading: boolean;
  error: Error | null;
}
```

**Implementation**:
```typescript
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export function useSecretVote() {
  const { data: hash, writeContract, isPending } = useWriteContract();

  const castVote = async (proposalId: bigint, choice: VoteChoice) => {
    // Encrypt vote client-side
    const { encryptedVote, proof } = await encryptVoteChoice(choice);

    // Submit to contract
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'castVote',
      args: [proposalId, encryptedVote, proof],
    });
  };

  // ... other functions

  return {
    castVote,
    isLoading: isPending,
    // ... other exports
  };
}
```

### useFhevm Hook

**File**: `hooks/useFhevm.ts`

**Purpose**: FHE encryption utilities

**Functions**:

```typescript
interface UseFhevmReturn {
  instance: FhevmInstance | null;
  isInitialized: boolean;
  encryptVote: (choice: VoteChoice) => Promise<EncryptedVote>;
  createInputProof: (value: number) => Promise<InputProof>;
}

interface EncryptedVote {
  data: Uint8Array;
  proof: string;
}
```

**Implementation**:
```typescript
import { createInstance } from 'fhevmjs';
import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';

export function useFhevm() {
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    async function init() {
      const fhevm = await createInstance({
        chainId: await publicClient.getChainId(),
        publicKey: await getPublicKey(),
      });
      setInstance(fhevm);
    }
    init();
  }, [publicClient]);

  const encryptVote = async (choice: VoteChoice): Promise<EncryptedVote> => {
    if (!instance) throw new Error('FHEVM not initialized');

    const encrypted = instance.encrypt32(choice);
    const proof = await instance.generateProof(encrypted);

    return {
      data: encrypted,
      proof: proof,
    };
  };

  return {
    instance,
    isInitialized: !!instance,
    encryptVote,
  };
}
```

### useProposals Hook

**File**: `hooks/useProposals.ts`

**Purpose**: Fetch and manage proposal data

**Functions**:

```typescript
interface UseProposalsReturn {
  proposals: Proposal[];
  activeProposals: Proposal[];
  endedProposals: Proposal[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

**Implementation**:
```typescript
import { useReadContract } from 'wagmi';
import { useMemo } from 'react';

export function useProposals() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllProposals',
  });

  const proposals = data as Proposal[] ?? [];

  const activeProposals = useMemo(() =>
    proposals.filter(p => p.status === ProposalStatus.ACTIVE),
    [proposals]
  );

  const endedProposals = useMemo(() =>
    proposals.filter(p => p.status === ProposalStatus.ENDED),
    [proposals]
  );

  return {
    proposals,
    activeProposals,
    endedProposals,
    isLoading,
    error,
    refetch,
  };
}
```

## Landing Page Components

### Hero Section

**File**: `components/landing/Hero.tsx`

**Purpose**: First impression section with main value proposition

**Features**:
- Large heading with project tagline
- Subheading explaining core benefit
- Primary CTA button "Launch App"
- Secondary CTA button "Learn More"
- Animated background or illustration
- Responsive layout

**Implementation**:
```typescript
export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-primary-900">
      <div className="container mx-auto px-4 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6"
        >
          Privacy-First DAO Governance
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-neutral-300 mb-12 max-w-3xl mx-auto"
        >
          Vote on proposals with complete confidentiality using fully homomorphic encryption.
          Your choices remain secret, while results stay transparent.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/app">
            <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 text-lg">
              Launch App →
            </Button>
          </Link>

          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Learn More
          </Button>
        </motion.div>

        {/* Visual Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <div className="relative max-w-4xl mx-auto">
            <img
              src="/images/dashboard-preview.png"
              alt="SecretVote Dashboard"
              className="rounded-lg shadow-2xl border border-white/10"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/50 to-transparent rounded-lg" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

### Features Section

**File**: `components/landing/Features.tsx`

**Purpose**: Highlight key platform features

**Features to Showcase**:
1. **Encrypted Voting** - FHE-based privacy protection
2. **Transparent Results** - Verifiable outcome aggregation
3. **Role Management** - Flexible permission system
4. **Time-Locked Voting** - Automated proposal lifecycle

**Implementation**:
```typescript
const features = [
  {
    icon: <ShieldCheck className="w-12 h-12" />,
    title: "Fully Private Voting",
    description: "Your vote choices are encrypted client-side using Zama's FHE technology. Nobody can see how you voted until final decryption.",
    gradient: "from-primary-500 to-primary-600"
  },
  {
    icon: <BarChart3 className="w-12 h-12" />,
    title: "Transparent Results",
    description: "After voting ends, results are decrypted through a secure gateway, revealing aggregate counts while protecting individual votes.",
    gradient: "from-success-500 to-success-600"
  },
  {
    icon: <Users className="w-12 h-12" />,
    title: "Role-Based Access",
    description: "Granular permission system with voter, proposer, and admin roles. Ensure only authorized members participate.",
    gradient: "from-warning-500 to-warning-600"
  },
  {
    icon: <Clock className="w-12 h-12" />,
    title: "Automated Lifecycle",
    description: "Proposals automatically transition through active, ended, and finalized states based on blockchain timestamps.",
    gradient: "from-neutral-500 to-neutral-600"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Governance Without Compromise
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            SecretVote combines the transparency of blockchain with the privacy of homomorphic encryption
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.gradient} text-white mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### How It Works Section

**File**: `components/landing/HowItWorks.tsx`

**Purpose**: Explain voting process step-by-step

**Implementation**:
```typescript
const steps = [
  {
    number: "01",
    title: "Connect Wallet",
    description: "Connect your Web3 wallet to access the governance platform",
    icon: <Wallet className="w-8 h-8" />
  },
  {
    number: "02",
    title: "Browse Proposals",
    description: "View active proposals submitted by community members",
    icon: <FileText className="w-8 h-8" />
  },
  {
    number: "03",
    title: "Cast Encrypted Vote",
    description: "Select your choice (For/Against/Abstain) and encrypt it locally",
    icon: <Lock className="w-8 h-8" />
  },
  {
    number: "04",
    title: "View Results",
    description: "After voting ends, see transparent aggregate results",
    icon: <TrendingUp className="w-8 h-8" />
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-neutral-600">
            Four simple steps to private, verifiable voting
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col md:flex-row items-start gap-6 mb-12 last:mb-0"
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl">
                  {step.number}
                </div>
              </div>

              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-primary-500">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900">
                    {step.title}
                  </h3>
                </div>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute left-8 top-20 w-0.5 h-24 bg-primary-200" />
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/app">
            <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white px-12 py-4 text-lg">
              Start Voting Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
```

### Stats Section

**File**: `components/landing/Stats.tsx`

**Purpose**: Display platform metrics

**Implementation**:
```typescript
export default function Stats() {
  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const [totalProposals, totalVotes, activeMembers] = await Promise.all([
        readContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'proposalCount' }),
        readContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'totalVotesCast' }),
        readContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'activeMemberCount' })
      ]);
      return { totalProposals, totalVotes, activeMembers };
    }
  });

  const statItems = [
    { label: "Total Proposals", value: stats?.totalProposals || 0, icon: <FileText /> },
    { label: "Votes Cast", value: stats?.totalVotes || 0, icon: <Vote /> },
    { label: "Active Members", value: stats?.activeMembers || 0, icon: <Users /> },
    { label: "Privacy Protected", value: "100%", icon: <ShieldCheck /> }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-primary-600 to-primary-700">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statItems.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-white/80">
                {stat.icon}
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="text-primary-100 text-sm md:text-base">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### CTA Section

**File**: `components/landing/CTA.tsx`

**Purpose**: Final call-to-action before footer

**Implementation**:
```typescript
export default function CTA() {
  return (
    <section className="py-24 bg-neutral-900">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Vote with Privacy?
          </h2>
          <p className="text-xl text-neutral-300 mb-12">
            Join your DAO in making governance decisions without compromising voter privacy.
            Start participating in encrypted voting today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app">
              <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white px-12 py-4 text-lg">
                Launch Application
              </Button>
            </Link>

            <Link href="https://docs.zama.ai/fhevm" target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-12 py-4 text-lg"
              >
                Read Documentation
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-neutral-400 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              <span>Fully Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span>Open Source</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Zero Knowledge</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

## Pages Implementation

### Landing Page

**File**: `app/page.tsx`

**Purpose**: Marketing homepage with product introduction

**Layout**:
```
+----------------------------------+
|            Header                |
+----------------------------------+
|          Hero Section            |
|   (Full screen with CTA)         |
+----------------------------------+
|        Features Section          |
|   (4-column grid)                |
+----------------------------------+
|      How It Works Section        |
|   (Step-by-step process)         |
+----------------------------------+
|         Stats Section            |
|   (Platform metrics)             |
+----------------------------------+
|          CTA Section             |
|   (Final call-to-action)         |
+----------------------------------+
|            Footer                |
+----------------------------------+
```

**Implementation**:
```typescript
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Stats from '@/components/landing/Stats';
import CTA from '@/components/landing/CTA';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <CTA />
    </main>
  );
}
```

**SEO Metadata**:
```typescript
export const metadata: Metadata = {
  title: 'SecretVote - Privacy-First DAO Governance',
  description: 'Vote on proposals with complete confidentiality using fully homomorphic encryption. Transparent results, private choices.',
  keywords: ['DAO', 'governance', 'privacy', 'FHE', 'voting', 'blockchain'],
  openGraph: {
    title: 'SecretVote - Privacy-First DAO Governance',
    description: 'Encrypted voting platform powered by Zama FHE technology',
    images: ['/og-image.png'],
  },
};
```

### DApp Home Page (Proposal List)

**File**: `app/app/page.tsx`

**Layout**:
```
+----------------------------------+
|            Header                |
+----------------------------------+
|                                  |
|  Active Proposals                |
|  +----------------------------+  |
|  | ProposalCard               |  |
|  +----------------------------+  |
|  | ProposalCard               |  |
|  +----------------------------+  |
|                                  |
|  Ended Proposals                 |
|  +----------------------------+  |
|  | ProposalCard               |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
|            Footer                |
+----------------------------------+
```

**Features**:
- List all proposals
- Filter by status
- Search functionality
- Pagination (20 per page)
- Sort options (newest, ending soon, most votes)

### Proposal Detail Page

**File**: `app/proposal/[id]/page.tsx`

**Layout**:
```
+----------------------------------+
|            Header                |
+----------------------------------+
|                                  |
|  Proposal Title                  |
|  Status Badge | Time Remaining   |
|                                  |
|  Full Description                |
|  ...                             |
|                                  |
|  [Vote For] [Against] [Abstain]  |
|  (if active and not voted)       |
|                                  |
|  Results Chart                   |
|  (if finalized)                  |
|                                  |
|  Proposal Details:               |
|  - Proposer: 0x...               |
|  - Created: Date                 |
|  - Voting Period: X days         |
|                                  |
+----------------------------------+
```

**Features**:
- Full proposal details
- Vote buttons (if eligible)
- Results visualization
- Proposer information
- Voting status indicator
- Share buttons

### Create Proposal Page

**File**: `app/create/page.tsx`

**Access Control**: Requires PROPOSER_ROLE

**Form Fields**:
```typescript
interface CreateProposalForm {
  title: string;           // Max 200 chars
  description: string;     // Max 2000 chars, markdown support
  votingDuration: number;  // In days (1-30)
}
```

**Validation**:
- Title: Required, 10-200 characters
- Description: Required, 50-2000 characters
- Duration: 1-30 days

**Layout**:
```
+----------------------------------+
|  Create New Proposal             |
+----------------------------------+
|                                  |
|  Title                           |
|  [________________]              |
|                                  |
|  Description (Markdown)          |
|  [                    ]          |
|  [                    ]          |
|  [                    ]          |
|                                  |
|  Voting Duration                 |
|  [____] days                     |
|                                  |
|  Preview | [Create Proposal]     |
|                                  |
+----------------------------------+
```

### Admin Dashboard

**File**: `app/admin/page.tsx`

**Access Control**: Requires ADMIN_ROLE

**Sections**:
1. **Proposal Management**
   - List all proposals
   - Cancel proposals
   - Request decryption

2. **Role Management**
   - Grant voter roles
   - Revoke voter roles
   - Grant proposer roles
   - View role holders

3. **Statistics**
   - Total proposals
   - Total votes cast
   - Active voters
   - Participation rate

## State Management

### Wagmi Configuration

**File**: `config/wagmi.ts`

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { zamaTestnet } from './chains';

export const config = getDefaultConfig({
  appName: 'SecretVote',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID!,
  chains: [zamaTestnet],
  ssr: true,
});
```

### Chain Configuration

**File**: `config/chains.ts`

```typescript
import { defineChain } from 'viem';

export const zamaTestnet = defineChain({
  id: 9000,
  name: 'Zama Devnet',
  network: 'zama-devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ZAMA',
    symbol: 'ZAMA',
  },
  rpcUrls: {
    default: {
      http: ['https://devnet.zama.ai'],
    },
    public: {
      http: ['https://devnet.zama.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Zama Explorer',
      url: 'https://explorer.devnet.zama.ai',
    },
  },
  testnet: true,
});
```

## User Flows

### Voting Flow

1. **Connect Wallet**
   - Click "Connect Wallet" in header
   - Select wallet provider
   - Approve connection

2. **Browse Proposals**
   - View list of active proposals
   - Click proposal to view details

3. **Cast Vote**
   - Click "Vote" button
   - Select choice (For/Against/Abstain)
   - Review vote in modal
   - Confirm encryption
   - Sign transaction
   - Wait for confirmation
   - See success message

4. **View Results**
   - After voting ends
   - Admin requests decryption
   - Results displayed in chart

### Proposal Creation Flow

1. **Navigate to Create Page**
   - Must have PROPOSER_ROLE
   - Click "Create Proposal" in navigation

2. **Fill Form**
   - Enter title
   - Write description (markdown)
   - Set voting duration

3. **Preview**
   - Review proposal preview
   - Edit if needed

4. **Submit**
   - Click "Create Proposal"
   - Sign transaction
   - Wait for confirmation
   - Redirect to proposal page

## Error Handling

### Error Types

```typescript
enum ErrorType {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
}
```

### Error Display

```typescript
// components/ui/ErrorMessage.tsx
interface ErrorMessageProps {
  type: ErrorType;
  message?: string;
  retry?: () => void;
}
```

**Features**:
- User-friendly error messages
- Retry button when applicable
- Detailed technical info (collapsible)
- Auto-dismiss for non-critical errors

## Loading States

### Loading Indicators

1. **Page Loading**: Full-page spinner
2. **Component Loading**: Skeleton screens
3. **Transaction Pending**: Progress indicator
4. **Data Fetching**: Shimmer effect

### Skeleton Screens

```typescript
// components/ui/ProposalSkeleton.tsx
export function ProposalSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-neutral-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-neutral-200 rounded w-full mb-2" />
      <div className="h-4 bg-neutral-200 rounded w-5/6" />
    </div>
  );
}
```

## Responsive Design

### Breakpoints

```typescript
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```

### Mobile Considerations

- Touch-friendly button sizes (min 44px)
- Simplified navigation (hamburger menu)
- Reduced animation complexity
- Optimized images
- Bottom sheet for modals

## Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
const VoteModal = dynamic(() => import('@/components/voting/VoteModal'), {
  loading: () => <LoadingSpinner />,
});

const ResultsChart = dynamic(() => import('@/components/proposal/ResultsChart'));
```

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="SecretVote"
  width={200}
  height={50}
  priority // Above fold
/>
```

### Data Caching

```typescript
// Use SWR for data fetching
import useSWR from 'swr';

const { data, error, mutate } = useSWR(
  ['proposals', address],
  () => fetchProposals(address),
  {
    refreshInterval: 30000, // Refresh every 30s
    revalidateOnFocus: true,
  }
);
```

## Accessibility (a11y)

### WCAG 2.1 AA Compliance

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: Minimum 4.5:1 for text
- **Focus Indicators**: Visible focus states
- **Alt Text**: All images have descriptive alt text

### Semantic HTML

```typescript
<main role="main">
  <section aria-labelledby="active-proposals">
    <h2 id="active-proposals">Active Proposals</h2>
    {/* Content */}
  </section>
</main>
```

## Internationalization (Future)

### Setup for i18n

```typescript
// lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      // Add more languages
    },
    lng: 'en',
    fallbackLng: 'en',
  });
```

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

```typescript
// __tests__/components/ProposalCard.test.tsx
describe('ProposalCard', () => {
  it('renders proposal title', () => {
    render(<ProposalCard proposal={mockProposal} />);
    expect(screen.getByText(mockProposal.title)).toBeInTheDocument();
  });

  it('shows vote button for active proposals', () => {
    render(<ProposalCard proposal={activeProposal} />);
    expect(screen.getByRole('button', { name: /vote/i })).toBeInTheDocument();
  });
});
```

### Integration Tests (Playwright)

```typescript
// e2e/voting.spec.ts
test('complete voting flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Connect Wallet');
  await page.click('text=MetaMask');

  await page.click('text=Vote on Proposal #1');
  await page.click('text=For');
  await page.click('text=Confirm Vote');

  await expect(page.locator('text=Vote submitted')).toBeVisible();
});
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_WALLET_CONNECT_ID=your_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=9000
NEXT_PUBLIC_GATEWAY_URL=https://gateway.devnet.zama.ai
NEXT_PUBLIC_RPC_URL=https://devnet.zama.ai
```

## Build & Deployment

### Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-specific Configs

- **Development**: Hot reload, verbose logging
- **Staging**: Production build, test data
- **Production**: Optimized build, real data

## Security Best Practices

### Input Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizedDescription = DOMPurify.sanitize(userInput);
```

### XSS Prevention

- Use React's built-in escaping
- Sanitize markdown content
- Validate all user inputs

### CSRF Protection

- Next.js built-in protection
- SameSite cookies
- CSRF tokens for mutations

## Code Style Guide

### Component Structure

```typescript
// 1. Imports
import { FC } from 'react';
import { useWallet } from 'wagmi';

// 2. Types
interface ProposalCardProps {
  proposal: Proposal;
}

// 3. Component
export const ProposalCard: FC<ProposalCardProps> = ({ proposal }) => {
  // 4. Hooks
  const { address } = useWallet();

  // 5. State
  const [isVoting, setIsVoting] = useState(false);

  // 6. Effects
  useEffect(() => {
    // ...
  }, []);

  // 7. Handlers
  const handleVote = async () => {
    // ...
  };

  // 8. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Naming Conventions

- Components: PascalCase (`ProposalCard`)
- Hooks: camelCase with `use` prefix (`useProposals`)
- Functions: camelCase (`handleVote`)
- Constants: UPPER_SNAKE_CASE (`CONTRACT_ADDRESS`)
- Types/Interfaces: PascalCase (`ProposalCardProps`)

### Comments

```typescript
/**
 * Encrypts a vote choice using FHE before submitting to the blockchain.
 *
 * @param choice - The vote choice (0=FOR, 1=AGAINST, 2=ABSTAIN)
 * @returns Promise resolving to encrypted vote data and proof
 * @throws {EncryptionError} If FHEVM instance is not initialized
 */
async function encryptVote(choice: VoteChoice): Promise<EncryptedVote> {
  // Implementation
}
```

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "wagmi": "^2.9.0",
    "@rainbow-me/rainbowkit": "^2.0.0",
    "viem": "^2.13.0",
    "fhevmjs": "^0.5.0",
    "@tanstack/react-query": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.365.0",
    "react-markdown": "^9.0.0",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.4.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0",
    "@playwright/test": "^1.43.0",
    "@testing-library/react": "^15.0.0",
    "jest": "^29.7.0"
  }
}
```

## Support & Resources

- Next.js Documentation: https://nextjs.org/docs
- Wagmi Documentation: https://wagmi.sh
- RainbowKit Documentation: https://rainbowkit.com
- fhevmjs Documentation: https://docs.zama.ai/fhevm
- Tailwind CSS: https://tailwindcss.com

## Changelog

### v1.0.0 (Initial Release)
- Basic proposal listing
- Encrypted voting
- Role management
- Results visualization
- Mobile responsive design
