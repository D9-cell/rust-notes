use ch04_drill::length;

#[test]
fn length_leaves_the_caller_usable() {
    let s = String::from("hello");
    assert_eq!(length(&s), 5);
    assert_eq!(s, "hello");
}
