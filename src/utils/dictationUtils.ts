// Các hàm xử lý logic cho Dictation Lesson
import { Character, WordComparison } from "../types/dictationTypes"

// Levenshtein distance calculation
export const levenshteinDistance = (str1: string, str2: string): number => {
    const m = str1.length
    const n = str2.length
    const dp: number[][] = Array(m + 1)
        .fill(null)
        .map(() => Array(n + 1).fill(0))

    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j - 1] + 1, // substitution
                    dp[i - 1][j] + 1, // deletion
                    dp[i][j - 1] + 1 // insertion
                )
            }
        }
    }
    return dp[m][n]
}

// Find closest matching word
export const findClosestWord = (word: string, wordList: string[]): string => {
    let minDistance = Infinity
    let closestWord = ""

    for (const target of wordList) {
        const distance = levenshteinDistance(
            word.toLowerCase(),
            target.toLowerCase()
        )
        if (distance < minDistance) {
            minDistance = distance
            closestWord = target
        }
    }

    return closestWord
}

// Hàm tạo character-level alignment sử dụng dynamic programming
export function createCharacterAlignment(
    userWord: string,
    correctWord: string
): Character[] {
    const m = userWord.length
    const n = correctWord.length

    // Handle edge cases
    if (m === 0) {
        return correctWord.split("").map(char => ({
            char: "_",
            status: "missing" as const,
            isCorrect: false,
            correctChar: char,
        }))
    }

    if (n === 0) {
        return userWord.split("").map(char => ({
            char: char,
            status: "extra" as const,
            isCorrect: false,
        }))
    }

    // Tạo bảng DP để tính edit distance và track operations
    const dp: number[][] = Array(m + 1)
        .fill(null)
        .map(() => Array(n + 1).fill(0))

    // Khởi tạo hàng đầu và cột đầu
    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j

    // Tính edit distance
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (userWord[i - 1] === correctWord[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j - 1] + 1, // substitution
                    dp[i - 1][j] + 1, // deletion
                    dp[i][j - 1] + 1 // insertion
                )
            }
        }
    }

    // Truy vết để tạo alignment
    const alignment: Character[] = []
    let i = m,
        j = n

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && userWord[i - 1] === correctWord[j - 1]) {
            // Match
            alignment.unshift({
                char: userWord[i - 1],
                status: "correct",
                isCorrect: true,
            })
            i--
            j--
        } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
            // Substitution
            alignment.unshift({
                char: userWord[i - 1],
                status: "incorrect",
                isCorrect: false,
                correctChar: correctWord[j - 1],
            })
            i--
            j--
        } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
            // Deletion (extra character in user input)
            alignment.unshift({
                char: userWord[i - 1],
                status: "extra",
                isCorrect: false,
            })
            i--
        } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
            // Insertion (missing character)
            alignment.unshift({
                char: "_",
                status: "missing",
                isCorrect: false,
                correctChar: correctWord[j - 1],
            })
            j--
        }
    }

    return alignment
}

// Enhanced word comparison with character-level analysis
export const compareWordsDetailed = (userText: string, correctText: string) => {
    // Normalize: remove punctuation and lowercase
    const normalize = (str: string) =>
        str
            .toLowerCase()
            .replace(/[.,!?;:'"()\[\]{}]/g, "")
            .trim()
    const userWords = normalize(userText)
        .split(/\s+/)
        .filter(word => word.length > 0)
    const correctWords = normalize(correctText)
        .split(/\s+/)
        .filter(word => word.length > 0)

    const result = []
    const usedCorrectIndexes = new Set()

    for (let i = 0; i < userWords.length; i++) {
        const userWord = userWords[i]
        let bestIdx = -1
        // Ưu tiên ghép prefix
        for (let j = 0; j < correctWords.length; j++) {
            if (usedCorrectIndexes.has(j)) continue
            if (correctWords[j].startsWith(userWord)) {
                bestIdx = j
                break
            }
        }
        // Nếu không có prefix, ưu tiên substring
        if (bestIdx === -1) {
            let substringIndexes = []
            for (let j = 0; j < correctWords.length; j++) {
                if (usedCorrectIndexes.has(j)) continue
                if (correctWords[j].includes(userWord)) {
                    substringIndexes.push(j)
                }
            }
            if (substringIndexes.length > 0) {
                // Ưu tiên từ dài nhất nếu có nhiều
                bestIdx = substringIndexes.reduce((a, b) =>
                    correctWords[a].length >= correctWords[b].length ? a : b
                )
            }
        }
        // Nếu không có substring, tìm Levenshtein nhỏ nhất, nếu trùng thì chọn từ dài nhất
        if (bestIdx === -1) {
            let minDistance = Infinity
            let candidates: number[] = []
            for (let j = 0; j < correctWords.length; j++) {
                if (usedCorrectIndexes.has(j)) continue
                const dist = levenshteinDistance(userWord, correctWords[j])
                if (dist < minDistance) {
                    minDistance = dist
                    candidates = [j]
                } else if (dist === minDistance) {
                    candidates.push(j)
                }
            }
            if (candidates.length > 0) {
                // Ưu tiên từ dài nhất nếu có nhiều
                bestIdx = candidates.reduce((a, b) =>
                    correctWords[a].length >= correctWords[b].length ? a : b
                )
            }
        }
        let correctWord = bestIdx !== -1 ? correctWords[bestIdx] : ""
        if (bestIdx !== -1) usedCorrectIndexes.add(bestIdx)

        // Sử dụng character alignment để xác định ký tự đúng cho tất cả trường hợp
        const characters = createCharacterAlignment(userWord, correctWord)

        result.push({
            userWord,
            correctWord,
            status: userWord === correctWord ? "correct" : "partial",
            characters,
        })
    }

    return result
}

// Pronunciation feedback simulation
export const simulatePronunciationFeedback = (text: string) => {
    // Remove punctuation and split into words
    const words = text.replace(/[^\w\s]/g, "").split(" ")

    // Generate random feedback (0 or 1) for each character
    let feedback = ""
    words.forEach(word => {
        for (let i = 0; i < word.length; i++) {
            feedback += Math.random() > 0.3 ? "1" : "0"
        }
        feedback += " "
    })

    return feedback.trim()
}

// Render pronunciation feedback
// Đã chuyển sang component riêng, không trả về JSX ở utils nữa
export const renderPronunciationFeedback = (text: string, feedback: string) => {
    // Để lại hàm này trả về dữ liệu đã xử lý, không trả về JSX
    const words = text.split(" ")
    let feedbackIndex = 0
    return words.map(word => {
        const chars = word.split("").map(char => {
            const isCorrect = feedback[feedbackIndex] === "1"
            feedbackIndex++
            return { char, isCorrect }
        })
        // Thêm khoảng trắng giữa các từ
        feedbackIndex++
        return { word, chars }
    })
}

// Character color helper
export const getCharacterColor = (status: string) => {
    switch (status) {
        case "correct":
            return "bg-green-100 text-green-800"
        case "incorrect":
            return "bg-red-100 text-red-800"
        case "extra":
            return "bg-purple-100 text-purple-800"
        case "missing":
            return "bg-orange-100 text-orange-800 border border-orange-300"
        default:
            return "text-slate-600"
    }
}

// Word border color helper
export const getWordBorderColor = (status: string) => {
    switch (status) {
        case "correct":
            return "border-green-300"
        case "partial":
            return "border-yellow-300"
        case "extra":
            return "border-purple-300"
        case "missing":
            return "border-gray-300"
        default:
            return "border-slate-300"
    }
}
