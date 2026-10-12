use ch04_drill::take_and_give_back;

#[test]
fn take_and_give_back_appends_world() {
    let s = String::from("hello");
    let s2 = take_and_give_back(s);
    assert_eq!(s2, "hello world");
}
