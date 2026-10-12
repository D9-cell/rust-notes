use ch04_drill::double;

#[test]
fn double_does_not_consume_a_number() {
    let n = 5;
    assert_eq!(double(n), 10);
    assert_eq!(n, 5);
}
