"use client";

import { useEffect, useRef, useState } from "react";

type SpeechRecognitionAlternative = {
  transcript: string;
};

type SpeechRecognitionResult = {
  readonly isFinal?: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
};

type SpeechRecognitionResultList = {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionEvent = Event & {
  resultIndex?: number;
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionInstance = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

function getSpeechRecognition() {
  if (typeof window === "undefined") {
    return null;
  }

  const speechWindow = window as SpeechWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

function readTranscript(event: SpeechRecognitionEvent) {
  let finalTranscript = "";
  let interimTranscript = "";
  const startIndex = event.resultIndex ?? event.results.length - 1;

  for (let index = startIndex; index < event.results.length; index++) {
    const result = event.results[index];
    const transcript = result[0]?.transcript ?? "";
    if (result.isFinal === false) {
      interimTranscript += transcript;
    } else {
      finalTranscript += transcript;
    }
  }

  return (finalTranscript || interimTranscript).trim();
}

export function useSpeechTranscription({
  lang = "bn-BD",
  unsupportedMessage,
  stoppedMessage,
}: {
  lang?: string;
  stoppedMessage: string;
  unsupportedMessage: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setIsSupported(Boolean(getSpeechRecognition()));
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  function stop() {
    recognitionRef.current?.stop();
  }

  function start(onTranscript: (transcript: string) => void) {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError(unsupportedMessage);
      setIsListening(false);
      return false;
    }

    setError(null);
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.onresult = (event) => {
      const transcript = readTranscript(event);
      if (transcript) {
        onTranscript(transcript);
      }
    };
    recognition.onerror = () => {
      setError(stoppedMessage);
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    setIsListening(true);
    recognition.start();
    return true;
  }

  function toggle(onTranscript: (transcript: string) => void) {
    if (isListening) {
      stop();
      return false;
    }

    return start(onTranscript);
  }

  return {
    error,
    isListening,
    isSupported,
    start,
    stop,
    toggle,
  };
}
