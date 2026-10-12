use ch09_parser::*;
use std::collections::HashMap;

#[test]
fn parses_a_good_line() {
    assert_eq!(parse_line("port = 8080", 1), Ok(("port".to_string(), 8080)));
    assert_eq!(parse_line("  retries=3  ", 1), Ok(("retries".to_string(), 3)));
    assert_eq!(parse_line("delta = -4", 1), Ok(("delta".to_string(), -4)));
}

#[test]
fn reports_missing_equals_with_line_number() {
    assert_eq!(parse_line("just words", 4), Err(ParseError::MissingEquals(4)));
}

#[test]
fn reports_empty_key() {
    assert_eq!(parse_line("= 5", 2), Err(ParseError::EmptyKey(2)));
}

#[test]
fn reports_bad_number_with_the_parse_error() {
    let err = parse_line("port = eighty", 9).unwrap_err();
    match err {
        ParseError::BadNumber(line, _) => assert_eq!(line, 9),
        other => panic!("wrong error: {other:?}"),
    }
}

#[test]
fn parses_a_config_skipping_comments_and_blanks() {
    let text = "# server\nport = 80\n\nworkers = 4\n";
    let cfg = parse_config(text).unwrap();
    assert_eq!(cfg.len(), 2);
    assert_eq!(cfg["port"], 80);
    assert_eq!(cfg["workers"], 4);
}

#[test]
fn config_error_carries_the_right_line_number() {
    let text = "a = 1\nb = 2\noops\nc = 3";
    assert_eq!(parse_config(text), Err(ParseError::MissingEquals(3)));
}

#[test]
fn duplicate_keys_are_an_error() {
    let text = "a = 1\nb = 2\na = 3";
    assert_eq!(parse_config(text), Err(ParseError::DuplicateKey("a".to_string())));
}

#[test]
fn get_or_returns_default_for_missing() {
    let mut cfg = HashMap::new();
    cfg.insert("a".to_string(), 1);
    assert_eq!(get_or(&cfg, "a", 9), 1);
    assert_eq!(get_or(&cfg, "zzz", 9), 9);
}

#[test]
fn checked_total_detects_overflow() {
    let mut cfg = HashMap::new();
    cfg.insert("a".to_string(), 2);
    cfg.insert("b".to_string(), 3);
    assert_eq!(checked_total(&cfg), Some(5));
    cfg.insert("c".to_string(), i32::MAX);
    assert_eq!(checked_total(&cfg), None);
    assert_eq!(checked_total(&HashMap::new()), Some(0));
}
