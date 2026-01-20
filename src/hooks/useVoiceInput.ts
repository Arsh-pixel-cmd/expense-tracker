import { useState, useEffect, useCallback } from 'react';

interface VoiceInputState {
    isListening: boolean;
    transcript: string;
    interimTranscript: string;
    error: string | null;
}

interface VoiceInputActions {
    startListening: () => void;
    stopListening: () => void;
    reset: () => void;
    isSupported: boolean;
}

export const useVoiceInput = (): VoiceInputState & VoiceInputActions => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognitionInstance = new SpeechRecognition();
                recognitionInstance.continuous = false; // Changed to false for better stability with one-shot commands
                recognitionInstance.interimResults = true;
                recognitionInstance.lang = 'en-US'; // Default to English

                recognitionInstance.onstart = () => {
                    console.log("[VoiceInput] Recognition started");
                    setIsListening(true);
                    setError(null);
                };

                recognitionInstance.onend = () => {
                    console.log("[VoiceInput] Recognition ended");
                    // We don't automatically set isListening to false here if we want to support 
                    // a more robust multi-shot, but for one-shot it's fine.
                    // However, we should check if it was an intentional stop.
                    setIsListening(false);
                };

                recognitionInstance.onerror = (event: any) => {
                    console.error("[VoiceInput] Recognition error:", event.error);

                    if (event.error === 'no-speech') {
                        // Ignore no-speech errors to avoid annoying toast, 
                        // just stop listening.
                        setIsListening(false);
                        return;
                    }

                    setError(event.error);
                    setIsListening(false);
                };

                recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
                    console.log("[VoiceInput] Result received", event.results);
                    let final = '';
                    let interim = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            final += event.results[i][0].transcript;
                        } else {
                            interim += event.results[i][0].transcript;
                        }
                    }

                    if (final) {
                        setTranscript((prev) => prev + (prev ? ' ' : '') + final);
                    }
                    setInterimTranscript(interim);
                };

                setRecognition(recognitionInstance);

                return () => {
                    recognitionInstance.abort();
                };
            } else {
                setError('Speech recognition is not supported in this browser.');
            }
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            try {
                recognition.start();
            } catch (e) {
                console.error("Failed to start recognition:", e);
            }
        }
    }, [recognition, isListening]);

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop();
        }
    }, [recognition, isListening]);

    const reset = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setError(null);
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        error,
        startListening,
        stopListening,
        reset,
        isSupported: !!recognition,
    };
};
