import mido
import numpy as np
import json
import os
import sys
from midi2audio import FluidSynth
from midiAnalyzer import Midi
from tensorflow.keras.models import load_model

def generate_text(model, seq_length, ind_to_char, generation_length=100):
    input_eval = np.array([0])
    x = np.zeros((1, seq_length))
    x[0,-len(input_eval):] = input_eval[:]
    note_generated = []

    model.reset_states()
    for i in range(generation_length):
        predictions = model.predict(x)[0,-1] 
        predictions = predictions.astype(np.float64)
        predictions = predictions/np.sum(predictions)    
        predicted_id = np.argmax(np.random.multinomial(1, predictions))
        x[0,:-1] = x[0,1:]
        x[0,-1] = predicted_id
        note_generated.append(ind_to_char[predicted_id]) 
    return note_generated

def main():
    model = load_model(os.getcwd() + '/h5/victhun.h5')
    ind_to_char = []
    with open(os.getcwd() + '/midi/victhun.txt', 'r') as fr:
        ind_to_char = json.load(fr)
    new_song = generate_text(model, 100, ind_to_char, 32)
    input_midi = mido.MidiFile( os.getcwd() + '/midi/victhun/1.mid', clip=True)
    mid = Midi(input_midi)
    mid.generateMelody(new_song, sys.argv)
    fs = FluidSynth()
    name = "{0}_{1}_{2}_{3}".format(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
    fs.midi_to_audio( os.getcwd() + '/generated_midi/new_midi.mid', os.getcwd() + '/public/music/' + name + '.mp3')

if __name__ == '__main__':
    main()