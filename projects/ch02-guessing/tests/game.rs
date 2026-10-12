use ch02_guessing::{Game, Outcome, parse_guess};

#[test]
fn too_low_and_too_high() {
    let mut g = Game::new(50, 5);
    assert_eq!(g.guess(10), Outcome::TooLow);
    assert_eq!(g.guess(90), Outcome::TooHigh);
}

#[test]
fn correct_guess_wins() {
    let mut g = Game::new(50, 5);
    assert_eq!(g.guess(50), Outcome::Correct);
}

#[test]
fn every_guess_costs_a_try() {
    let mut g = Game::new(50, 3);
    assert_eq!(g.tries_left(), 3);
    g.guess(1);
    assert_eq!(g.tries_left(), 2);
}

#[test]
fn last_wrong_guess_is_out_of_tries() {
    let mut g = Game::new(50, 2);
    assert_eq!(g.guess(1), Outcome::TooLow);
    assert_eq!(g.guess(99), Outcome::OutOfTries);
}

#[test]
fn correct_on_the_last_try_still_wins() {
    let mut g = Game::new(50, 2);
    g.guess(1);
    assert_eq!(g.guess(50), Outcome::Correct);
}

#[test]
fn parse_accepts_whitespace_and_newline() {
    assert_eq!(parse_guess(" 42\n"), Ok(42));
}

#[test]
fn parse_rejects_garbage_with_a_message() {
    assert!(parse_guess("abc").is_err());
    assert!(parse_guess("").is_err());
    assert!(parse_guess("-5").is_err());
}
