import mido
import sys
from midi2audio import FluidSynth
from midiAnalyzer import Midi
import os
def main():
    input_midi = mido.MidiFile( os.getcwd() + '/midi/2222.mid', clip=True)
    mid = Midi(input_midi)
    #mid.analyze()
    mid.save(sys.argv)
    fs = FluidSynth()
    name = "{0}_{1}_{2}_{3}".format(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
    fs.midi_to_audio( os.getcwd() + '/generated_midi/new_midi.mid', os.getcwd() + '/public/music/' + name + '.mp3')

if __name__ == '__main__':
    main()