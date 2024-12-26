'use client';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useGlobalStore } from '@/lib/store/globalstore';
import { useShallow } from 'zustand/shallow';
import { CreateTranscriptionForm } from './components/create.transcription';

export default function Dashboard() {
  const [showCreateTranscriptionModal, setShowCreateTranscriptionModal] =
    useGlobalStore(
      useShallow((state) => [
        state.showCreateTranscriptionModal,
        state.setShowCreateTranscriptionModal,
      ]),
    );

  return (
    <div className="flex flex-col flex-1 items-center md:pt-[125px] gap-4 bg-background text-foreground p-4">
      <Modal
        isOpen={showCreateTranscriptionModal}
        onClose={() => setShowCreateTranscriptionModal(false)}
        title="Create new transcription"
        description="Create a new transcription by recording audio."
      >
        <div className="flex justify-start">
          <CreateTranscriptionForm />
        </div>
      </Modal>
      <img
        width={400}
        src="/assets/select_transcription.svg"
        alt="select transcription"
      />
      {/* <h3 className="text-base font-thin">Select a transcription on the left or create a new one</h3> */}
      <h3 className="text-base font-thin">
        Velg en transkripsjon til venstre eller opprett en ny
      </h3>
      <Button
        onClick={() => setShowCreateTranscriptionModal(true)}
        //  to="/transcriptions/new"
        size="sm"
      >
        Opprett ny transkripsjon
      </Button>
    </div>
  );
}
