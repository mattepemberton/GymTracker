import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  Dumbbell, 
  PlusCircle, 
  History, 
  Settings, 
  Save, 
  Trash2, 
  Download, 
  Upload, 
  ChevronRight, 
  Activity,
  CheckCircle,
  X,
  ChevronUp,
  ChevronDown,
  Copy,
  Calendar
} from 'lucide-react';

// --- Pre-populated Exercise Database ---
const EXERCISE_DB = [
  { id: 'c1', name: 'Barbell Bench Press', group: 'Chest' },
  { id: 'c2', name: 'Incline Dumbbell Press', group: 'Chest' },
  { id: 'c3', name: 'Cable Crossover', group: 'Chest' },
  { id: 'c4', name: 'Push-ups', group: 'Chest' },
  { id: 'b1', name: 'Pull-ups', group: 'Back' },
  { id: 'b2', name: 'Barbell Row', group: 'Back' },
  { id: 'b3', name: 'Lat Pulldown', group: 'Back' },
  { id: 'b4', name: 'Seated Cable Row', group: 'Back' },
  { id: 'l1', name: 'Barbell Squat', group: 'Legs' },
  { id: 'l2', name: 'Leg Press', group: 'Legs' },
  { id: 'l3', name: 'Romanian Deadlift', group: 'Legs' },
  { id: 'l4', name: 'Leg Extension', group: 'Legs' },
  { id: 'l5', name: 'Calf Raise', group: 'Legs' },
  { id: 's1', name: 'Overhead Press', group: 'Shoulders' },
  { id: 's2', name: 'Lateral Raise', group: 'Shoulders' },
  { id: 's3', name: 'Face Pulls', group: 'Shoulders' },
  { id: 'a1', name: 'Barbell Curl', group: 'Arms' },
  { id: 'a2', name: 'Hammer Curl', group: 'Arms' },
  { id: 'a3', name: 'Tricep Pushdown', group: 'Arms' },
  { id: 'a4', name: 'Overhead Tricep Extension', group: 'Arms' },
  { id: 'co1', name: 'Crunch', group: 'Core' },
  { id: 'co2', name: 'Plank', group: 'Core' },
  { id: 'co3', name: 'Hanging Leg Raise', group: 'Core' },
];

// --- Default Workout Templates ---
const DEFAULT_WORKOUTS = [
  {
    id: 'def_push',
    name: 'Push Day (Chest/Shoulders/Triceps)',
    exerciseIds: ['c1', 'c2', 's1', 's2', 'a3']
  },
  {
    id: 'def_pull',
    name: 'Pull Day (Back/Biceps)',
    exerciseIds: ['b1', 'b2', 'b3', 'a1', 'a2']
  },
  {
    id: 'def_legs',
    name: 'Leg Day',
    exerciseIds: ['l1', 'l2', 'l3', 'l5', 'co1']
  },
  {
    id: 'def_full',
    name: 'Full Body Essentials',
    exerciseIds: ['l1', 'c1', 'b2', 's1', 'co2']
  }
];

const SimpleLineChart = ({ data, xKey, yKey }) => {
  if (!data || data.length === 0) return <div className="text-gray-400 text-sm text-center p-4">No data available yet.</div>;
  if (data.length === 1) return <div className="text-gray-400 text-sm text-center p-4">Need at least 2 sessions to show a trend. Total Vol: {data[0][yKey]}kg</div>;

  const width = 300;
  const height = 150;
  const padding = 20;

  const maxVal = Math.max(...data.map(d => d[yKey]));
  const minVal = Math.min(...data.map(d => d[yKey]));
  
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const yRange = maxVal === minVal ? 1 : maxVal - minVal;
    const y = height - padding - ((d[yKey] - minVal) / yRange) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full flex flex-col items-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible" style={{ maxWidth: '100%' }}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1" />
        <polyline fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
        {data.map((d, index) => {
          const x = padding + (index / (data.length - 1)) * (width - padding * 2);
          const yRange = maxVal === minVal ? 1 : maxVal - minVal;
          const y = height - padding - ((d[yKey] - minVal) / yRange) * (height - padding * 2);
          return <circle key={index} cx={x} cy={y} r="4" fill="#2563eb" />;
        })}
      </svg>
      <div className="flex justify-between w-full text-[10px] text-gray-500 mt-2 px-2">
        <span>{new Date(data[0][xKey]).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
        <span>{new Date(data[data.length - 1][xKey]).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [workouts, setWorkouts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [customExercises, setCustomExercises] = useState([]);
  
  useEffect(() => {
    const savedWorkouts = localStorage.getItem('wt_workouts');
    const savedLogs = localStorage.getItem('wt_logs');
    const savedCustomEx = localStorage.getItem('wt_custom_exercises');
    
    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts));
    } else {
      setWorkouts(DEFAULT_WORKOUTS);
    }

    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedCustomEx) setCustomExercises(JSON.parse(savedCustomEx));
  }, []);

  useEffect(() => localStorage.setItem('wt_workouts', JSON.stringify(workouts)), [workouts]);
  useEffect(() => localStorage.setItem('wt_logs', JSON.stringify(logs)), [logs]);
  useEffect(() => localStorage.setItem('wt_custom_exercises', JSON.stringify(customExercises)), [customExercises]);

  const allExercises = useMemo(() => [...EXERCISE_DB, ...customExercises], [customExercises]);
  const dynamicMuscleGroups = useMemo(() => [...new Set(allExercises.map(e => e.group))], [allExercises]);

  const getExerciseName = (id) => allExercises.find(e => e.id === id)?.name || 'Unknown';
  
  const getLastPerformance = (exerciseId) => {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    for (let log of sortedLogs) {
      const exLog = log.exercises.find(e => e.exerciseId === exerciseId);
      if (exLog) return { date: log.date, sets: exLog.sets };
    }
    return null;
  };

  const HomeDashboard = () => {
    const [selectedExercise, setSelectedExercise] = useState(allExercises[0]?.id || '');

    const chartData = useMemo(() => {
      const data = [];
      logs.forEach(log => {
        const exData = log.exercises.find(e => e.exerciseId === selectedExercise);
        if (exData) {
          const totalVolume = exData.sets.reduce((sum, set) => sum + (Number(set.weight) * Number(set.reps) || 0), 0);
          if (totalVolume > 0) data.push({ date: log.date, volume: totalVolume });
        }
      });
      return data.sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [logs, selectedExercise]);

    return (
      <div className="p-4 space-y-6 pb-24">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Your Progress</h1>
            <Activity className="text-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h3 className="text-sm font-medium text-blue-600">Total Workouts</h3>
            <p className="text-2xl font-bold text-gray-800">{logs.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <h3 className="text-sm font-medium text-green-600">Templates</h3>
            <p className="text-2xl font-bold text-gray-800">{workouts.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Volume Tracker
          </h2>
          <select 
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full p-2 mb-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {allExercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
          </select>
          <p className="text-xs text-center text-gray-500 mb-2">Total Weight Lifted (kg) vs Date</p>
          <SimpleLineChart data={chartData} xKey="date" yKey="volume" />
        </div>

        {logs.length > 0 && (
          <div className="space-y-3">
             <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <History className="w-5 h-5 mr-2 text-gray-500" />
              Recent History
            </h2>
            <div className="space-y-2">
               {[...logs].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 3).map(log => (
                 <div key={log.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-sm">
                    <div className="flex justify-between items-center mb-1">
                       <span className="font-bold text-gray-700">{log.workoutName}</span>
                       <span className="text-[10px] text-gray-400">{new Date(log.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {log.exercises.map(ex => getExerciseName(ex.exerciseId)).join(', ')}
                    </p>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const WorkoutsView = () => {
    const [isBuilding, setIsBuilding] = useState(false);
    const [editingWorkoutId, setEditingWorkoutId] = useState(null);
    const [newWorkoutName, setNewWorkoutName] = useState('');
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [activeGroupFilter, setActiveGroupFilter] = useState('All');
    const [isCreatingExercise, setIsCreatingExercise] = useState(false);
    const [newExName, setNewExName] = useState('');
    const [newExGroup, setNewExGroup] = useState('');

    const handleEditWorkout = (workout) => {
      setEditingWorkoutId(workout.id);
      setNewWorkoutName(workout.name);
      setSelectedExercises(workout.exerciseIds);
      setIsBuilding(true);
    };

    const handleSaveWorkout = (isSaveAsNew = false) => {
      if (!newWorkoutName.trim() || selectedExercises.length === 0) return alert('Name and exercises required.');
      
      const workoutData = { 
        id: (isSaveAsNew || !editingWorkoutId) ? Date.now().toString() : editingWorkoutId, 
        name: newWorkoutName, 
        exerciseIds: selectedExercises 
      };

      if (editingWorkoutId && !isSaveAsNew) {
        setWorkouts(prev => prev.map(w => w.id === editingWorkoutId ? workoutData : w));
      } else {
        setWorkouts(prev => [...prev, workoutData]);
      }

      setIsBuilding(false);
      setEditingWorkoutId(null);
      setNewWorkoutName('');
      setSelectedExercises([]);
    };

    const handleSaveCustomExercise = () => {
      if (!newExName.trim() || !newExGroup.trim()) return alert('Name and group required.');
      const newEx = { id: 'cust_' + Date.now().toString(), name: newExName.trim(), group: newExGroup.trim() };
      setCustomExercises([...customExercises, newEx]);
      setIsCreatingExercise(false);
      setNewExName('');
      setNewExGroup('');
    };

    const toggleExercise = (id) => {
      setSelectedExercises(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
    };

    const moveExercise = (index, direction) => {
      const newOrder = [...selectedExercises];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newOrder.length) return;
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      setSelectedExercises(newOrder);
    };

    if (isBuilding) {
      return (
        <div className="p-4 space-y-4 pb-24">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">{editingWorkoutId ? 'Edit Workout' : 'Build Workout'}</h1>
            <button onClick={() => {setIsBuilding(false); setEditingWorkoutId(null);}} className="p-1"><X /></button>
          </div>
          <input 
            type="text" placeholder="Workout Name" value={newWorkoutName}
            onChange={(e) => setNewWorkoutName(e.target.value)}
            className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />

          {selectedExercises.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 space-y-2">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Exercise Order</p>
              {selectedExercises.map((id, index) => (
                <div key={`${id}-${index}`} className="flex items-center justify-between bg-white p-2 rounded shadow-sm text-sm">
                  <span className="truncate flex-1">{getExerciseName(id)}</span>
                  <div className="flex space-x-1 ml-2">
                    <button onClick={() => moveExercise(index, -1)} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30" disabled={index === 0}><ChevronUp size={16}/></button>
                    <button onClick={() => moveExercise(index, 1)} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30" disabled={index === selectedExercises.length - 1}><ChevronDown size={16}/></button>
                    <button onClick={() => toggleExercise(id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
            <button onClick={() => setActiveGroupFilter('All')} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeGroupFilter === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>All</button>
            {dynamicMuscleGroups.map(g => (
              <button key={g} onClick={() => setActiveGroupFilter(g)} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeGroupFilter === g ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{g}</button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="max-h-[35vh] overflow-y-auto divide-y divide-gray-100">
              {allExercises.filter(e => activeGroupFilter === 'All' || e.group === activeGroupFilter).map(ex => (
                <div key={ex.id} onClick={() => toggleExercise(ex.id)} className="flex items-center p-4 active:bg-gray-50 cursor-pointer">
                  <div className={`w-6 h-6 rounded border mr-4 flex items-center justify-center ${selectedExercises.includes(ex.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                    {selectedExercises.includes(ex.id) && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                  <div><p className="font-medium text-sm">{ex.name}</p><p className="text-[10px] text-gray-500">{ex.group}</p></div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t">
              {!isCreatingExercise ? (
                <button onClick={() => setIsCreatingExercise(true)} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg text-sm">+ New Custom Exercise</button>
              ) : (
                <div className="space-y-3">
                  <input type="text" placeholder="Name" value={newExName} onChange={(e) => setNewExName(e.target.value)} className="w-full p-2 text-sm rounded border outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" list="groups" placeholder="Muscle Group" value={newExGroup} onChange={(e) => setNewExGroup(e.target.value)} className="w-full p-2 text-sm rounded border outline-none focus:ring-2 focus:ring-blue-500" />
                  <datalist id="groups">{dynamicMuscleGroups.map(g => <option key={g} value={g} />)}</datalist>
                  <div className="flex space-x-2">
                    <button onClick={handleSaveCustomExercise} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm">Save</button>
                    <button onClick={() => setIsCreatingExercise(false)} className="flex-1 bg-gray-200 py-2 rounded-lg text-sm">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <button onClick={() => handleSaveWorkout(false)} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center">
              <Save className="mr-2" size={20} /> {editingWorkoutId ? 'Update Workout' : 'Save Workout'}
            </button>
            {editingWorkoutId && (
              <button onClick={() => handleSaveWorkout(true)} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold flex items-center justify-center">
                <Copy className="mr-2" size={18} /> Save as New
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-6 pb-24">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Your Workouts</h1>
          <Dumbbell className="text-blue-500" />
        </div>
        <div className="space-y-4">
          {workouts.length === 0 && (
            <div className="text-center py-10 space-y-4">
              <p className="text-gray-400">No workouts created yet.</p>
              <button onClick={() => setWorkouts(DEFAULT_WORKOUTS)} className="text-blue-600 font-semibold text-sm underline">Load Default Templates</button>
            </div>
          )}
          {workouts.map(w => (
            <div key={w.id} className="bg-white p-5 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm active:scale-95 transition-transform" onClick={() => handleEditWorkout(w)}>
              <div>
                <h3 className="font-bold text-gray-800">{w.name}</h3>
                <p className="text-xs text-gray-500">{w.exerciseIds.length} exercises</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete template?')) setWorkouts(workouts.filter(x => x.id !== w.id)); }} className="text-red-400 p-2 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={20} /></button>
            </div>
          ))}
        </div>
        <button onClick={() => { setIsBuilding(true); setEditingWorkoutId(null); setSelectedExercises([]); setNewWorkoutName(''); }} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg active:bg-blue-700 transition-colors">+ Build New Workout</button>
      </div>
    );
  };

  const SessionLogger = () => {
    const [activeWorkout, setActiveWorkout] = useState(null);
    const [sessionData, setSessionData] = useState({});
    const [exerciseOrder, setExerciseOrder] = useState([]);
    // State to hold the chosen date for the session
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);

    const startWorkout = (workout) => {
      setActiveWorkout(workout);
      setExerciseOrder([...workout.exerciseIds]);
      setSessionDate(new Date().toISOString().split('T')[0]); // Reset to today
      const initial = {};
      
      workout.exerciseIds.forEach(id => { 
        const prev = getLastPerformance(id);
        if (prev && prev.sets && prev.sets.length > 0) {
          initial[id] = prev.sets.map(s => ({ 
            reps: s.reps, 
            weight: s.weight 
          }));
        } else {
          initial[id] = [
            { reps: '10', weight: '0' },
            { reps: '10', weight: '0' },
            { reps: '10', weight: '0' }
          ];
        }
      });
      setSessionData(initial);
    };

    const saveSession = () => {
      const cleaned = [];
      exerciseOrder.forEach(exId => {
        const valid = sessionData[exId].filter(s => s.reps !== '' || s.weight !== '');
        if (valid.length > 0) cleaned.push({ exerciseId: exId, sets: valid });
      });
      if (cleaned.length === 0) return alert("Please log at least one set.");
      
      // Use the chosen sessionDate instead of new Date().toISOString()
      setLogs(prev => [...prev, { 
        id: Date.now().toString(), 
        date: new Date(sessionDate).toISOString(), 
        workoutName: activeWorkout.name, 
        exercises: cleaned 
      }]);
      setActiveWorkout(null);
      setActiveTab('home');
    };

    const reorderSession = (index, direction) => {
      const newOrder = [...exerciseOrder];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newOrder.length) return;
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      setExerciseOrder(newOrder);
    };

    if (activeWorkout) {
      return (
        <div className="p-4 space-y-6 pb-24 bg-gray-50 min-h-screen">
          <div className="flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md p-4 -mx-4 z-20 border-b border-gray-200">
            <h1 className="font-bold text-gray-800 truncate mr-2">{activeWorkout.name}</h1>
            <button onClick={() => confirm('End session without saving?') && setActiveWorkout(null)} className="p-1"><X /></button>
          </div>

          {/* Date Picker Section */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
             <Calendar className="text-blue-500 shrink-0" size={20} />
             <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Workout Date</label>
                <input 
                  type="date" 
                  value={sessionDate} 
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full bg-transparent font-semibold text-gray-700 outline-none focus:ring-0 cursor-pointer"
                />
             </div>
          </div>

          {exerciseOrder.map((exId, idx) => {
            const prev = getLastPerformance(exId);
            return (
              <div key={`${exId}-${idx}`} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-3 bg-gray-100 flex justify-between items-center border-b">
                   <div className="flex items-center space-x-2">
                      <span className="text-xs font-black bg-gray-300 text-white w-5 h-5 rounded-full flex items-center justify-center">{idx + 1}</span>
                      <span className="font-bold text-sm text-gray-800 truncate">{getExerciseName(exId)}</span>
                   </div>
                   <div className="flex space-x-1">
                      <button onClick={() => reorderSession(idx, -1)} disabled={idx === 0} className="p-1 disabled:opacity-20"><ChevronUp size={18}/></button>
                      <button onClick={() => reorderSession(idx, 1)} disabled={idx === exerciseOrder.length - 1} className="p-1 disabled:opacity-20"><ChevronDown size={18}/></button>
                   </div>
                </div>
                {prev && <div className="p-2 bg-blue-50 text-[10px] text-blue-700 border-b border-blue-100">
                  <span className="font-bold uppercase mr-1">Last Session:</span> {prev.sets.map(s => `${s.weight}kg x ${s.reps}`).join(', ')}
                </div>}
                <div className="p-4 space-y-3">
                  {sessionData[exId].map((set, sIdx) => (
                    <div key={sIdx} className="flex space-x-3 items-center">
                      <span className="w-4 text-[10px] font-bold text-gray-400">{sIdx + 1}</span>
                      <div className="flex-1 flex bg-gray-50 rounded-lg border border-gray-200 divide-x divide-gray-200">
                        <div className="flex-1 p-2 flex items-center">
                          <input type="number" placeholder="0" value={set.weight} onChange={(e) => {
                            const d = {...sessionData}; d[exId][sIdx].weight = e.target.value; setSessionData(d);
                          }} className="w-full bg-transparent text-center font-semibold text-gray-800 outline-none" />
                          <span className="text-[10px] font-bold text-gray-400 ml-1">kg</span>
                        </div>
                        <div className="flex-1 p-2 flex items-center">
                          <input type="number" placeholder="0" value={set.reps} onChange={(e) => {
                            const d = {...sessionData}; d[exId][sIdx].reps = e.target.value; setSessionData(d);
                          }} className="w-full bg-transparent text-center font-semibold text-gray-800 outline-none" />
                          <span className="text-[10px] font-bold text-gray-400 ml-1">reps</span>
                        </div>
                      </div>
                      <button onClick={() => {
                        const d = {...sessionData}; d[exId].splice(sIdx, 1); setSessionData(d);
                      }} className="text-red-300 p-1"><X size={16} /></button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const d = {...sessionData}; d[exId].push({reps:'', weight:''}); setSessionData(d);
                  }} className="w-full py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">+ Add Set</button>
                </div>
              </div>
            );
          })}
          <button onClick={saveSession} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-xl active:bg-green-700 transition-colors">Finish Workout</button>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-6 pb-24">
        <h1 className="text-2xl font-bold text-gray-800">Log Session</h1>
        <div className="space-y-4">
          {workouts.length === 0 && (
             <div className="text-center py-10 space-y-4">
              <p className="text-gray-400">No workout templates found.</p>
              <button onClick={() => setActiveTab('workouts')} className="bg-blue-100 text-blue-700 px-6 py-2 rounded-lg font-bold">Go to Templates</button>
            </div>
          )}
          {workouts.map(w => (
            <button key={w.id} onClick={() => startWorkout(w)} className="w-full bg-white p-5 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm active:scale-95 transition-transform text-left">
              <div>
                <span className="font-bold text-gray-800 block">{w.name}</span>
                <span className="text-[10px] text-gray-400 font-medium">{w.exerciseIds.length} Exercises</span>
              </div>
              <ChevronRight className="text-gray-300" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const DataView = () => (
    <div className="p-4 space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-800">Settings & Data</h1>
      <div className="bg-white rounded-xl border border-gray-100 divide-y shadow-sm">
        <div className="p-5 active:bg-gray-50 cursor-pointer" onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({workouts, logs, customExercises}));
            const a = document.createElement('a'); a.setAttribute("href", dataStr); a.setAttribute("download", `workout_backup_${new Date().toISOString().split('T')[0]}.json`); a.click();
          }}>
          <button className="flex items-center text-blue-600 font-bold"><Download className="mr-3" /> Export Backup (JSON)</button>
          <p className="text-[10px] text-gray-500 mt-1 ml-9">Save your workouts and history to a file.</p>
        </div>
        <div className="p-5 active:bg-gray-50">
          <label className="flex items-center text-green-600 font-bold cursor-pointer">
            <Upload className="mr-3" /> Import Backup
            <input type="file" className="hidden" onChange={(e) => {
              const r = new FileReader();
              r.onload = (ev) => {
                try {
                  const d = JSON.parse(ev.target.result);
                  setWorkouts(d.workouts || []); setLogs(d.logs || []); setCustomExercises(d.customExercises || []);
                  alert('Data imported successfully!');
                } catch(err) { alert('Failed to parse file.'); }
              };
              r.readAsText(e.target.files[0]);
            }} />
          </label>
          <p className="text-[10px] text-gray-500 mt-1 ml-9">Restore data from a previously exported file.</p>
        </div>
        <div className="p-5 active:bg-gray-50 cursor-pointer" onClick={() => { if(confirm('Delete everything? This cannot be undone.')) { setWorkouts([]); setLogs([]); setCustomExercises([]); localStorage.clear(); } }}>
          <button className="flex items-center text-red-600 font-bold"><Trash2 className="mr-3" /> Wipe All Data</button>
          <p className="text-[10px] text-gray-500 mt-1 ml-9">Factory reset the app and delete all progress.</p>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg text-center">
        <p className="text-xs text-gray-500">Workout Tracker v1.2.0</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative shadow-2xl overflow-x-hidden">
      {activeTab === 'home' && <HomeDashboard />}
      {activeTab === 'workouts' && <WorkoutsView />}
      {activeTab === 'log' && <SessionLogger />}
      {activeTab === 'data' && <DataView />}
      
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around p-3 pb-6 z-50 shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center transition-colors ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}`}>
          <Home size={24} /><span className="text-[10px] mt-1 font-bold">Home</span>
        </button>
        <button onClick={() => setActiveTab('workouts')} className={`flex flex-col items-center transition-colors ${activeTab === 'workouts' ? 'text-blue-600' : 'text-gray-400'}`}>
          <Dumbbell size={24} /><span className="text-[10px] mt-1 font-bold">Templates</span>
        </button>
        <button onClick={() => setActiveTab('log')} className={`flex flex-col items-center transition-colors ${activeTab === 'log' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className="-mt-8 bg-blue-600 p-3 rounded-full text-white shadow-lg active:scale-90 transition-transform">
            <PlusCircle size={32} />
          </div>
          <span className="text-[10px] mt-1 font-bold">Start</span>
        </button>
        <button onClick={() => setActiveTab('data')} className={`flex flex-col items-center transition-colors ${activeTab === 'data' ? 'text-blue-600' : 'text-gray-400'}`}>
          <Settings size={24} /><span className="text-[10px] mt-1 font-bold">Settings</span>
        </button>
      </div>
    </div>
  );
}