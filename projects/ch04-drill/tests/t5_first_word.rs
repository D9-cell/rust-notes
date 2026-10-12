use ch04_drill::first_word;

#[test]
fn first_word_of_a_sentence() {
    let s = String::from("hello world");
    assert_eq!(first_word(&s), "hello");
}

#[test]
fn first_word_of_a_single_word_and_empty() {
    assert_eq!(first_word("single"), "single");
    assert_eq!(first_word(""), "");
}

#[test]
fn first_word_accepts_a_string_and_a_literal() {
    let owned = String::from("a b");
    assert_eq!(first_word(&owned), "a");
    assert_eq!(first_word("c d"), "c");
}
