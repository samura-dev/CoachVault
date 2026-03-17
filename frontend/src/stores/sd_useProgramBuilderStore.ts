import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface sd_SetData {
  id: string;
  [key: string]: string | number | undefined;
}

export interface sd_ExerciseData {
  id: string;
  name: string;
  order: number;
  sets: sd_SetData[];
}

export interface sd_WorkoutDayData {
  id: string;
  name: string;
  day_number: number;
  exercises: sd_ExerciseData[];
}

export interface sd_ProgramData {
  name: string;
  description: string;
  specialization: string;
  goals: string;
  duration_weeks: number;
  workouts: sd_WorkoutDayData[];
}

interface sd_ProgramBuilderState {
  program: sd_ProgramData;
  isSaving: boolean;
  
  // Actions - Program Level
  sd_setProgramField: <K extends keyof Omit<sd_ProgramData, 'workouts'>>(field: K, value: sd_ProgramData[K]) => void;
  sd_initProgram: (data: Partial<sd_ProgramData>) => void;
  
  // Actions - Workout Level
  sd_addWorkout: () => void;
  sd_duplicateWorkout: (workoutId: string) => void;
  sd_updateWorkoutName: (workoutId: string, name: string) => void;
  sd_removeWorkout: (workoutId: string) => void;
  sd_reorderWorkouts: (startIndex: number, endIndex: number) => void;

  // Actions - Exercise Level
  sd_addExercise: (workoutId: string, exerciseName: string) => void;
  sd_updateExerciseName: (workoutId: string, exerciseId: string, name: string) => void;
  sd_removeExercise: (workoutId: string, exerciseId: string) => void;
  sd_reorderExercises: (workoutId: string, startIndex: number, endIndex: number) => void;

  // Actions - Set Level
  sd_addSet: (workoutId: string, exerciseId: string) => void;
  sd_updateSetField: (workoutId: string, exerciseId: string, setId: string, field: string, value: string | number) => void;
  sd_removeSet: (workoutId: string, exerciseId: string, setId: string) => void;
}

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Фолбэк для HTTP localhost на Vite
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const sd_useProgramBuilderStore = create<sd_ProgramBuilderState>()(
  immer((set) => ({
    program: {
      name: '',
      description: '',
      specialization: '',
      goals: '',
      duration_weeks: 4,
      workouts: []
    },
    isSaving: false,

    sd_initProgram: (data) => set((state) => {
      state.program = { ...state.program, ...data };
    }),

    sd_setProgramField: (field, value) => set((state) => {
      state.program[field] = value;
    }),

    sd_addWorkout: () => set((state) => {
      const newDayNumber = state.program.workouts.length + 1;
      state.program.workouts.push({
        id: createId(),
        name: `День ${newDayNumber}`,
        day_number: newDayNumber,
        exercises: []
      });
    }),

    sd_updateWorkoutName: (workoutId, name) => set((state) => {
      const workout = state.program.workouts.find(w => w.id === workoutId);
      if (workout) workout.name = name;
    }),

    sd_duplicateWorkout: (workoutId) => set((state) => {
      const workoutIndex = state.program.workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex !== -1) {
        const original = state.program.workouts[workoutIndex];
        // Deep copy
        const newWorkout: typeof original = {
          id: createId(),
          name: `${original.name} (Копия)`,
          day_number: 0,
          exercises: original.exercises.map(ex => ({
            ...ex,
            id: createId(),
            sets: ex.sets.map(s => ({ ...s, id: createId() }))
          }))
        };
        // Insert right after original
        state.program.workouts.splice(workoutIndex + 1, 0, newWorkout);
        // Re-number
        state.program.workouts.forEach((w, idx) => {
          w.day_number = idx + 1;
        });
      }
    }),

    sd_removeWorkout: (workoutId) => set((state) => {
      state.program.workouts = state.program.workouts.filter(w => w.id !== workoutId);
      // Пересчитываем номера дней
      state.program.workouts.forEach((w, idx) => {
        w.day_number = idx + 1;
        if (w.name.startsWith('День ')) {
          w.name = `День ${idx + 1}`;
        }
      });
    }),

    sd_reorderWorkouts: (startIndex, endIndex) => set((state) => {
      const wks = state.program.workouts;
      const [removed] = wks.splice(startIndex, 1);
      wks.splice(endIndex, 0, removed);
      wks.forEach((w, idx) => { w.day_number = idx + 1; });
    }),

    sd_addExercise: (workoutId, exerciseName) => set((state) => {
      const workout = state.program.workouts.find(w => w.id === workoutId);
      if (workout) {
        workout.exercises.push({
          id: createId(),
          name: exerciseName,
          order: workout.exercises.length + 1,
          sets: [{ id: createId(), reps: '10', weight: '0' }] // Default base set
        });
      }
    }),

    sd_updateExerciseName: (workoutId, exerciseId, name) => set((state) => {
      const workout = state.program.workouts.find(w => w.id === workoutId);
      if (workout) {
        const ex = workout.exercises.find(e => e.id === exerciseId);
        if (ex) ex.name = name;
      }
    }),

    sd_removeExercise: (workoutId, exerciseId) => set((state) => {
      const workout = state.program.workouts.find(w => w.id === workoutId);
      if (workout) {
        workout.exercises = workout.exercises.filter(e => e.id !== exerciseId);
        workout.exercises.forEach((e, idx) => { e.order = idx + 1; });
      }
    }),

    sd_reorderExercises: (workoutId, startIndex, endIndex) => set((state) => {
      const workout = state.program.workouts.find(w => w.id === workoutId);
      if (workout) {
        const excs = workout.exercises;
        const [removed] = excs.splice(startIndex, 1);
        excs.splice(endIndex, 0, removed);
        excs.forEach((e, idx) => { e.order = idx + 1; });
      }
    }),

    sd_addSet: (workoutId, exerciseId) => set((state) => {
      const workout = state.program.workouts.find(w => w.id === workoutId);
      if (workout) {
        const ex = workout.exercises.find(e => e.id === exerciseId);
        if (ex) {
          // Копируем структуру последнего сета с новыми ID, или ставим дефолт
          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet: sd_SetData = lastSet 
            ? { ...lastSet, id: createId() } 
            : { id: createId(), reps: '10', weight: '0' };
          ex.sets.push(newSet);
        }
      }
    }),

    sd_updateSetField: (workoutId, exerciseId, setId, field, value) => set((state) => {
      const workout = state.program.workouts.find(w => w.id === workoutId);
      if (workout) {
        const ex = workout.exercises.find(e => e.id === exerciseId);
        if (ex) {
          const s = ex.sets.find(s => s.id === setId);
          if (s) {
            s[field] = value;
          }
        }
      }
    }),

    sd_removeSet: (workoutId, exerciseId, setId) => set((state) => {
      const workout = state.program.workouts.find(w => w.id === workoutId);
      if (workout) {
        const ex = workout.exercises.find(e => e.id === exerciseId);
        if (ex) {
          ex.sets = ex.sets.filter(s => s.id !== setId);
        }
      }
    })
  }))
);
