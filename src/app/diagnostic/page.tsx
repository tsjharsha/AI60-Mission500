'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { generateProjectDNA } from '@/lib/project-dna/generateProjectDNA';
import { Check, ChevronRight, ArrowLeft } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { Button } from '@/components/ui/Button';

const BRANCHES = ['Computer Science', 'AI / ML', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Biotechnology', 'Cybersecurity', 'Other'];
const ROLES = ['Software Engineer', 'Backend Engineer', 'Frontend Engineer', 'Data Analyst', 'Data Scientist', 'AI / ML Engineer', 'Product / Tech', 'Cybersecurity', 'Core Engineering', 'Other'];
const SKILLS = ['Python', 'Java', 'C++', 'JavaScript', 'React', 'SQL', 'Machine Learning', 'Data Structures', 'Cloud', 'Git', 'APIs'];

const AI_OPTIONS = [
  { label: "I mostly use ChatGPT", value: "Beginner" },
  { label: "I've experimented with prompts", value: "Intermediate" },
  { label: "I've used an AI API / Built a small project", value: "Advanced" }
];

const INTERVIEW_OPTIONS = [
  "I have something strong to show", 
  "I've experimented, but nothing impressive", 
  "I wouldn't have anything to show"
];

const STAGES = ['PROFILE', 'CAREER', 'SKILLS', 'AI', 'INTERVIEW', 'DNA'];

export default function DiagnosticPage() {
  const router = useRouter();
  const { setProfile, setProjectResult, profile, referralContext } = useAppStore();
  
  const [step, setStep] = useState(1);
  const [localData, setLocalData] = useState({
    name: profile.name || '',
    college: profile.college || '',
    branch: profile.branch || '',
    graduationYear: profile.graduationYear || '2026',
    targetRole: profile.targetRole || '',
    skills: profile.skills || [],
    aiExperience: profile.aiExperience || '',
    placementConfidence: profile.placementConfidence || ''
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisState, setAnalysisState] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    trackEvent('diagnostic_started', { source: referralContext.source });
  }, [referralContext.source]);

  const validateStep = () => {
    setError('');
    if (step === 1 && (!localData.name || !localData.college)) return 'Please complete all fields to continue.';
    if (step === 2 && !localData.branch) return 'Choose a foundation branch to continue.';
    if (step === 3 && !localData.targetRole) return 'Select a target role to continue.';
    if (step === 4 && localData.skills.length === 0) return 'Select at least one skill to continue.';
    if (step === 5 && !localData.aiExperience) return 'Select your AI experience level.';
    if (step === 6 && !localData.placementConfidence) return 'Please answer the interview question.';
    return '';
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    
    trackEvent('diagnostic_step_completed', { step, ...localData });
    if (step < 6) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    trackEvent('diagnostic_completed', { ...localData });
    setProfile(localData);
    setIsAnalyzing(true);
    
    // Start AI generation in background
    const generationPromise = generateProjectDNA(localData);
    
    // Cinematic analysis sequence
    const sequences = [
      { delay: 800, state: 1 }, // PROFILE SIGNALS DETECTED
      { delay: 1200, state: 2 }, // TARGET ROLE
      { delay: 1000, state: 3 }, // AI SIGNAL
      { delay: 1000, state: 4 }, // PLACEMENT PROOF
      { delay: 1200, state: 5 }, // MATCHING PROJECT...
      { delay: 800, state: 6 }, // PROJECT DNA FOUND
    ];

    for (const seq of sequences) {
      await new Promise(r => setTimeout(r, seq.delay));
      setAnalysisState(seq.state);
    }
    
    try {
      const result = await generationPromise;
      trackEvent('project_generated', { projectName: result.project.name, archetype: result.archetype });
      setProjectResult(result);
      
      // Brief pause on "PROJECT DNA FOUND"
      await new Promise(r => setTimeout(r, 600));
      router.push('/result');
    } catch (e) {
      console.error(e);
      // Fallback has already been applied if generation failed
      router.push('/result');
    }
  };

  const toggleSkill = (skill: string) => {
    setError('');
    setLocalData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-background items-center justify-center p-6 relative overflow-hidden">
        {/* Background depth */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ai/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
        
        <div className="w-full max-w-lg z-10 space-y-6 font-mono relative">
          {/* Scan line effect */}
          <motion.div 
            className="absolute -inset-x-20 h-[1px] bg-accent/50 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
            initial={{ top: "-20%" }}
            animate={{ top: "120%" }}
            transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
          />
          
          <AnimatePresence mode="popLayout">
            {analysisState >= 1 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm">
                <span className="text-muted block mb-1">PROFILE SIGNALS DETECTED</span>
                <div className="flex flex-wrap gap-2 text-accent">
                  {localData.skills.slice(0, 4).map(s => <span key={s}>[{s}]</span>)}
                </div>
              </motion.div>
            )}
            
            {analysisState >= 2 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm">
                <span className="text-muted block mb-1">TARGET ROLE</span>
                <span className="text-white">{localData.targetRole}</span>
              </motion.div>
            )}
            
            {analysisState >= 3 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm">
                <span className="text-muted block mb-1">AI SIGNAL</span>
                <span className="text-white">{localData.aiExperience} Level</span>
              </motion.div>
            )}
            
            {analysisState >= 4 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm">
                <span className="text-muted block mb-1">PLACEMENT PROOF</span>
                <span className="text-warning">Missing applied AI artifact</span>
              </motion.div>
            )}
            
            {analysisState >= 5 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-accent animate-pulse" />
                  <span className="text-accent tracking-widest uppercase">MATCHING PROJECT...</span>
                </div>
              </motion.div>
            )}
            
            {analysisState >= 6 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="mt-8 p-4 border border-accent/30 bg-accent/10 rounded-lg text-center"
              >
                <span className="text-lg text-white font-bold tracking-wider">PROJECT DNA FOUND</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background p-6 relative">
      <div className="max-w-2xl mx-auto w-full pt-16 flex-1 flex flex-col relative z-10">
        
        {/* Cinematic Header timeline */}
        <div className="mb-16 flex justify-between items-center px-2">
          {STAGES.map((s, idx) => {
            const isActive = step === idx + 1;
            const isPassed = step > idx + 1;
            return (
              <div key={s} className="flex flex-col items-center gap-2">
                <div className={`font-mono text-[10px] tracking-widest uppercase ${isActive ? 'text-accent' : isPassed ? 'text-white' : 'text-muted/50'}`}>
                  {s}
                  <span className="block text-center opacity-50 mt-1">0{idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col justify-center min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <h2 className="text-4xl font-bold tracking-tight">First, who are we mapping?</h2>
                <div className="space-y-6">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    className="w-full bg-transparent border-b-2 border-border p-4 text-2xl outline-none focus:border-white transition-colors text-white placeholder:text-muted/40"
                    value={localData.name}
                    onChange={e => { setError(''); setLocalData({...localData, name: e.target.value}) }}
                  />
                  <input 
                    type="text" 
                    placeholder="Your College" 
                    className="w-full bg-transparent border-b-2 border-border p-4 text-2xl outline-none focus:border-white transition-colors text-white placeholder:text-muted/40"
                    value={localData.college}
                    onChange={e => { setError(''); setLocalData({...localData, college: e.target.value}) }}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <h2 className="text-4xl font-bold tracking-tight">Where did you build your foundation?</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {BRANCHES.map(branch => (
                    <button
                      key={branch}
                      onClick={() => { setError(''); setLocalData({...localData, branch}) }}
                      className={`p-4 rounded-xl border text-sm text-left transition-all ${
                        localData.branch === branch 
                          ? 'border-accent bg-accent/10 text-white' 
                          : 'border-border bg-muted-bg/30 text-muted hover:border-muted/50 hover:text-white'
                      }`}
                    >
                      {branch}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div>
                  <h2 className="text-4xl font-bold tracking-tight mb-2">What are you aiming at?</h2>
                  <p className="text-muted">We'll match your project to the role you actually want.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ROLES.map(role => (
                    <button
                      key={role}
                      onClick={() => { setError(''); setLocalData({...localData, targetRole: role}) }}
                      className={`p-4 rounded-xl border text-sm text-left transition-all ${
                        localData.targetRole === role 
                          ? 'border-accent bg-accent/10 text-white' 
                          : 'border-border bg-muted-bg/30 text-muted hover:border-muted/50 hover:text-white'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                <h2 className="text-4xl font-bold tracking-tight">What can you already build with?</h2>
                
                {/* YOUR STACK (Selected skills move here visually) */}
                <div className="min-h-[80px] p-4 rounded-xl border border-border bg-muted-bg/30 relative">
                  <span className="absolute -top-3 left-4 bg-background px-2 font-mono text-[10px] text-muted tracking-widest uppercase">Your Stack</span>
                  <div className="flex flex-wrap gap-2">
                    {localData.skills.length === 0 ? (
                      <span className="text-muted/40 text-sm italic">Select components below...</span>
                    ) : (
                      localData.skills.map(s => (
                        <motion.span layoutId={`skill-${s}`} key={`selected-${s}`} className="px-3 py-1 bg-white text-black text-sm rounded-md font-medium">
                          {s}
                        </motion.span>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {SKILLS.map(skill => {
                    const isSelected = localData.skills.includes(skill);
                    if (isSelected) return null; // Hide from bottom list if selected
                    return (
                      <motion.button
                        layoutId={`skill-${skill}`}
                        key={`unselected-${skill}`}
                        onClick={() => toggleSkill(skill)}
                        className="px-4 py-2 text-sm rounded-md border border-border bg-transparent text-muted hover:text-white hover:border-muted transition-colors"
                      >
                        + {skill}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <h2 className="text-4xl font-bold tracking-tight">What is your AI experience level?</h2>
                <div className="flex flex-col gap-3">
                  {AI_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setError(''); setLocalData({...localData, aiExperience: opt.value}) }}
                      className={`p-5 rounded-xl border text-left transition-all ${
                        localData.aiExperience === opt.value 
                          ? 'border-accent bg-accent/10 text-white' 
                          : 'border-border bg-muted-bg/30 text-muted hover:border-muted/50 hover:text-white'
                      }`}
                    >
                      <span className="block text-lg">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="step6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div>
                  <p className="font-mono text-accent text-xs tracking-widest uppercase mb-4">Your Next Interview</p>
                  <h2 className="text-3xl font-light leading-snug">
                    "Show me something useful you've built using AI."
                  </h2>
                </div>
                
                <div className="pt-6 border-t border-border">
                  <p className="text-muted text-sm mb-4">What happens next?</p>
                  <div className="flex flex-col gap-3">
                    {INTERVIEW_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setError(''); setLocalData({...localData, placementConfidence: opt}) }}
                        className={`p-5 rounded-xl border text-left transition-all ${
                          localData.placementConfidence === opt 
                            ? 'border-white bg-white/10 text-white' 
                            : 'border-border bg-muted-bg/30 text-muted hover:border-muted/50 hover:text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="mt-8 pb-8">
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-warning text-sm mb-4 text-center">
              {error}
            </motion.p>
          )}
          <div className="flex justify-between items-center">
            {step > 1 ? (
              <button 
                onClick={() => { setError(''); setStep(step - 1) }}
                className="p-3 text-muted hover:text-white transition-colors rounded-full"
              >
                <ArrowLeft size={20} />
              </button>
            ) : <div />}
            
            <Button 
              onClick={handleNext}
              variant={step === 6 ? 'primary' : 'secondary'}
              className="gap-2 px-8"
            >
              {step === 6 ? 'ANALYZE MY PROFILE' : 'CONTINUE'}
              {step < 6 && <ChevronRight size={18} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
