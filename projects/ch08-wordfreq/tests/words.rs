use ch08_wordfreq::*;

#[test]
fn counts_ignore_case_and_punctuation() {
    let counts = count_words("The cat. The dog! the END, cat?");
    assert_eq!(counts["the"], 3);
    assert_eq!(counts["cat"], 2);
    assert_eq!(counts["dog"], 1);
    assert_eq!(counts["end"], 1);
    assert_eq!(counts.len(), 4);
}

#[test]
fn empty_text_has_no_words() {
    assert!(count_words("").is_empty());
    assert!(count_words("  ... !!  ").is_empty());
}

#[test]
fn top_n_orders_by_count_then_name() {
    let counts = count_words("b b a a c d d d");
    assert_eq!(top_n(&counts, 2), vec![("d".to_string(), 3), ("a".to_string(), 2)]);
    assert_eq!(top_n(&counts, 10).len(), 4);
    assert_eq!(top_n(&counts, 0), vec![]);
}

#[test]
fn initials_work_on_characters_not_bytes() {
    assert_eq!(initials("hello wide world"), vec!['h', 'w', 'w']);
    assert_eq!(initials("éclair ñandú"), vec!['é', 'ñ']);
    assert_eq!(initials("   "), Vec::<char>::new());
}

#[test]
fn pig_latin_rules() {
    assert_eq!(pig_latin("first"), "irst-fay");
    assert_eq!(pig_latin("apple"), "apple-hay");
    assert_eq!(pig_latin("Eat"), "Eat-hay");
    assert_eq!(pig_latin(""), "");
}

#[test]
fn pig_latin_handles_multibyte_first_letter() {
    assert_eq!(pig_latin("ñandú"), "andú-ñay");
}

#[test]
fn median_and_mode() {
    assert_eq!(median_mode(&[3, 1, 2, 2, 5]), Some((2.0, 2)));
    assert_eq!(median_mode(&[1, 2, 3, 4]), Some((2.5, 1)));
    assert_eq!(median_mode(&[7]), Some((7.0, 7)));
    assert_eq!(median_mode(&[]), None);
}

#[test]
fn median_mode_does_not_modify_input() {
    let v = vec![5, 4, 3];
    let _ = median_mode(&v);
    assert_eq!(v, vec![5, 4, 3]);
}
