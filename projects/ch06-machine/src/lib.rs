#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Light {
    Red,
    Green,
    Yellow,
}

#[derive(Debug, PartialEq)]
pub enum Command {
    Go,
    Stop,
    Wait(u32),
    Say(String),
}

impl Light {
    // Returns the light that follows this one: Red, Green, Yellow, Red, and so on.
    pub fn next(self) -> Light {
        todo!()
    }

    // Seconds this light stays on: Red 30, Green 25, Yellow 5.
    pub fn seconds(&self) -> u32 {
        todo!()
    }
}

// Parses "go", "stop", "wait 7" or "say hello world"; anything else is None.
pub fn parse_command(input: &str) -> Option<Command> {
    todo!()
}

// Applies a command to a light: Go gives Green, Stop gives Red, others leave it unchanged.
pub fn apply(light: Light, command: &Command) -> Light {
    todo!()
}

// Total seconds a run of commands waits: the sum of every Wait(n), zero for the rest.
pub fn total_wait(commands: &[Command]) -> u32 {
    todo!()
}
