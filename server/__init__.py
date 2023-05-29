import mido
from midi2audio import FluidSynth
from midiAnalyzer import Midi
import os
def main():
    input_midi = mido.MidiFile( os.getcwd() + '/midi/2222.mid', clip=True)
    mid = Midi(input_midi)
    #mid.analyze()
    mid.save()
    fs = FluidSynth()
    fs.midi_to_audio( os.getcwd() + '/generated_midi/new_midi.mid', os.getcwd() + '/public/new_mp3.mp3')

if __name__ == '__main__':
    main()