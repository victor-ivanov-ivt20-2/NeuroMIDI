import mido as md
import random
import os

class Midi:
    ticks = 480
    tempo = 500000
    messages = []
    def __init__(self, input_midi):
        self.input_midi = input_midi

    def secondsToTicks(self, time, ticks, tempo):
        return int(round(md.second2tick(time, ticks, tempo)))

    def analyze(self):
        for msg in self.input_midi:
            tick = self.secondsToTicks(msg.time, self.ticks, self.tempo)
            if not msg.is_meta and (msg.type == 'note_on' or msg.type == 'note_off'):
                self.messages.append(md.Message(
                    msg.type, channel=msg.channel, note=msg.note, velocity=msg.velocity, time=tick))
            elif (msg.type == 'set_tempo'):
                self.tempo = msg.tempo
                self.messages.append(md.MetaMessage(
                    'set_tempo', tempo=self.tempo, time=tick))
            elif (msg.type == 'time_signature'):
                self.ticks = msg.numerator * 120
            print(msg)
        self.messages.append(md.MetaMessage('end_of_track', time=tick))
    
    def myMelody(self):
        n = random.randint(10, 20)
        tonal = 69
        good_notes = [tonal]
        t = tonal
        for i in range(6):
            if (i != 2 and i != 5): 
                t = t + 2
            else: 
                t = t + 1
            good_notes.append(t)
        self.messages.append(md.MetaMessage('set_tempo', tempo=self.tempo, time=0))
        for i in range(n):
            rand_tick = 120 * random.randint(1, 4)
            rand_note = random.randint(0, 6)
            self.messages.append(md.Message('note_on', note=good_notes[rand_note], time=0))
            self.messages.append(md.Message('note_off', note=good_notes[rand_note], time=rand_tick))
        self.messages.append(md.MetaMessage('end_of_track', time=0))
        return self.messages
    def addNotes(self):
        msg_len = len(self.messages)
        output_messages = []
        for i in range(msg_len):
            msg = self.messages[i]
            if not msg.is_meta:
                if msg.type == 'note_on' and msg.time != 0:
                    output_messages.append(md.Message(
                        msg.type, channel=msg.channel, note=69, velocity=100, time=0
                    ))
                    output_messages.append(md.Message(
                        "note_off", channel=msg.channel, note=69, velocity=100, time=msg.time
                    ))
                    msg.time = 0
                output_messages.append(msg)
            else:
                output_messages.append(msg)
        return output_messages
                

    def save(self):
        output_midi = md.MidiFile()
        track = md.MidiTrack()
        output_midi.tracks.append(track)
        messages = self.myMelody()
        for msg in messages:
            print(msg)
        for msg in messages:
            track.append(msg)
        output_midi.save(os.getcwd() + '/generated_midi/new_midi.mid')
        output_midi.save(os.getcwd() + '/public/new_midi.mid')