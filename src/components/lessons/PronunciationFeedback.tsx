import React from "react";

type PronunciationFeedbackProps = {
    data: { word: string; chars: { char: string; isCorrect: boolean }[] }[];
};

const PronunciationFeedback: React.FC<PronunciationFeedbackProps> = ({ data }) => {
    return (
        <div className="inline-block text-2xl leading-relaxed font-medium tracking-wide">
            {data.map((wordObj, wordIndex) => (
                <span key={wordIndex} className="inline">
                    {wordObj.chars.map((charObj, charIndex) => (
                        <span
                            key={charIndex}
                            className={
                                charObj.isCorrect
                                    ? "text-green-600"
                                    : "text-red-600"
                            }
                        >
                            {charObj.char}
                        </span>
                    ))}
                    {wordIndex < data.length - 1 && " "}
                </span>
            ))}
        </div>
    );
};

export default PronunciationFeedback; 