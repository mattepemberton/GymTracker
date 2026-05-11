import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Home, Dumbbell, PlusCircle, History, Settings, Save, Trash2, Download, 
  Upload, ChevronRight, Activity, CheckCircle, X, ChevronUp, ChevronDown, 
  Copy, Calendar, Timer, Play, Pause, RefreshCw, Share2, Clock, List, Edit3,
  Wind, ArrowUp, ArrowDown, Minus
} from 'lucide-react';

// --- Expanded & Grouped Exercise Database ---
const EXERCISE_DB = [
  { id: 'c1', name: 'Barbell Bench Press', group: 'Chest', type: 'strength' },
  { id: 'c2', name: 'Incline Dumbbell Press', group: 'Chest', type: 'strength' },
  { id: 'c3', name: 'Chest Flys', group: 'Chest', type: 'strength' },
  { id: 'b1', name: 'Pull-ups', group: 'Back', type: 'strength' },
  { id: 'b2', name: 'Barbell Row', group: 'Back', type: 'strength' },
  { id: 'b3', name: 'Lat Pulldown', group: 'Back', type: 'strength' },
  { id: 'l1', name: 'Barbell Squat', group: 'Legs', type: 'strength' },
  { id: 'l2', name: 'Leg Press', group: 'Legs', type: 'strength' },
  { id: 'l3', name: 'Leg Extension', group: 'Legs', type: 'strength' },
  { id: 's1', name: 'Overhead Press', group: 'Shoulders', type: 'strength' },
  { id: 's2', name: 'Lateral Raise', group: 'Shoulders', type: 'strength' },
  { id: 'a1', name: 'Bicep Curl', group: 'Arms', type: 'strength' },
  { id: 'a2', name: 'Tricep Extension', group: 'Arms', type: 'strength' },
  { id: 'core1', name: 'Plank', group: 'Core', type: 'strength' },
  { id: 'cardio1', name: 'Treadmill', group: 'Cardio', type: 'cardio' },
  { id: 'cardio2', name: 'Cycling', group: 'Cardio', type: 'cardio' },
  { id: 'cardio3', name: 'Rowing Machine', group: 'Cardio', type: 'cardio' },
];

const DEFAULT_WORKOUTS = [
  { id: 'def_push', name: 'Push Day', exerciseIds: ['c1', 'c2', 's1'] },
  { id: 'def_pull', name: 'Pull Day', exerciseIds: ['b1', 'b2'] },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [workouts, setWorkouts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [customExercises, setCustomExercises] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [modal, setModal] = useState({ show: false, type: '', data: null });

  // --- Persistence Logic ---
  useEffect(() => {
    const saved = {
      workouts: localStorage.getItem('gtp_workouts'),
      logs: localStorage.getItem('gtp_logs'),
      customEx: localStorage.getItem('gtp_custom_ex'),
      session: localStorage.getItem('gtp_active_session'),
      startTime: localStorage.getItem('gtp_session_start')
    };
    
    if (saved.workouts) setWorkouts(JSON.parse(saved.workouts));
    else setWorkouts(DEFAULT_WORKOUTS);

    if (saved.logs) setLogs(JSON.parse(saved.logs));
    if (saved.customEx) setCustomExercises(JSON.parse(saved.customEx));
    if (saved.session) setActiveSession(JSON.parse(saved.session));
    if (saved.startTime) setSessionStartTime(parseInt(saved.startTime));
  }, []);

  useEffect(() => {
    localStorage.setItem('gtp_workouts', JSON.stringify(workouts));
    localStorage.setItem('gtp_logs', JSON.stringify(logs));
    localStorage.setItem('gtp_custom_ex', JSON.stringify(customExercises));
    localStorage.setItem('gtp_active_session', JSON.stringify(activeSession));
    if(sessionStartTime) localStorage.setItem('gtp_session_start', sessionStartTime.toString());
    else localStorage.removeItem('gtp_session_start');
  }, [workouts, logs, customExercises, activeSession, sessionStartTime]);

  const allExercises = useMemo(() => [...EXERCISE_DB, ...customExercises], [customExercises]);
  const getExData = (id) => allExercises.find(e => e.id === id) || { name: 'Unknown', type: 'strength' };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- UI Component: Rest Timer ---
  const RestTimer = React.memo(() => {
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
      <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between mb-4 border border-slate-700">
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
  });

  // --- Activity View ---
  const ActivityView = () => (
    <div className="p-4 space-y-4 pb-24">
      <h1 className="text-2xl font-black text-slate-800">History</h1>
      {logs.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No records found.</div>
      ) : (
        [...logs].reverse().map(log => (
          <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-800">{log.workoutName}</h3>
              <span className="text-[10px] font-bold text-blue-500 uppercase">{log.date}</span>
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

  // --- Template View ---
  const TemplateView = () => {
    const [isBuilding, setIsBuilding] = useState(false);
    const [editId, setEditId] = useState(null); 
    const [tempName, setTempName] = useState('');
    const [tempExercises, setTempExercises] = useState([]);
    const [isBulk, setIsBulk] = useState(false);
    const [bulkText, setBulkText] = useState('');

    const groupedExercises = useMemo(() => {
      return allExercises.reduce((acc, ex) => {
        if (!acc[ex.group]) acc[ex.group] = [];
        acc[ex.group].push(ex);
        return acc;
      }, {});
    }, [allExercises]);

    const handleEdit = (workout) => {
      setEditId(workout.id);
      setTempName(workout.name);
      setTempExercises(workout.exerciseIds);
      setIsBuilding(true);
    };

    const handleBulkAdd = (type = 'strength') => {
      const lines = bulkText.split('\n').filter(l => l.trim());
      const newCustom = lines.map(l => ({ 
        id: 'c_'+Math.random().toString(36).substr(2,9), 
        name: l.trim(), 
        group: type === 'cardio' ? 'Cardio' : 'Custom',
        type: type
      }));
      setCustomExercises(prev => [...prev, ...newCustom]);
      setBulkText('');
      setIsBulk(false);
    };

    const saveTemplate = () => {
      if (editId) {
        setWorkouts(workouts.map(w => w.id === editId ? { ...w, name: tempName, exerciseIds: tempExercises } : w));
      } else {
        setWorkouts([...workouts, { id: Date.now().toString(), name: tempName || 'New Workout', exerciseIds: tempExercises }]);
      }
      setIsBuilding(false);
      setEditId(null);
    };

    if (isBuilding) return (
      <div className="p-4 space-y-4 pb-24">
        <div className="flex justify-between items-center">
          <h2 className="font-black text-xl">{editId ? 'Edit Template' : 'Build Workout'}</h2>
          <button onClick={() => { setIsBuilding(false); setEditId(null); }} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
        </div>
        <input 
          placeholder="Workout Name" value={tempName} onChange={e => setTempName(e.target.value)}
          className="w-full p-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 ring-blue-500"
        />
        
        <div className="bg-white border rounded-2xl p-2 max-h-[50vh] overflow-y-auto">
          {Object.entries(groupedExercises).map(([group, exs]) => (
            <div key={group} className="mb-4">
              <h4 className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-lg">{group}</h4>
              {exs.map(ex => (
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
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setIsBulk('strength')} className="py-3 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl text-[10px] font-bold uppercase tracking-tighter flex flex-col items-center gap-1">
            <Dumbbell size={16}/> + Strength Exercises
          </button>
          <button onClick={() => setIsBulk('cardio')} className="py-3 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-2xl text-[10px] font-bold uppercase tracking-tighter flex flex-col items-center gap-1">
            <Wind size={16}/> + Cardio Exercises
          </button>
        </div>

        <button onClick={saveTemplate} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg">
          {editId ? 'Save Changes' : 'Save Template'}
        </button>

        {isBulk && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-white w-full rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-lg text-slate-800 text-center">Bulk Create {isBulk === 'cardio' ? 'Cardio' : 'Strength'}</h3>
              <textarea 
                className="w-full h-40 p-4 border rounded-2xl bg-slate-50 outline-none" 
                placeholder={isBulk === 'cardio' ? "Running\nWalking\nHIIT" : "Push Ups\nPull Ups\nDips"}
                value={bulkText} onChange={e => setBulkText(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => handleBulkAdd(isBulk)} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold">Add to List</button>
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
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{w.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{w.exerciseIds.length} Exercises</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleEdit(w)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                  <Edit3 size={18}/>
                </button>
                <button onClick={() => setWorkouts(workouts.filter(x => x.id !== w.id))} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => { setIsBuilding(true); setTempExercises([]); setTempName(''); setEditId(null); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg">+ New Template</button>
      </div>
    );
  };

  // --- Session Engine ---
  const SessionView = () => {
    const [elapsed, setElapsed] = useState(0);
    const [showExPicker, setShowExPicker] = useState(false);

    useEffect(() => {
      if (!activeSession || !sessionStartTime) return;
      const itv = setInterval(() => {
        const secondsSinceStart = Math.floor((Date.now() - sessionStartTime) / 1000);
        setElapsed(secondsSinceStart);
      }, 1000);
      return () => clearInterval(itv);
    }, [activeSession, sessionStartTime]);

    const startWorkout = (w) => {
      const now = Date.now();
      setActiveSession({
        templateId: w.id,
        name: w.name,
        date: new Date().toISOString().split('T')[0],
        exerciseOrder: [...w.exerciseIds],
        data: w.exerciseIds.reduce((acc, id) => {
          const ex = getExData(id);
          const isCardio = ex.type === 'cardio';
          acc[id] = Array(3).fill(0).map(() => (
            isCardio ? { time: '10:00', dist: '1.0' } : { weight: '0', reps: '10' }
          ));
          return acc;
        }, {})
      });
      setSessionStartTime(now);
      setElapsed(0);
    };

    const updateSet = (exId, sIdx, field, val) => {
      const newData = { ...activeSession.data };
      newData[exId][sIdx][field] = val;
      setActiveSession({ ...activeSession, data: newData });
    };

    const addSet = (exId) => {
      const ex = getExData(exId);
      const isCardio = ex.type === 'cardio';
      const newData = {...activeSession.data};
      newData[exId].push(isCardio ? { time: '10:00', dist: '1.0' } : { weight: '0', reps: '10' });
      setActiveSession({...activeSession, data: newData});
    };

    const removeSet = (exId, sIdx) => {
      const newData = {...activeSession.data};
      newData[exId] = newData[exId].filter((_, i) => i !== sIdx);
      if (newData[exId].length === 0) {
        // If last set is removed, maybe we should keep a placeholder or remove ex?
        // Let's keep at least one empty set or handle empty gracefully.
        newData[exId] = [getExData(exId).type === 'cardio' ? { time: '0:00', dist: '0' } : { weight: '0', reps: '0' }];
      }
      setActiveSession({...activeSession, data: newData});
    };

    const moveExercise = (index, direction) => {
      const newOrder = [...activeSession.exerciseOrder];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newOrder.length) return;
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      setActiveSession({...activeSession, exerciseOrder: newOrder});
    };

    if (activeSession) return (
      <div className="p-4 space-y-4 pb-32 bg-slate-50 min-h-screen">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 -mx-4 -mt-4 z-50 border-b flex justify-between items-center shadow-sm">
          <div>
            <h2 className="font-black text-lg text-slate-800">{activeSession.name}</h2>
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
              <Clock size={12}/> {formatTime(elapsed)}
            </div>
          </div>
          <button onClick={() => setModal({ show: true, type: 'finish' })} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm">Finish</button>
        </div>

        <RestTimer />

        {activeSession.exerciseOrder.map((exId, idx) => {
          const ex = getExData(exId);
          const isCardio = ex.type === 'cardio';

          return (
            <div key={`${exId}-${idx}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
              <div className="p-3 bg-slate-50 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button 
                      onClick={() => moveExercise(idx, -1)} 
                      disabled={idx === 0}
                      className={`p-0.5 ${idx === 0 ? 'text-slate-200' : 'text-slate-400 hover:text-blue-500'}`}
                    >
                      <ChevronUp size={14}/>
                    </button>
                    <button 
                      onClick={() => moveExercise(idx, 1)} 
                      disabled={idx === activeSession.exerciseOrder.length - 1}
                      className={`p-0.5 ${idx === activeSession.exerciseOrder.length - 1 ? 'text-slate-200' : 'text-slate-400 hover:text-blue-500'}`}
                    >
                      <ChevronDown size={14}/>
                    </button>
                  </div>
                  {isCardio ? <Wind size={16} className="text-emerald-500" /> : <Dumbbell size={16} className="text-blue-500" />}
                  <span className="font-bold text-sm text-slate-700">{ex.name}</span>
                </div>
                <button onClick={() => {
                  const newOrder = activeSession.exerciseOrder.filter((_, i) => i !== idx);
                  setActiveSession({...activeSession, exerciseOrder: newOrder});
                }} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={16}/></button>
              </div>
              <div className="p-4 space-y-3">
                {activeSession.data[exId].map((set, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-300 w-4">{sIdx+1}</span>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      {isCardio ? (
                        <>
                          <SetInput 
                            value={set.time} 
                            label="min" 
                            onUpdate={(val) => updateSet(exId, sIdx, 'time', val)} 
                            type="text"
                          />
                          <SetInput 
                            value={set.dist} 
                            label="km" 
                            onUpdate={(val) => updateSet(exId, sIdx, 'dist', val)} 
                          />
                        </>
                      ) : (
                        <>
                          <SetInput 
                            value={set.weight} 
                            label="kg" 
                            onUpdate={(val) => updateSet(exId, sIdx, 'weight', val)} 
                          />
                          <SetInput 
                            value={set.reps} 
                            label="reps" 
                            onUpdate={(val) => updateSet(exId, sIdx, 'reps', val)} 
                          />
                        </>
                      )}
                    </div>
                    <button 
                      onClick={() => removeSet(exId, sIdx)}
                      className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus size={14}/>
                    </button>
                  </div>
                ))}
                <button onClick={() => addSet(exId)} className="w-full py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl">+ Add Set</button>
              </div>
            </div>
          );
        })}

        <button onClick={() => setShowExPicker(true)} className="w-full py-5 border-2 border-dashed border-slate-300 text-slate-400 rounded-2xl font-bold">+ Add Exercise</button>

        {modal.show && (
            <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
                <div className="bg-white w-full rounded-3xl p-6 space-y-4">
                    <h3 className="font-bold text-xl text-center">Complete Workout?</h3>
                    <button onClick={() => {
                         const log = { id: Date.now().toString(), workoutName: activeSession.name, date: activeSession.date, duration: formatTime(elapsed), exercises: activeSession.exerciseOrder.map(id => ({ id, sets: activeSession.data[id] })) };
                         setLogs([...logs, log]);
                         setActiveSession(null);
                         setSessionStartTime(null);
                         setModal({show:false});
                         setActiveTab('home');
                    }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Save and Log</button>
                    <button onClick={() => setModal({show:false})} className="w-full py-2 text-slate-400 font-bold text-sm">Cancel</button>
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

  // --- Settings View ---
  const SettingsView = () => (
    <div className="p-4 space-y-6 pb-24">
      <h1 className="text-2xl font-black text-slate-800">Settings</h1>
      <div className="bg-white rounded-3xl border border-slate-100 divide-y overflow-hidden shadow-sm">
        <button className="w-full p-6 flex items-center gap-4 text-blue-600 font-bold text-left" onClick={() => {
          const fullData = { workouts, logs, customExercises };
          const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `gtp_backup_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
        }}><Download size={20}/> Export All Data (JSON)</button>
        
        <label className="w-full p-6 flex items-center gap-4 text-green-600 font-bold cursor-pointer">
          <Upload size={20}/> Import Data
          <input type="file" className="hidden" onChange={e => {
            const r = new FileReader();
            r.onload = ev => {
              try {
                const d = JSON.parse(ev.target.result);
                if (d.workouts) setWorkouts(d.workouts);
                if (d.logs) setLogs(d.logs);
                if (d.customExercises) setCustomExercises(d.customExercises);
                alert('Import successful!');
              } catch(err) { alert('Invalid file format'); }
            };
            r.readAsText(e.target.files[0]);
          }}/>
        </label>
        
        <button onClick={() => { if(confirm('Wipe everything?')) { localStorage.clear(); window.location.reload(); } }} className="w-full p-6 flex items-center gap-4 text-red-500 font-bold text-left"><Trash2 size={20}/> Factory Reset</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto relative shadow-2xl overflow-x-hidden font-sans select-none">
      {activeTab === 'home' && <ActivityView />}
      {activeTab === 'workouts' && <TemplateView />}
      {activeTab === 'log' && <SessionView />}
      {activeTab === 'data' && <SettingsView />}

      <div className="fixed bottom-0 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-slate-100 flex justify-around p-3 pb-8 z-50">
        <button onClick={() => setActiveTab('home')} className={`p-2 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-blue-50 text-blue-600 scale-110' : 'text-slate-400'}`}><History size={24}/></button>
        <button onClick={() => setActiveTab('workouts')} className={`p-2 rounded-2xl transition-all ${activeTab === 'workouts' ? 'bg-blue-50 text-blue-600 scale-110' : 'text-slate-400'}`}><Dumbbell size={24}/></button>
        <button onClick={() => setActiveTab('log')} className={`p-2 rounded-2xl transition-all ${activeTab === 'log' ? 'bg-blue-600 text-white shadow-lg scale-125' : 'text-slate-400'}`}><PlusCircle size={28}/></button>
        <button onClick={() => setActiveTab('data')} className={`p-2 rounded-2xl transition-all ${activeTab === 'data' ? 'bg-blue-50 text-blue-600 scale-110' : 'text-slate-400'}`}><Settings size={24}/></button>
      </div>
    </div>
  );
}

// --- Helper Component to fix the Jumping Input Focus ---
function SetInput({ value, label, onUpdate, type = "number" }) {
  const [localVal, setLocalVal] = useState(value);
  useEffect(() => { setLocalVal(value); }, [value]);

  return (
    <div className="flex items-center bg-slate-50 rounded-xl px-3 border border-slate-100 flex-1">
      <input 
        type={type} 
        inputMode={type === "number" ? "decimal" : "text"}
        value={localVal} 
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={() => onUpdate(localVal)} 
        className="w-full bg-transparent py-2 text-center text-sm font-bold outline-none" 
      />
      <span className="text-[10px] font-bold text-slate-400">{label}</span>
    </div>
  );
}