#[derive(Debug)]
pub struct Rectangle {
    pub width: u32,
    pub height: u32,
}

impl Rectangle {
    // Builds a rectangle from a width and a height.
    pub fn new(width: u32, height: u32) -> Self {
        todo!()
    }

    // Builds a rectangle whose sides are equal; an associated function, not a method.
    pub fn square(size: u32) -> Self {
        todo!()
    }

    // Width times height.
    pub fn area(&self) -> u32 {
        todo!()
    }

    // Sum of all four sides.
    pub fn perimeter(&self) -> u32 {
        todo!()
    }

    // True when self is strictly larger than other in both width and height.
    pub fn can_hold(&self, other: &Rectangle) -> bool {
        todo!()
    }

    // True when width equals height.
    pub fn is_square(&self) -> bool {
        todo!()
    }
}
