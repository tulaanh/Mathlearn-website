"use client";

import { chuanHoaChu, VIETNAMESE_LETTERS } from "@/lib/treoco-words";

type Props = {
  revealedLetters: string[];
  wrongLetters: string[];
  disabled: boolean;
  onGuess: (letter: string) => void;
};

/** Bàn phím 29 chữ cái tiếng Việt: đoán đúng miễn phí, đoán sai mất 1 lượt. */
export default function TreoCoKeyboard({ revealedLetters, wrongLetters, disabled, onGuess }: Props) {
  const revealedSet = new Set(revealedLetters.map(chuanHoaChu));
  const wrongSet = new Set(wrongLetters.map(chuanHoaChu));

  return (
    <div>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
        {VIETNAMESE_LETTERS.map((letter) => {
          const isRevealed = revealedSet.has(letter);
          const isWrong = wrongSet.has(letter);
          const isDisabled = disabled || isRevealed || isWrong;
          let style =
            "border-slate-200 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300";
          if (isRevealed) {
            style =
              "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
          } else if (isWrong) {
            style =
              "border-rose-200 bg-rose-50 text-rose-400 line-through dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-500";
          }
          return (
            <button
              key={letter}
              type="button"
              disabled={isDisabled}
              onClick={() => onGuess(letter)}
              aria-label={`Đoán chữ ${letter}`}
              className={`flex h-11 items-center justify-center rounded-lg border-2 text-sm font-bold transition-colors ${style} ${
                isDisabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
        Đoán đúng: miễn phí · Đoán sai: mất 1 lượt và thêm 1 nét lên hình
      </p>
    </div>
  );
}
