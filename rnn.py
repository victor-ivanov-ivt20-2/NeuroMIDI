import mido
import os
import numpy as np
import json
from midiAnalyzer import Midi
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, LSTM, Dense, Embedding
from tensorflow.keras.optimizers import Adam
import matplotlib.pyplot as plt

def main():
    content = os.listdir(os.getcwd() + '/midi/victhun')
    inputs = np.array([])
    midi_analyzer = Midi(mido.MidiFile( os.getcwd() + '/midi/1.mid', clip=True))
    for i in content:
        midi = mido.MidiFile( os.getcwd() + '/midi/victhun/' + i, clip=True)
        inputs = np.append(inputs, midi_analyzer.getOnlyNote(midi))
    aaaa = []
    for i in inputs:
        aaaa.append(int(i))
    
    vocab = set(aaaa)
    char_to_index = {char_ :ind for ind, char_  in enumerate (vocab)}
    ind_to_char = list(vocab)
    with open(os.getcwd() + '/midi/victhun.txt', 'w') as fw:
        json.dump(ind_to_char, fw)
    text_as_int = np.array([char_to_index[c] for c in aaaa])
    seq_length = 100
    step = 10
    sequences = np.array([text_as_int[i:i+seq_length+1] for i in range(0, len(text_as_int)-seq_length-1,step)])
    input_text = np.array([seq[:-1] for seq in sequences])
    target_text = np.array([seq[1:] for seq in sequences])
    vocab_size = len(vocab)
    
    #new value
    embedding_dim = 256*2
    rnn_units = 1024*2

    x = Input(shape=(seq_length,))
    e = Embedding(vocab_size, embedding_dim)(x)
    l = LSTM(rnn_units, return_sequences=True)(e)
    d = Dense(vocab_size, activation='softmax')(l)
    model = Model(inputs=x, outputs=d)
    model.summary()
    model.compile(optimizer=Adam(), loss='sparse_categorical_crossentropy')
    EP = 5
    BS = 128
    hist = model.fit(input_text, target_text, batch_size=BS, epochs=EP)
    model.save(os.getcwd() + '/h5/victhun.h5')
    new_song = generate_text(model, seq_length, ind_to_char, 32)
    input_midi = mido.MidiFile( os.getcwd() + '/midi/1.mid', clip=True)
    mid = Midi(input_midi)
    mid.generateMelody(new_song, 0)

def generate_text(model, seq_length, ind_to_char, generation_length=100):
    input_eval = np.array([0])
    x = np.zeros((1, seq_length))
    x[0,-len(input_eval):] = input_eval[:]
    generated_notes = []

    model.reset_states()
    for i in range(generation_length):
        predictions = model.predict(x)[0,-1] 
        predictions = predictions.astype(np.float64)
        predictions = predictions/np.sum(predictions)    
        predicted_id = np.argmax(np.random.multinomial(1, predictions))
        x[0,:-1] = x[0,1:]
        x[0,-1] = predicted_id
        generated_notes.append(ind_to_char[predicted_id]) 
    return generated_notes

if __name__ == '__main__':
    main()