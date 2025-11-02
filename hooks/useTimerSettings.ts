import { ActivityType } from '../types';
import useLocalStorage from './useLocalStorage';

export type TimerSettings = {
  [key in ActivityType]?: number; // Duration in minutes
};

const defaultTimerSettings: TimerSettings = {
  [ActivityType.Writing]: 30,
  [ActivityType.Editing]: 30,
  [ActivityType.Research]: 60,
  [ActivityType.Planning]: 15,
  [ActivityType.Review]: 15,
  [ActivityType.Setup]: 15,
};

const useTimerSettings = (): [TimerSettings, (value: TimerSettings | ((val: TimerSettings) => TimerSettings)) => void] => {
  const [settings, setSettings] = useLocalStorage<TimerSettings>('writetrack-timer-settings', defaultTimerSettings);
  return [settings, setSettings];
};

export default useTimerSettings;
