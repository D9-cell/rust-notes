use ch05_rectangle::Rectangle;

#[test]
fn area_and_perimeter() {
    let r = Rectangle::new(3, 4);
    assert_eq!(r.area(), 12);
    assert_eq!(r.perimeter(), 14);
}

#[test]
fn square_builds_equal_sides() {
    let s = Rectangle::square(5);
    assert!(s.is_square());
    assert_eq!(s.area(), 25);
}

#[test]
fn can_hold_needs_both_sides_larger() {
    let big = Rectangle::new(8, 7);
    let small = Rectangle::new(5, 1);
    let tall = Rectangle::new(3, 9);
    assert!(big.can_hold(&small));
    assert!(!small.can_hold(&big));
    assert!(!big.can_hold(&tall));
}

#[test]
fn can_hold_is_strict() {
    let a = Rectangle::new(4, 4);
    let b = Rectangle::new(4, 4);
    assert!(!a.can_hold(&b));
}

#[test]
fn methods_borrow_so_the_rectangle_survives() {
    let r = Rectangle::new(2, 3);
    let _ = r.area();
    let _ = r.perimeter();
    assert_eq!(r.width, 2);
}
