use ch04_drill::shout;

#[test]
fn shout_uppercases_and_adds_a_bang_in_place() {
    let mut s = String::from("hello");
    shout(&mut s);
    assert_eq!(s, "HELLO!");
}
