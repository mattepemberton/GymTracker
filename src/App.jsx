import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Home, Dumbbell, PlusCircle, History, Settings, Save, Trash2, Download, 
  Upload, ChevronRight, Activity, CheckCircle, X, ChevronUp, ChevronDown, 
  Copy, Calendar, Timer, Play, Pause, RefreshCw, Share2, Clock
} from 'lucide-react';

// --- Constants & Initial Data ---
const EXERCISE_DB = [
  { id: 'c1', name: 'Barbell Bench Press', group: 'Chest' },
  { id: 'c2', name: 'Incline Dumbbell Press', group: 'Chest' },
  { id: 'b1', name: 'Pull-ups', group: 'Back' },
  { id: 'b2', name: 'Barbell Row', group: 'Back' },
  { id: 'l1', name: 'Barbell Squat', group: 'Legs' },
  { id: 's1', name: 'Overhead Press', group: 'Shoulders' },
];

const DEFAULT_WORKOUTS = [
  { id: 'def_push', name: 'Push Day', exerciseIds: ['c1', 'c2', 's1'] },
  { id: 'def_pull', name: 'Pull Day', exerciseIds: ['b1', 'b2'] },
];

export default function GymTrackerPro() {
  const [activeTab, setActiveTab] = useState('home');
  const [workouts, setWorkouts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [customExercises, setCustomExercises] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  
  // Custom Modal States
  const [modal, setModal] = useState({ show: false, type: '', data: null });

  // --- Persistence Logic ---
  useEffect(() => {
    const saved = {
      workouts: localStorage.getItem('gtp_workouts'),
      logs: localStorage.getItem('gtp_logs'),
      customEx: localStorage.getItem('gtp_custom_ex'),
      session: localStorage.getItem('gtp_active_session')
    };
    
    if (saved.workouts) setWorkouts(JSON.parse(saved.workouts));
    else setWorkouts(DEFAULT_WORKOUTS);

    if (saved.logs) setLogs(JSON.parse(saved.logs));
    if (saved.customEx) setCustomExercises(JSON.parse(saved.customEx));
    if (saved.session) setActiveSession(JSON.parse(saved.session));
  }, []);

  useEffect(() => {
    localStorage.setItem('gtp_workouts', JSON.stringify(workouts));
    localStorage.setItem('gtp_logs', JSON.stringify(logs));
    localStorage.setItem('gtp_custom_ex', JSON.stringify(customExercises));
    localStorage.setItem('gtp_active_session', JSON.stringify(activeSession));
  }, [workouts, logs, customExercises, activeSession]);

  const allExercises = useMemo(() => [...EXERCISE_DB, ...customExercises], [customExercises]);
  const getExName = (id) => allExercises.find(e => e.id === id)?.name || 'Unknown Exercise';

  // --- Helper: Format Time ---
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- UI Component: Rest Timer ---
  const RestTimer = () => {
    const [timeLeft, setTimeLeft] = useState(120);
    const [isActive, setIsActive] = useState(false);
    const [inputVal, setInputVal] = useState(120);

    useEffect(() => {
      let itv;
      if (isActive && timeLeft > 0) {
        itv = setInterval(() => setTimeLeft(t => t - 1), 1000);
      } else if (timeLeft === 0) {
        setIsActive(false);
      }
      return () => clearInterval(itv);
    }, [isActive, timeLeft]);

    return (
      <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between mb-4 border border-slate-700 shadow-lg">
        <div className="flex items-center gap-3">
          <Timer size={18} className="text-blue-400" />
          <span className="font-mono text-xl font-bold">{Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2, '0')}</span>
        </div>
        <div className="flex gap-2">
          <input 
            type="number" value={inputVal} 
            onChange={e => setInputVal(parseInt(e.target.value) || 0)}
            className="w-12 bg-slate-800 rounded px-1 text-center text-xs border border-slate-600"
          />
          <button onClick={() => {setTimeLeft(inputVal); setIsActive(true)}} className="p-1.5 bg-blue-600 rounded-lg"><Play size={14}/></button>
          <button onClick={() => setIsActive(false)} className="p-1.5 bg-slate-700 rounded-lg"><Pause size={14}/></button>
          <button onClick={() => {setTimeLeft(inputVal); setIsActive(false)}} className="p-1.5 bg-slate-700 rounded-lg"><RefreshCw size={14}/></button>
        </div>
      </div>
    );
  };

  // --- Main View: Activity ---
  const ActivityView = () => (
    <div className="p-4 space-y-4 pb-24">
      <h1 className="text-2xl font-black text-slate-800">History</h1>
      {logs.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No workouts recorded yet.</div>
      ) : (
        [...logs].reverse().map(log => (
          <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-800">{log.workoutName}</h3>
              <span className="text-[10px] font-bold text-blue-500 uppercase">{log.date} @ {log.endTime}</span>
            </div>
            <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
              <span className="flex items-center gap-1"><Clock size={12}/> {log.duration}</span>
              <span className="flex items-center gap-1"><Dumbbell size={12}/> {log.exercises.length} Exercises</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // --- Main View: Workout Templates ---
  const TemplateView = () => {
    const [isBuilding, setIsBuilding] = useState(false);
    const [isBulk, setIsBulk] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempExercises, setTempExercises] = useState([]);
    const [bulkText, setBulkText] = useState('');

    const saveTemplate = () => {
      const newT = { id: Date.now().toString(), name: tempName || 'New Workout', exerciseIds: tempExercises };
      setWorkouts([...workouts, newT]);
      setIsBuilding(false);
      setTempExercises([]);
      setTempName('');
    };

    const handleBulkAdd = () => {
      const lines = bulkText.split('\n').filter(l => l.trim());
      const newCustom = lines.map(l => ({ id: 'c_'+Math.random().toString(36).substr(2,9), name: l.trim(), group: 'Custom' }));
      setCustomExercises([...customExercises, ...newCustom]);
      setBulkText('');
      setIsBulk(false);
    };

    if (isBuilding) return (
      <div className="p-4 space-y-4 pb-24 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center">
          <h2 className="font-black text-xl">Build Workout</h2>
          <button onClick={() => setIsBuilding(false)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
        </div>
        <input 
          placeholder="Workout Name" value={tempName} onChange={e => setTempName(e.target.value)}
          className="w-full p-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 ring-blue-500"
        />
        <div className="bg-white border rounded-2xl p-2 max-h-64 overflow-y-auto space-y-1">
          {allExercises.map(ex => (
            <label key={ex.id} className="flex items-center p-3 hover:bg-slate-50 rounded-xl cursor-pointer">
              <input 
                type="checkbox" checked={tempExercises.includes(ex.id)}
                onChange={() => setTempExercises(prev => prev.includes(ex.id) ? prev.filter(i => i !== ex.id) : [...prev, ex.id])}
                className="w-5 h-5 mr-3 accent-blue-600"
              />
              <span className="text-sm font-semibold">{ex.name}</span>
            </label>
          ))}
        </div>
        <button onClick={() => setIsBulk(true)} className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl text-sm font-bold">+ Bulk Create Exercises</button>
        <button onClick={saveTemplate} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg">Save Template</button>

        {isBulk && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-white w-full rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-lg">Bulk Create</h3>
              <textarea 
                className="w-full h-40 p-4 border rounded-2xl bg-slate-50 outline-none" 
                placeholder="Squat&#10;Deadlift&#10;Press" 
                value={bulkText} onChange={e => setBulkText(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={handleBulkAdd} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold">Add All</button>
                <button onClick={() => setIsBulk(false)} className="flex-1 bg-slate-100 py-3 rounded-2xl font-bold">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div className="p-4 space-y-4 pb-24">
        <h1 className="text-2xl font-black text-slate-800">Templates</h1>
        <div className="space-y-3">
          {workouts.map(w => (
            <div key={w.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
              <div>
                <h3 className="font-bold text-slate-800">{w.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{w.exerciseIds.length} Exercises</p>
              </div>
              <button onClick={() => setWorkouts(workouts.filter(x => x.id !== w.id))} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
        <button onClick={() => setIsBuilding(true)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg">+ New Template</button>
      </div>
    );
  };

  // --- Session Engine ---
  const SessionView = () => {
    const [elapsed, setElapsed] = useState(0);
    const [showExPicker, setShowExPicker] = useState(false);

    // Feature 9: Total time timer
    useEffect(() => {
      if (!activeSession) return;
      const itv = setInterval(() => setElapsed(prev => prev + 1), 1000);
      return () => clearInterval(itv);
    }, [activeSession]);

    const startWorkout = (w) => {
      setActiveSession({
        templateId: w.id,
        name: w.name,
        date: new Date().toISOString().split('T')[0],
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        exerciseOrder: [...w.exerciseIds],
        data: w.exerciseIds.reduce((acc, id) => {
          acc[id] = [{ weight: '0', reps: '10' }];
          return acc;
        }, {})
      });
      setElapsed(0);
    };

    const handleFinish = (mode) => {
      const log = {
        id: Date.now().toString(),
        workoutName: activeSession.name,
        date: activeSession.date,
        endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: formatTime(elapsed),
        exercises: activeSession.exerciseOrder.map(id => ({ id, sets: activeSession.data[id] }))
      };
      
      setLogs([...logs, log]);

      if (mode === 'update') {
        setWorkouts(workouts.map(w => w.id === activeSession.templateId ? { ...w, exerciseIds: activeSession.exerciseOrder } : w));
      } else if (mode === 'new') {
        setWorkouts([...workouts, { id: Date.now().toString(), name: activeSession.name + ' (Updated)', exerciseIds: activeSession.exerciseOrder }]);
      }

      setActiveSession(null);
      setModal({ show: false });
      setActiveTab('home');
    };

    if (activeSession) return (
      <div className="p-4 space-y-4 pb-32 bg-slate-50 min-h-screen">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 -mx-4 -mt-4 z-50 border-b flex justify-between items-center shadow-sm">
          <div>
            <input 
              value={activeSession.name} 
              onChange={e => setActiveSession({...activeSession, name: e.target.value})}
              className="font-black text-lg bg-transparent border-none outline-none text-slate-800 w-40"
            />
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
              <Clock size={12}/> {formatTime(elapsed)}
            </div>
          </div>
          <button onClick={() => setModal({ show: true, type: 'finish' })} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm">Finish</button>
        </div>

        <RestTimer />

        {activeSession.exerciseOrder.map((exId, idx) => (
          <div key={`${exId}-${idx}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 bg-slate-50 border-b flex justify-between items-center">
              <input 
                className="font-bold text-sm bg-transparent border-none outline-none w-full"
                value={getExName(exId)}
                onChange={e => {
                  const newId = 'temp_'+Date.now();
                  setCustomExercises([...customExercises, { id: newId, name: e.target.value, group: 'Custom' }]);
                  const newOrder = activeSession.exerciseOrder.map(id => id === exId ? newId : id);
                  const newData = { ...activeSession.data, [newId]: activeSession.data[exId] };
                  delete newData[exId];
                  setActiveSession({...activeSession, exerciseOrder: newOrder, data: newData});
                }}
              />
              <button onClick={() => {
                const newOrder = activeSession.exerciseOrder.filter((_, i) => i !== idx);
                setActiveSession({...activeSession, exerciseOrder: newOrder});
              }} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
            </div>
            <div className="p-4 space-y-2">
              {activeSession.data[exId].map((set, sIdx) => (
                <div key={sIdx} className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-300 w-4">{sIdx+1}</span>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="flex items-center bg-slate-50 rounded-xl px-3 border border-slate-100">
                      <input type="number" value={set.weight} onChange={e => {
                        const d = {...activeSession.data}; d[exId][sIdx].weight = e.target.value; setActiveSession({...activeSession, data: d});
                      }} className="w-full bg-transparent py-2 text-center text-sm font-bold outline-none" />
                      <span className="text-[10px] font-bold text-slate-400">kg</span>
                    </div>
                    <div className="flex items-center bg-slate-50 rounded-xl px-3 border border-slate-100">
                      <input type="number" value={set.reps} onChange={e => {
                        const d = {...activeSession.data}; d[exId][sIdx].reps = e.target.value; setActiveSession({...activeSession, data: d});
                      }} className="w-full bg-transparent py-2 text-center text-sm font-bold outline-none" />
                      <span className="text-[10px] font-bold text-slate-400">reps</span>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => {
                const d = {...activeSession.data}; d[exId].push({weight:'0', reps:'10'}); setActiveSession({...activeSession, data: d});
              }} className="w-full py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl">+ Add Set</button>
            </div>
          </div>
        ))}

        <button onClick={() => setShowExPicker(true)} className="w-full py-5 border-2 border-dashed border-slate-300 text-slate-400 rounded-2xl font-bold">+ Change/Add Exercise</button>

        {showExPicker && (
          <div className="fixed inset-0 bg-black/60 z-[100] p-6 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white w-full max-h-[70vh] rounded-3xl p-6 overflow-hidden flex flex-col">
              <div className="flex justify-between mb-4"><h3 className="font-bold">Add Exercise</h3><button onClick={() => setShowExPicker(false)}><X/></button></div>
              <div className="overflow-y-auto space-y-1">
                {allExercises.map(ex => (
                  <button key={ex.id} onClick={() => {
                    const newOrder = [...activeSession.exerciseOrder, ex.id];
                    const newData = { ...activeSession.data };
                    if (!newData[ex.id]) newData[ex.id] = [{weight:'0', reps:'10'}];
                    setActiveSession({...activeSession, exerciseOrder: newOrder, data: newData});
                    setShowExPicker(false);
                  }} className="w-full text-left p-4 hover:bg-slate-50 rounded-xl text-sm font-semibold border-b last:border-0">{ex.name}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {modal.show && modal.type === 'finish' && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-white w-full rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="font-bold text-xl text-center">Save Workout?</h3>
              <div className="space-y-2">
                <button onClick={() => handleFinish('update')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Update Current Template</button>
                <button onClick={() => handleFinish('new')} className="w-full py-4 bg-blue-100 text-blue-700 rounded-2xl font-bold">Save as New Template</button>
                <button onClick={() => handleFinish('none')} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Log Only (No Template Change)</button>
                <button onClick={() => setModal({show:false})} className="w-full py-2 text-slate-400 font-bold text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div className="p-4 space-y-4 pb-24">
        <h1 className="text-2xl font-black text-slate-800">Start Training</h1>
        <div className="space-y-3">
          {workouts.map(w => (
            <button key={w.id} onClick={() => startWorkout(w)} className="w-full bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm text-left active:scale-[0.98] transition-transform">
              <div>
                <span className="font-bold text-slate-800 text-lg block">{w.name}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{w.exerciseIds.length} Exercises</span>
              </div>
              <PlusCircle className="text-blue-600" size={28} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const SettingsView = () => (
    <div className="p-4 space-y-6 pb-24">
      <h1 className="text-2xl font-black text-slate-800">Settings</h1>
      <div className="bg-white rounded-3xl border border-slate-100 divide-y overflow-hidden shadow-sm">
        <button className="w-full p-6 flex items-center gap-4 text-blue-600 font-bold" onClick={() => {
          const data = JSON.stringify({ workouts, customExercises });
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'workout_templates.json'; a.click();
        }}><Share2 size={20}/> Export Templates</button>
        <label className="w-full p-6 flex items-center gap-4 text-green-600 font-bold cursor-pointer">
          <Upload size={20}/> Import Templates
          <input type="file" className="hidden" onChange={e => {
            const r = new FileReader();
            r.onload = ev => {
              const d = JSON.parse(ev.target.result);
              if (d.workouts) setWorkouts([...workouts, ...d.workouts]);
              if (d.customExercises) setCustomExercises([...customExercises, ...d.customExercises]);
              alert('Import successful!');
            };
            r.readAsText(e.target.files[0]);
          }}/>
        </label>
        <button onClick={() => { if(confirm('Wipe all data?')) { localStorage.clear(); window.location.reload(); } }} className="w-full p-6 flex items-center gap-4 text-red-500 font-bold"><Trash2 size={20}/> Factory Reset</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto relative shadow-2xl overflow-x-hidden font-sans select-none">
      {activeTab === 'home' && <ActivityView />}
      {activeTab === 'workouts' && <TemplateView />}
      {activeTab === 'log' && <SessionView />}
      {activeTab === 'data' && <SettingsView />}

      {/* Persistent Nav */}
      <div className="fixed bottom-0 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-slate-100 flex justify-around p-3 pb-8 z-50">
        <button onClick={() => setActiveTab('home')} className={`p-2 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-blue-50 text-blue-600 scale-110' : 'text-slate-400'}`}><History size={24}/></button>
        <button onClick={() => setActiveTab('workouts')} className={`p-2 rounded-2xl transition-all ${activeTab === 'workouts' ? 'bg-blue-50 text-blue-600 scale-110' : 'text-slate-400'}`}><Dumbbell size={24}/></button>
        <button onClick={() => setActiveTab('log')} className={`p-2 rounded-2xl transition-all ${activeTab === 'log' ? 'bg-blue-600 text-white shadow-lg scale-125' : 'text-slate-400'}`}><PlusCircle size={28}/></button>
        <button onClick={() => setActiveTab('data')} className={`p-2 rounded-2xl transition-all ${activeTab === 'data' ? 'bg-blue-50 text-blue-600 scale-110' : 'text-slate-400'}`}><Settings size={24}/></button>
      </div>
    </div>
  );
}