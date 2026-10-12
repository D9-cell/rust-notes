use std::collections::HashMap;
use std::num::ParseIntError;

#[derive(Debug, PartialEq)]
pub enum ParseError {
    MissingEquals(usize),
    EmptyKey(usize),
    BadNumber(usize, ParseIntError),
    DuplicateKey(String),
}

// Parses one "key = number" line into a pair; the usize is the 1-based line number for errors.
pub fn parse_line(line: &str, number: usize) -> Result<(String, i32), ParseError> {
    todo!()
}

// Parses a whole config text into a map, skipping blank lines and lines starting with '#', using ?.
pub fn parse_config(text: &str) -> Result<HashMap<String, i32>, ParseError> {
    todo!()
}

// Returns the value for key, or the default when the key is missing; never panics.
pub fn get_or(config: &HashMap<String, i32>, key: &str, default: i32) -> i32 {
    todo!()
}

// Adds up every value in the config, or None if the sum would overflow an i32.
pub fn checked_total(config: &HashMap<String, i32>) -> Option<i32> {
    todo!()
}
