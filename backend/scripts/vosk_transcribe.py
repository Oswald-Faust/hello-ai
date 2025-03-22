#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de transcription audio utilisant Vosk
Ce script prend un fichier audio en entrée et produit une transcription textuelle.
"""

import sys
import os
import wave
import json
import argparse
from vosk import Model, KaldiRecognizer, SetLogLevel

def transcribe_audio(audio_file, model_dir):
    """
    Transcrit un fichier audio en texte en utilisant Vosk
    
    Args:
        audio_file (str): Chemin vers le fichier audio à transcrire
        model_dir (str): Chemin vers le modèle Vosk
        
    Returns:
        str: Texte transcrit
    """
    # Désactiver les logs de Vosk
    SetLogLevel(-1)
    
    if not os.path.exists(model_dir):
        print(f"Error: Model directory {model_dir} does not exist", file=sys.stderr)
        return ""
    
    if not os.path.exists(audio_file):
        print(f"Error: WAV file {audio_file} does not exist", file=sys.stderr)
        return ""
    
    try:
        model = Model(model_dir)
        
        wf = wave.open(audio_file, "rb")
        if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getcomptype() != "NONE":
            print("Audio file must be WAV format mono PCM.", file=sys.stderr)
            return ""
            
        rec = KaldiRecognizer(model, wf.getframerate())
        rec.SetWords(True)
        
        results = []
        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if rec.AcceptWaveform(data):
                part_result = json.loads(rec.Result())
                if 'text' in part_result and part_result['text'].strip():
                    results.append(part_result.get('text', ''))
        
        part_result = json.loads(rec.FinalResult())
        if 'text' in part_result and part_result['text'].strip():
            results.append(part_result.get('text', ''))
        
        # Combine all parts
        transcription = ' '.join(results).strip()
        return transcription
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return ""

def main():
    """Fonction principale qui parse les arguments et lance la transcription"""
    parser = argparse.ArgumentParser(description='Transcription audio avec Vosk')
    parser.add_argument('audio_file', help='Chemin vers le fichier audio à transcrire')
    parser.add_argument('--model', help='Chemin vers le modèle Vosk', 
                        default=os.environ.get('VOSK_MODEL_DIR', 'models/vosk-model-fr'))
    parser.add_argument('--lang', help='Code de langue', default='fr')
    
    args = parser.parse_args()
    
    # Effectuer la transcription
    transcript = transcribe_audio(args.audio_file, args.model)
    
    # Afficher le résultat (sera capturé par Node.js)
    print(transcript)

if __name__ == "__main__":
    main() 