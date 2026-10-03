'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { generateProjectDNA } from '@/lib/project-dna/generateProjectDNA';
import { Check, ChevronRight } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/trackEvent';

const BRANCHES = ['Computer Science', 'AI / ML', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Biotechnology', 'Cybersecurity', 'Other'];
const ROLES = ['Software Engineer', 'Backend Engineer', 'Frontend Engineer', 'Data Analyst', 'Data Scientist', 'AI / ML Engineer', 'Product / Tech', 'Cybersecurity', 'Core Engineering', 'Other'];
const SKILLS = ['Python', 'Java', 'C++', 'JavaScript', 'React', 'SQL', 'Machine Learning', 'Data Structures', 'Cloud', 'Git', 'APIs'];

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
  const [analysisText, setAnalysisText] = useState('Analyzing technical profile...');

  useEffect(() => {
    trackEvent('diagnostic_started', { source: referralContext.source });
  }, [referralContext.source]);

  const handleNext = () => {
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
    
    const stages = [
      'Mapping placement readiness...',
      'Finding missing AI proof...',
      'Generating your 60-minute project...',
      'Building your Project DNA...'
    ];
    
    const minTimePerStage = 600;
    
    // Start AI generation in background
    const generationPromise = generateProjectDNA(localData);
    
    for (let i = 0; i < stages.length; i++) {
      await new Promise(r => setTimeout(r, minTimePerStage));
      setAnalysisText(stages[i]);
    }
    
    try {
      const result = await generationPromise;
      trackEvent('project_generated', { projectName: result.project.name, archetype: result.archetype });
      setProjectResult(result);
      router.push('/result');
    } catch (e) {
      console.error(e);
      // In a real app we'd show an error or fallback, but generateProjectDNA already has a fallback
    }
  };

  const toggleSkill = (skill: string) => {
    setLocalData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex flex-col items-center gap-6"
        >
          <div className="relative w-24 h-24">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute inset-0 border-t-2 border-l-2 border-white rounded-full opacity-50"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute inset-2 border-b-2 border-r-2 border-zinc-500 rounded-full opacity-50"
            />
          </div>
          <motion.p 
            key={analysisText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl text-zinc-300 font-mono"
          >
            {analysisText}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-6 relative">
      <div className="max-w-2xl mx-auto w-full pt-12">
        <div className="mb-8">
          <p className="text-zinc-500 text-sm font-mono mb-2">STEP {step} OF 6</p>
          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
            <motion.div 
              className="bg-white h-full"
              initial={{ width: `${((step - 1) / 6) * 100}%` }}
              animate={{ width: `${(step / 6) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-3xl font-semibold">Who is the builder?</h2>
              <input 
                type="text" 
                placeholder="Your Name" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xl outline-none focus:border-white transition-colors"
                value={localData.name}
                onChange={e => setLocalData({...localData, name: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Your College" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xl outline-none focus:border-white transition-colors"
                value={localData.college}
                onChange={e => setLocalData({...localData, college: e.target.value})}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-3xl font-semibold">What is your engineering branch?</h2>
              <div className="grid grid-cols-2 gap-3">
                {BRANCHES.map(branch => (
                  <button
                    key={branch}
                    onClick={() => setLocalData({...localData, branch})}
                    className={`p-4 rounded-xl border text-left transition-all ${localData.branch === branch ? 'border-white bg-white/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'}`}
                  >
                    {branch}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-3xl font-semibold">What role are you targeting for placements?</h2>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(role => (
                  <button
                    key={role}
                    onClick={() => setLocalData({...localData, targetRole: role})}
                    className={`p-4 rounded-xl border text-left transition-all ${localData.targetRole === role ? 'border-white bg-white/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-3xl font-semibold">Select your current technical skills</h2>
              <p className="text-zinc-400">Select all that apply.</p>
              <div className="flex flex-wrap gap-3">
                {SKILLS.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${localData.skills.includes(skill) ? 'border-white bg-white text-black' : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600'}`}
                  >
                    {localData.skills.includes(skill) && <Check size={16} />}
                    {skill}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-3xl font-semibold">What is your AI experience level?</h2>
              <div className="flex flex-col gap-4">
                {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                  <button
                    key={level}
                    onClick={() => setLocalData({...localData, aiExperience: level})}
                    className={`p-5 rounded-xl border text-left transition-all ${localData.aiExperience === level ? 'border-white bg-white/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-3xl font-semibold leading-tight">If an interviewer asked you right now:<br/><span className="text-zinc-400">"Show me something useful you've built using AI."</span><br/>What would happen?</h2>
              <div className="flex flex-col gap-4 mt-8">
                {[
                  "I have something strong to show", 
                  "I've experimented, but nothing impressive", 
                  "I wouldn't have anything to show"
                ].map(level => (
                  <button
                    key={level}
                    onClick={() => setLocalData({...localData, placementConfidence: level})}
                    className={`p-5 rounded-xl border text-left transition-all ${localData.placementConfidence === level ? 'border-white bg-white/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex justify-between">
          {step > 1 ? (
            <button 
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 text-zinc-400 hover:text-white transition-colors"
            >
              Back
            </button>
          ) : <div />}
          
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-zinc-200 transition-colors"
          >
            {step === 6 ? 'Analyze Profile' : 'Next'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
