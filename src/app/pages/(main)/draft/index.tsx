// src/components/draft.tsx
// import SpeechToTextInterface from './components/SpeechToTextInterface'
import SpeechToTextInterface from './components/SpeechToTextInterfacebk_4'
// import SpeechToTextInterface from './components/STI.Min'

interface DraftProps {
  draft_id: string;
}
const Draft = ({ draft_id }: DraftProps) => {

  return (
    <SpeechToTextInterface draftId={draft_id} />
  );
};

export default Draft;



// <div className="flex justify-center mb-4">
// {isRecording && !isPaused && <WaveformAnimation />}
// </div>