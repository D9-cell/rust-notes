use std::collections::HashMap;

// Counts words case-insensitively, trimming punctuation from both ends of each word.
pub fn count_words(text: &str) -> HashMap<String, usize> {
    todo!()
}

// Returns the n most frequent words, highest count first, ties broken alphabetically.
pub fn top_n(counts: &HashMap<String, usize>, n: usize) -> Vec<(String, usize)> {
    todo!()
}

// Returns the first character of each whitespace-separated word, as characters, not bytes.
pub fn initials(text: &str) -> Vec<char> {
    todo!()
}

// Pig Latin: a word starting with a vowel gets "-hay"; otherwise the first letter moves to the end plus "-ay".
pub fn pig_latin(word: &str) -> String {
    todo!()
}

// Returns (median, mode) of the numbers, or None for an empty slice; ties for mode pick the smaller value.
pub fn median_mode(numbers: &[i32]) -> Option<(f64, i32)> {
    todo!()
}
