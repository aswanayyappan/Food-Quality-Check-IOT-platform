import { useContext } from 'react';
import { FreshTrackContext } from './FreshTrackContextDefinition';

export function useFreshTrack() {
  const context = useContext(FreshTrackContext);
  if (!context) {
    throw new Error('useFreshTrack must be used within a FreshTrackProvider');
  }
  return context;
}
