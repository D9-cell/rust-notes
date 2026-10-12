#[derive(Debug, PartialEq)]
pub enum Outcome {
    TooLow,
    TooHigh,
    Correct,
    OutOfTries,
}

pub struct Game {}

impl Game {
    // Starts a game with a secret number and a maximum number of wrong guesses allowed.
    pub fn new(secret: u32, max_tries: u32) -> Game {
        todo!()
    }

    // Judges one guess and uses up a try; the last wrong guess returns OutOfTries.
    pub fn guess(&mut self, n: u32) -> Outcome {
        todo!()
    }

    // How many tries remain.
    pub fn tries_left(&self) -> u32 {
        todo!()
    }
}

// Turns a line typed by the user into a number, or a message explaining why not.
pub fn parse_guess(input: &str) -> Result<u32, String> {
    todo!()
}
